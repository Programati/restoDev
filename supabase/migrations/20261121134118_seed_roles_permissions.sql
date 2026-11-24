-- F2.4: seed idempotente del catálogo de permisos (D2) y del rol base admin (D1).
-- No siembra usuarios (D8): la asignación del primer admin es un SQL manual por entorno.

insert into public.permissions (code, module, name, description) values
  ('categories.read',   'categories', 'Ver categorías',
    'Leer las categorías que no están dadas de baja'),
  ('categories.manage', 'categories', 'Gestionar categorías',
    'Crear, modificar y dar de baja categorías; leer también las dadas de baja'),
  ('users.manage',      'users',      'Gestionar usuarios',
    'Ver usuarios, asignar roles y cambiar el estado de un perfil'),
  ('roles.manage',      'roles',      'Gestionar roles',
    'Crear y editar roles y sus permisos'),
  ('audit.read',        'audit',      'Consultar auditoría',
    'Consultar el registro de auditoría'),
  ('admin.access',      'admin',      'Acceder al panel',
    'Entrar al panel de administración')
on conflict (code) do nothing;

insert into public.roles (code, name, description, is_system)
values ('admin', 'Administrador', 'Acceso total al sistema', true)
on conflict (code) do nothing;

-- El rol admin recibe todos los permisos del catálogo
insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'admin'
on conflict do nothing;