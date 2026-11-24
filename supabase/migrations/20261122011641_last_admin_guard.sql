-- F5.5: guardia del último administrador. Impide quitar el rol que da admin.access, inactivar o
-- borrar al último usuario que lo tiene. Vale para todos, incluidas las migraciones y el SQL
-- Editor: no depende de auth.uid().
-- "Administrador" = perfil active con un rol is_active que tenga el permiso admin.access.

create or replace function private.protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'user_roles' then
    -- ¿La fila que se quita le daba admin.access a un perfil activo?
    if exists (
      select 1
      from public.profiles p
      join public.roles r on r.id = old.role_id and r.is_active
      join public.role_permissions rp
        on rp.role_id = r.id and rp.permission_code = 'admin.access'
      where p.id = old.user_id
        and p.status = 'active'
    ) then
      -- ¿Queda algún administrador sin contar esa fila?
      if not exists (
        select 1
        from public.profiles p
        join public.user_roles ur on ur.user_id = p.id
        join public.roles r on r.id = ur.role_id and r.is_active
        join public.role_permissions rp
          on rp.role_id = r.id and rp.permission_code = 'admin.access'
        where p.status = 'active'
          and not (ur.user_id = old.user_id and ur.role_id = old.role_id)
      ) then
        raise exception 'No se puede quitar el rol al último administrador'
          using errcode = '23514';
      end if;
    end if;

  elsif tg_table_name = 'profiles' then
    -- Solo importa si deja de estar activo (inactivar o borrar)
    if old.status = 'active' and (tg_op = 'DELETE' or new.status <> 'active') then
      -- ¿Era administrador?
      if exists (
        select 1
        from public.user_roles ur
        join public.roles r on r.id = ur.role_id and r.is_active
        join public.role_permissions rp
          on rp.role_id = r.id and rp.permission_code = 'admin.access'
        where ur.user_id = old.id
      ) then
        -- ¿Queda otro administrador activo?
        if not exists (
          select 1
          from public.profiles p
          join public.user_roles ur on ur.user_id = p.id
          join public.roles r on r.id = ur.role_id and r.is_active
          join public.role_permissions rp
            on rp.role_id = r.id and rp.permission_code = 'admin.access'
          where p.status = 'active'
            and p.id <> old.id
        ) then
          raise exception 'No se puede inactivar ni borrar al último administrador'
            using errcode = '23514';
        end if;
      end if;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

-- Nadie debe poder invocarla desde la API; solo la dispara el trigger
revoke execute on function private.protect_last_admin()
  from public, anon, authenticated, service_role;

create trigger user_roles_protect_last_admin
  before update or delete on public.user_roles
  for each row execute function private.protect_last_admin();

create trigger profiles_protect_last_admin
  before update or delete on public.profiles
  for each row execute function private.protect_last_admin();