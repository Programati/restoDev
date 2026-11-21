# user_roles

> Estado: implementada en la Fase 2 (migraciones `create_access_tables`, `create_authorization_functions` y `create_access_read_policies`), aplicada al proyecto de pruebas. Las protecciones (anti-escalada y último administrador) llegan en la Fase 5.

## Estructura

| Campo          | Tipo   | Longitud | Nulo | Default |
| -------------- | ------ | -------- | ---- | ------- |
| `user_id` (PK) | `uuid` | —        | No   | —       |
| `role_id` (PK) | `uuid` | —        | No   | —       |

> Tabla puente N:M entre usuarios y roles. Sin `assigned_by` ni `assigned_at`: ambos datos están en `audit_logs`. Si el panel llega a necesitar "tiene el rol desde…", se agrega `assigned_at` en ese momento.
> No tiene campos de texto, así que no hay longitudes que acotar.

## Constraints e índices

- **Clave primaria:** compuesta `(user_id, role_id)`; un usuario no recibe dos veces el mismo rol.
- **Unicidad:** la de la clave primaria.
- **Checks:** ninguno.
- **Claves foráneas:**
  - `user_id` → `profiles(id)`; `ON DELETE CASCADE`.
  - `role_id` → `roles(id)`; `ON DELETE RESTRICT`.
- **Índices adicionales:** `user_roles_role_id_user_id_idx` sobre `(role_id, user_id)` para listar usuarios de un rol y para la FK.

## Relaciones

- `profiles`: N a 1. Un usuario puede tener varios roles (por ejemplo `admin` y, más adelante, `delivery`) o ninguno. Borrar el perfil elimina sus asignaciones; el evento queda en `audit_logs`.
- `roles`: N a 1. Un rol en uso no se borra: hay que desasignarlo primero o desactivarlo.

## Reglas de negocio

- Cadena de autorización: `usuario → user_roles → roles → role_permissions → permissions`. Un permiso se aplica solo si el perfil está `active` y el rol tiene `is_active = true`. La resuelven `private.has_permission(code)`, `private.has_role(code)` e `private.is_admin()` (`has_role('admin')`).
- Un usuario sin filas no tiene permisos.
- Nadie puede asignarse roles a sí mismo (anti-escalada, F5). **Hasta F5 esta protección no existe.**
- No se puede quitar el rol `admin` al último usuario con `admin.access` (guardia de F5).
- **Primer administrador (D8):** las migraciones no siembran usuarios, porque cada entorno tiene los suyos. La primera asignación de `admin` es un SQL documentado en `docs/database/supabase-cli.md` (sección 6.2), ejecutado una vez por entorno. En el proyecto de pruebas se ejecutó el 2026-11-21 para `admin@resto.test`.
- **Bajas:** no aplica baja lógica; quitar un rol es borrar la fila.
- **Trazabilidad:** `record_id` del evento de auditoría es `"user_id:role_id"`.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** cada usuario ve sus propias filas (necesita sus roles para armar el menú); `users.manage` ve todas (política `user_roles_select_own_or_users_manage`).
- **Inserción, actualización y borrado:** sin `GRANT` directo; solo por RPC con `users.manage` y sin autoasignación.
- **Validación en base de datos:** FK y trigger anti-escalada y de último administrador (F5).
- **GRANT:** solo `select` a `authenticated`; nada para `anon`; sin Realtime.

## Validaciones

- Asignar un rol válido; rechazar el par duplicado y referencias inexistentes.
- Rechazar borrar un rol con asignaciones.
- Borrar un perfil elimina sus asignaciones.
- Rechazar la autoasignación y el retiro del último admin (F5).
- Casos de `has_permission`: sin sesión, sin rol, perfil `inactive`, perfil `pending`, rol inactivo, admin.
- RLS: un usuario lee solo sus filas; escribir directo falla con `42501`.

**Verificado el 2026-11-21 en el proyecto de pruebas:**

- `has_permission` devuelve `true` para el admin activo y `false` en los 5 casos negativos (sin sesión, perfil `pending`, perfil `inactive`, rol inactivo, sin rol) y para un permiso inexistente. `is_admin()` es `true` para el admin.
- `authenticated` puede ejecutar la función; `anon` no puede ejecutarla ni usar el esquema `private`.
- El admin lee 1 fila de `user_roles`; un usuario sin rol lee 0; `anon` es rechazado con `42501`. Un admin con `users.manage` lee todos los `profiles` y un usuario sin rol solo el propio.

Pendiente de probar: par duplicado, referencias inexistentes, borrado de un rol con asignaciones y cascada al borrar un perfil.

## Impacto en `categories`

Ninguno directo. El usuario de pruebas ya tiene el rol `admin` y conserva el acceso a `categories` (crear una categoría se comprobó el 2026-11-21, con la política provisoria todavía activa); hay que repetirlo antes y después de retirar la política provisoria (F3).
