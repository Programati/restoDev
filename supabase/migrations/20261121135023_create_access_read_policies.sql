-- F2.6: políticas de lectura de las tablas de acceso (según el DER, sección 3.4).
-- Todas verifican permisos, no nombres de rol. Sin políticas de INSERT/UPDATE/DELETE:
-- las escrituras llegan por migración o RPC (D4).

-- roles: cualquier usuario autenticado con perfil activo (el panel muestra nombres de rol)
create policy "roles_select_active_users"
  on public.roles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.status = 'active'
    )
  );

-- permissions: solo quien gestiona roles
create policy "permissions_select_roles_manage"
  on public.permissions
  for select
  to authenticated
  using ((select private.has_permission('roles.manage')));

-- role_permissions: solo quien gestiona roles
create policy "role_permissions_select_roles_manage"
  on public.role_permissions
  for select
  to authenticated
  using ((select private.has_permission('roles.manage')));

-- user_roles: cada usuario ve sus propias filas; users.manage ve todas
create policy "user_roles_select_own_or_users_manage"
  on public.user_roles
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.has_permission('users.manage'))
  );

-- profiles: se suma a profiles_select_own; users.manage lee todos los perfiles
create policy "profiles_select_users_manage"
  on public.profiles
  for select
  to authenticated
  using ((select private.has_permission('users.manage')));