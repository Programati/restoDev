# user_roles

> Estado: implementada en la Fase 2 (migraciones `create_access_tables`, `create_authorization_functions` y `create_access_read_policies`), aplicada al proyecto de pruebas. Las protecciones anti-escalada (F5.4) y del último administrador (F5.5) están activas. Las RPC de escritura (`admin_assign_role`, `admin_remove_role`) están implementadas desde F6.2 (migración `create_admin_users_rpc`, 2026-11-22).

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
- Nadie puede asignarse ni quitarse roles a sí mismo. Lo aplica el trigger `user_roles_protect_assignments` (`BEFORE INSERT OR UPDATE OR DELETE`, función `private.protect_access_assignments`): con `auth.uid()` exige `users.manage` y rechaza tocar los propios roles con `42501`. Sin `auth.uid()` (migraciones, SQL Editor, servidor) no controla nada, por eso el seed y el alta del primer admin siguen funcionando.
- No se puede quitar el rol que da `admin.access` al último administrador (perfil `active` con rol activo). Lo aplica `user_roles_protect_last_admin` (función `private.protect_last_admin`, `BEFORE UPDATE OR DELETE`) con `23514`, para todos, incluidas migraciones y SQL Editor. Límite conocido: no cubre borrar `admin.access` de `role_permissions` ni desactivar un rol no sistema que lo tenga; lo cubren las RPC `admin_set_role_permissions` y `admin_update_role` (F6.2).
- **Primer administrador (D8):** las migraciones no siembran usuarios, porque cada entorno tiene los suyos. La primera asignación de `admin` es un SQL documentado en `docs/database/supabase-cli.md` (sección 6.2), ejecutado una vez por entorno. En el proyecto de pruebas se ejecutó el 2026-11-21 para `admin@resto.test`.
- **Bajas:** no aplica baja lógica; quitar un rol es borrar la fila.
- **Trazabilidad:** `record_id` del evento de auditoría es `"user_id:role_id"`.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** cada usuario ve sus propias filas (necesita sus roles para armar el menú); `users.manage` ve todas (política `user_roles_select_own_or_users_manage`).
- **Inserción, actualización y borrado:** sin `GRANT` directo. Las RPC (`admin_assign_role`, `admin_remove_role`, con `users.manage`) están implementadas desde F6.2 y son la vía de la app; además, migración o SQL Editor.
- **Validación en base de datos:** FK y triggers anti-escalada (F5.4) y de último administrador (F5.5).
- **GRANT:** solo `select` a `authenticated`; nada para `anon`; sin Realtime.

## Validaciones

- Asignar un rol válido; rechazar el par duplicado y referencias inexistentes.
- Rechazar borrar un rol con asignaciones.
- Borrar un perfil elimina sus asignaciones.
- Rechazar la autoasignación (`42501`) y el retiro del último admin (`23514`). Verificado en F5.4 y F5.5.
- Casos de `has_permission`: sin sesión, sin rol, perfil `inactive`, perfil `pending`, rol inactivo, admin.
- RLS: un usuario lee solo sus filas; escribir directo falla con `42501`.

**Verificado el 2026-11-21 en el proyecto de pruebas:**

- `has_permission` devuelve `true` para el admin activo y `false` en los 5 casos negativos (sin sesión, perfil `pending`, perfil `inactive`, rol inactivo, sin rol) y para un permiso inexistente. `is_admin()` es `true` para el admin.
- `authenticated` puede ejecutar la función; `anon` no puede ejecutarla ni usar el esquema `private`.
- El admin lee 1 fila de `user_roles`; un usuario sin rol lee 0; `anon` es rechazado con `42501`. Un admin con `users.manage` lee todos los `profiles` y un usuario sin rol solo el propio.

Pendiente de probar: par duplicado, referencias inexistentes, borrado de un rol con asignaciones y cascada al borrar un perfil.

## Impacto en `categories`

Ninguno directo. El usuario de pruebas ya tiene el rol `admin` y conserva el acceso a `categories` (crear una categoría se comprobó el 2026-11-21, con la política provisoria todavía activa); hay que repetirlo antes y después de retirar la política provisoria (F3).
