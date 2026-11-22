-- F4.4 (parte 1): auditoría de las tablas de identidad y acceso.
-- Argumento = columnas de la clave, para armar record_id (en las compuestas se unen con ':').
-- Ninguna columna se excluye hoy (D9).

create trigger audit_profiles
  after insert or update or delete on public.profiles
  for each row execute function private.audit_log_change('id');

create trigger audit_roles
  after insert or update or delete on public.roles
  for each row execute function private.audit_log_change('id');

create trigger audit_permissions
  after insert or update or delete on public.permissions
  for each row execute function private.audit_log_change('code');

create trigger audit_role_permissions
  after insert or update or delete on public.role_permissions
  for each row execute function private.audit_log_change('role_id,permission_code');

create trigger audit_user_roles
  after insert or update or delete on public.user_roles
  for each row execute function private.audit_log_change('user_id,role_id');