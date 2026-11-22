-- F6.2 (D13, D16): RPC sobre usuarios: lectura (email y bloqueo viven en auth.users),
-- edición de perfil, estado y asignación de roles.
-- Todas: SECURITY DEFINER, search_path vacío, REVOKE a public y anon, GRANT a authenticated.
-- Cada RPC exige users.manage por sí misma (la Action lo vuelve a comprobar antes).
-- Errores (el Servicio los traduce):
--   42501 sin permiso (o anti-escalada de F5.4)  -> FORBIDDEN
--   P0002 usuario o rol inexistente              -> NOT_FOUND
--   23514 último administrador (guardia de F5.5) -> CONFLICT
--   22023 parámetro inválido (p. ej. status pending)

-- admin_list_users: lista usuarios con sus roles. Orden: full_name, email.
-- search: coincidencia parcial en full_name o email, sin distinguir mayúsculas (sí acentos);
-- %, _ y \ se tratan como texto literal.
create or replace function public.admin_list_users(
  p_search text default null,
  p_status public.profile_status default null,
  p_role_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_pattern text;
  v_result  jsonb;
begin
  if not private.has_permission('users.manage') then
    raise exception 'Se requiere users.manage para ver usuarios'
      using errcode = '42501';
  end if;

  if nullif(btrim(p_search), '') is not null then
    v_pattern := '%' || replace(replace(replace(btrim(p_search), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  select coalesce(jsonb_agg(x.item order by x.full_name, x.email), '[]'::jsonb)
  into v_result
  from (
    select
      p.full_name,
      u.email,
      jsonb_build_object(
        'id',        p.id,
        'email',     u.email,
        'full_name', p.full_name,
        'phone',     p.phone,
        'status',    p.status,
        'is_banned', (u.banned_until is not null and u.banned_until > now()),
        'roles', coalesce((
          select jsonb_agg(
                   jsonb_build_object(
                     'id', r.id, 'code', r.code, 'name', r.name, 'is_active', r.is_active
                   )
                   order by r.name
                 )
          from public.user_roles ur
          join public.roles r on r.id = ur.role_id
          where ur.user_id = p.id
        ), '[]'::jsonb)
      ) as item
    from public.profiles p
    join auth.users u on u.id = p.id
    where (p_status is null or p.status = p_status)
      and (p_role_id is null or exists (
            select 1 from public.user_roles ur
            where ur.user_id = p.id and ur.role_id = p_role_id))
      and (v_pattern is null
           or p.full_name ilike v_pattern
           or u.email::text ilike v_pattern)
  ) x;

  return v_result;
end;
$$;

-- admin_get_user: detalle de un usuario (UserDetail). P0002 si no existe.
create or replace function public.admin_get_user(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not private.has_permission('users.manage') then
    raise exception 'Se requiere users.manage para ver usuarios'
      using errcode = '42501';
  end if;

  select jsonb_build_object(
    'id',          p.id,
    'email',       u.email,
    'full_name',   p.full_name,
    'phone',       p.phone,
    'avatar_path', p.avatar_path,
    'status',      p.status,
    'is_banned',   (u.banned_until is not null and u.banned_until > now()),
    'created_at',  p.created_at,
    'roles', coalesce((
      select jsonb_agg(
               jsonb_build_object(
                 'id', r.id, 'code', r.code, 'name', r.name, 'is_active', r.is_active
               )
               order by r.name
             )
      from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = p.id
    ), '[]'::jsonb)
  )
  into v_result
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = p_user_id;

  if v_result is null then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;

  return v_result;
end;
$$;

-- admin_update_profile: actualización parcial de full_name y phone.
-- Un parámetro null = no se modifica. Para quitar el teléfono: p_set_phone = true y p_phone = null.
-- Los CHECK profiles_full_name_length y profiles_phone_length validan los límites.
create or replace function public.admin_update_profile(
  p_user_id uuid,
  p_full_name text default null,
  p_set_phone boolean default false,
  p_phone text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_permission('users.manage') then
    raise exception 'Se requiere users.manage para modificar usuarios'
      using errcode = '42501';
  end if;

  -- profiles_set_updated_at actualiza updated_at; audit_profiles registra el update.
  update public.profiles
  set full_name = coalesce(btrim(p_full_name), full_name),
      phone     = case when p_set_phone then btrim(p_phone) else phone end
  where id = p_user_id;

  if not found then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;
end;
$$;

-- admin_update_profile_status: cambia profiles.status a active o inactive.
-- pending no se puede fijar. La guardia del último administrador (F5.5) rechaza con 23514.
-- No toca banned_until: el Servicio llama después a setUserBanned (F5.2).
-- Idempotente: si ya tiene ese estado, no escribe ni audita.
create or replace function public.admin_update_profile_status(
  p_user_id uuid,
  p_status public.profile_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_permission('users.manage') then
    raise exception 'Se requiere users.manage para cambiar el estado de usuarios'
      using errcode = '42501';
  end if;

  if p_status is null or p_status = 'pending' then
    raise exception 'El estado debe ser active o inactive' using errcode = '22023';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;

  update public.profiles
  set status = p_status
  where id = p_user_id
    and status is distinct from p_status;
end;
$$;

-- admin_assign_role: asigna un rol a un usuario. Idempotente (on conflict do nothing).
-- La anti-escalada (F5.4) exige users.manage y bloquea tocar los propios roles (42501).
create or replace function public.admin_assign_role(p_user_id uuid, p_role_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_permission('users.manage') then
    raise exception 'Se requiere users.manage para asignar roles'
      using errcode = '42501';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.roles where id = p_role_id) then
    raise exception 'Rol no encontrado' using errcode = 'P0002';
  end if;

  insert into public.user_roles (user_id, role_id)
  values (p_user_id, p_role_id)
  on conflict do nothing;
end;
$$;

-- admin_remove_role: quita un rol a un usuario. Idempotente (si no lo tenía, no cambia nada).
-- La guardia de F5.5 rechaza con 23514 quitarle el rol al último administrador.
create or replace function public.admin_remove_role(p_user_id uuid, p_role_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_permission('users.manage') then
    raise exception 'Se requiere users.manage para quitar roles'
      using errcode = '42501';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.roles where id = p_role_id) then
    raise exception 'Rol no encontrado' using errcode = 'P0002';
  end if;

  delete from public.user_roles
  where user_id = p_user_id and role_id = p_role_id;
end;
$$;

revoke execute on function public.admin_list_users(text, public.profile_status, uuid) from public, anon;
revoke execute on function public.admin_get_user(uuid) from public, anon;
revoke execute on function public.admin_update_profile(uuid, text, boolean, text) from public, anon;
revoke execute on function public.admin_update_profile_status(uuid, public.profile_status) from public, anon;
revoke execute on function public.admin_assign_role(uuid, uuid) from public, anon;
revoke execute on function public.admin_remove_role(uuid, uuid) from public, anon;

grant execute on function public.admin_list_users(text, public.profile_status, uuid) to authenticated;
grant execute on function public.admin_get_user(uuid) to authenticated;
grant execute on function public.admin_update_profile(uuid, text, boolean, text) to authenticated;
grant execute on function public.admin_update_profile_status(uuid, public.profile_status) to authenticated;
grant execute on function public.admin_assign_role(uuid, uuid) to authenticated;
grant execute on function public.admin_remove_role(uuid, uuid) to authenticated;
