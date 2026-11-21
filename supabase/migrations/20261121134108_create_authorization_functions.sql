-- F2.3: esquema private y funciones de autorización.
-- El esquema private NO debe estar expuesto en la API (Settings > API > Exposed schemas).

create schema if not exists private;

-- Las políticas llaman a estas funciones como authenticated: necesita USAGE sobre el esquema
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- ¿El usuario actual tiene el permiso? Exige perfil activo, rol activo y la cadena completa:
-- user_roles -> roles -> role_permissions -> permissions
create or replace function private.has_permission(p_code text)
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
    join public.role_permissions rp on rp.role_id = r.id
    where p.id = (select auth.uid())
      and p.status = 'active'
      and rp.permission_code = p_code
  );
$$;

-- ¿El usuario actual tiene el rol (por code)? Mismas condiciones de perfil y rol activos.
create or replace function private.has_role(p_code text)
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
    where p.id = (select auth.uid())
      and p.status = 'active'
      and r.code = p_code
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('admin');
$$;

-- EXECUTE es de public por defecto: se cierra y se abre solo para authenticated
revoke execute on function private.has_permission(text) from public, anon;
revoke execute on function private.has_role(text) from public, anon;
revoke execute on function private.is_admin() from public, anon;

grant execute on function private.has_permission(text) to authenticated;
grant execute on function private.has_role(text) to authenticated;
grant execute on function private.is_admin() to authenticated;