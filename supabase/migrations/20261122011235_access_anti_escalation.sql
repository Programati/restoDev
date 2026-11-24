-- F5.4: anti-escalada de privilegios en user_roles y role_permissions.
-- Si auth.uid() es NULL (migraciones, SQL Editor, servidor) no se controla nada: así el seed y
-- el alta del primer admin siguen funcionando. Si hay usuario, se exige el permiso y se bloquea
-- la autoasignación (directa o indirecta). Todos los rechazos usan 42501 (-> FORBIDDEN).

create or replace function private.protect_access_assignments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_row   record;
  v_old   record;
begin
  -- Migraciones, SQL Editor, servidor: sin controles
  if v_actor is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    v_row := old;
  else
    v_row := new;
  end if;

  if tg_table_name = 'user_roles' then
    if not private.has_permission('users.manage') then
      raise exception 'Se requiere users.manage para modificar roles de usuarios'
        using errcode = '42501';
    end if;

    -- Nadie se asigna ni se quita roles a sí mismo
    if v_row.user_id = v_actor
       or (tg_op = 'UPDATE' and old.user_id = v_actor) then
      raise exception 'No podés modificar tus propios roles'
        using errcode = '42501';
    end if;

  elsif tg_table_name = 'role_permissions' then
    if not private.has_permission('roles.manage') then
      raise exception 'Se requiere roles.manage para modificar permisos de roles'
        using errcode = '42501';
    end if;

    -- Autoasignación indirecta: no se tocan los permisos de un rol que uno mismo tiene
    if exists (
      select 1
      from public.user_roles ur
      where ur.user_id = v_actor
        and (
          ur.role_id = v_row.role_id
          or (tg_op = 'UPDATE' and ur.role_id = old.role_id)
        )
    ) then
      raise exception 'No podés modificar los permisos de un rol que tenés asignado'
        using errcode = '42501';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

-- Nadie debe poder invocarla desde la API; solo la dispara el trigger
revoke execute on function private.protect_access_assignments()
  from public, anon, authenticated, service_role;

create trigger user_roles_protect_assignments
  before insert or update or delete on public.user_roles
  for each row execute function private.protect_access_assignments();

create trigger role_permissions_protect_assignments
  before insert or update or delete on public.role_permissions
  for each row execute function private.protect_access_assignments();