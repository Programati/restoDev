-- F5.7 (parte 1): revisión final de GRANT en las tablas de acceso y categories.
-- Las tablas creadas por migración reciben por defecto TRUNCATE, MAINTAIN, TRIGGER
-- y REFERENCES para anon, authenticated y service_role. TRUNCATE se salta RLS.
-- Se quita todo y se vuelve a conceder solo el mínimo necesario.
-- (audit_logs ya quedó con REVOKE ALL + GRANT select en F4.2.)

revoke all on table
  public.profiles,
  public.roles,
  public.permissions,
  public.role_permissions,
  public.user_roles,
  public.categories
from public, anon, authenticated, service_role;

-- Tablas de acceso: solo lectura (las escrituras van por migración o RPC admin_*).
grant select on table
  public.profiles,
  public.roles,
  public.permissions,
  public.role_permissions,
  public.user_roles
to authenticated;

-- categories: baja lógica, por eso sin DELETE.
grant select, insert, update on table public.categories to authenticated;
