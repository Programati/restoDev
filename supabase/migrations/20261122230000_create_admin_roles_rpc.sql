-- F6.2 (D13): RPC de escritura sobre roles y permisos de roles.
-- Todas: SECURITY DEFINER, search_path vacío, REVOKE a public y anon, GRANT a authenticated.
-- Cada RPC exige roles.manage por sí misma (la Action lo vuelve a comprobar antes).
-- Convención de errores (el Servicio los traduce):
--   42501 sin permiso (o anti-escalada de F5.4)      -> FORBIDDEN
--   P0002 rol o permiso inexistente                   -> NOT_FOUND
--   23505 code o name repetido                        -> CONFLICT
--   23514 rol del sistema / último administrador      -> CONFLICT
--   23503 rol asignado a usuarios                     -> CONFLICT

-- Helper: ¿existe al menos un administrador? (perfil active + rol is_active con admin.access)
-- Misma definición que la guardia de F5.5. Solo la usan las RPC de este archivo.
create or replace function private.has_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
    join public.roles r on r.id = ur.role_id and r.is_active
    join public.role_permissions rp
      on rp.role_id = r.id and rp.permission_code = 'admin.access'
    where p.status = 'active'
  );
$$;

revoke execute on function private.has_active_admin()
  from public, anon, authenticated, service_role;

-- admin_create_role: crea un rol activo, sin permisos y sin marca de sistema. Devuelve su id.
create or replace function public.admin_create_role(
  p_code text,
  p_name text,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not private.has_permission('roles.manage') then
    raise exception 'Se requiere roles.manage para crear roles'
      using errcode = '42501';
  end if;

  -- El code no se normaliza: roles_code_format lo rechaza si no cumple.
  insert into public.roles (code, name, description, is_system, is_active)
  values (btrim(p_code), btrim(p_name), btrim(p_description), false, true)
  returning id into v_id;

  return v_id;
end;
$$;

-- admin_update_role: actualización parcial. Un parámetro null = no se modifica.
-- Para quitar la descripción: p_set_description = true y p_description = null.
create or replace function public.admin_update_role(
  p_id uuid,
  p_name text default null,
  p_set_description boolean default false,
  p_description text default null,
  p_is_active boolean default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_had_admin boolean;
begin
  if not private.has_permission('roles.manage') then
    raise exception 'Se requiere roles.manage para modificar roles'
      using errcode = '42501';
  end if;

  if not exists (select 1 from public.roles where id = p_id) then
    raise exception 'Rol no encontrado' using errcode = 'P0002';
  end if;

  v_had_admin := private.has_active_admin();

  -- roles_protect_system (F5.3) rechaza con 23514 desactivar un rol del sistema.
  -- roles_set_updated_at actualiza updated_at.
  update public.roles
  set name        = coalesce(btrim(p_name), name),
      description = case when p_set_description then btrim(p_description) else description end,
      is_active   = coalesce(p_is_active, is_active)
  where id = p_id;

  -- Límite de la guardia de F5.5: desactivar un rol que da admin.access.
  if v_had_admin and not private.has_active_admin() then
    raise exception 'No se puede desactivar el rol del último administrador'
      using errcode = '23514';
  end if;
end;
$$;

-- admin_delete_role: borrado físico de un rol que no es del sistema y no está asignado.
create or replace function public.admin_delete_role(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_system boolean;
begin
  if not private.has_permission('roles.manage') then
    raise exception 'Se requiere roles.manage para eliminar roles'
      using errcode = '42501';
  end if;

  select is_system into v_is_system from public.roles where id = p_id;
  if not found then
    raise exception 'Rol no encontrado' using errcode = 'P0002';
  end if;

  -- Si es del sistema y además está asignado, prevalece el del sistema (ver contrato).
  if v_is_system then
    raise exception 'No se puede eliminar un rol del sistema' using errcode = '23514';
  end if;

  -- Comprobación explícita para que el rechazo no dependa del orden de los triggers de
  -- integridad. ON DELETE RESTRICT de user_roles.role_id sigue como red de seguridad.
  if exists (select 1 from public.user_roles where role_id = p_id) then
    raise exception 'El rol está asignado a usuarios' using errcode = '23503';
  end if;

  -- Sus role_permissions se eliminan en cascada.
  delete from public.roles where id = p_id;
end;
$$;

-- admin_set_role_permissions: reemplaza el conjunto completo de permisos del rol.
-- Aplica solo la diferencia, en una transacción. Idempotente: si no hay cambios, no escribe.
create or replace function public.admin_set_role_permissions(
  p_role_id uuid,
  p_permission_codes text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_codes     text[];
  v_had_admin boolean;
begin
  if not private.has_permission('roles.manage') then
    raise exception 'Se requiere roles.manage para modificar permisos de roles'
      using errcode = '42501';
  end if;

  if p_permission_codes is null then
    raise exception 'permission_codes es obligatorio' using errcode = '22023';
  end if;

  if not exists (select 1 from public.roles where id = p_role_id) then
    raise exception 'Rol no encontrado' using errcode = 'P0002';
  end if;

  -- Sin repetidos
  select coalesce(array_agg(distinct c), '{}') into v_codes
  from unnest(p_permission_codes) as c;

  -- Todos los códigos deben existir en el catálogo
  if exists (
    select 1
    from unnest(v_codes) as c
    where not exists (select 1 from public.permissions p where p.code = c)
  ) then
    raise exception 'Permiso no encontrado' using errcode = 'P0002';
  end if;

  v_had_admin := private.has_active_admin();

  -- role_permissions_protect_assignments (F5.4) rechaza con 42501 si el actor tiene este rol.
  delete from public.role_permissions
  where role_id = p_role_id
    and permission_code <> all (v_codes);

  insert into public.role_permissions (role_id, permission_code)
  select p_role_id, c
  from unnest(v_codes) as c
  where not exists (
    select 1
    from public.role_permissions rp
    where rp.role_id = p_role_id and rp.permission_code = c
  );

  -- Límite de la guardia de F5.5: quitar admin.access de un rol.
  if v_had_admin and not private.has_active_admin() then
    raise exception 'No se puede dejar al sistema sin administrador'
      using errcode = '23514';
  end if;
end;
$$;

revoke execute on function public.admin_create_role(text, text, text) from public, anon;
revoke execute on function public.admin_update_role(uuid, text, boolean, text, boolean) from public, anon;
revoke execute on function public.admin_delete_role(uuid) from public, anon;
revoke execute on function public.admin_set_role_permissions(uuid, text[]) from public, anon;

grant execute on function public.admin_create_role(text, text, text) to authenticated;
grant execute on function public.admin_update_role(uuid, text, boolean, text, boolean) to authenticated;
grant execute on function public.admin_delete_role(uuid) to authenticated;
grant execute on function public.admin_set_role_permissions(uuid, text[]) to authenticated;
