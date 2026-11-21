# user_roles

## Estructura

| Campo          | Tipo   | Nulo | Default |
| -------------- | ------ | ---- | ------- |
| `user_id` (PK) | `uuid` | No   | —       |
| `role_id` (PK) | `uuid` | No   | —       |

> Tabla puente N:M entre usuarios y roles. Sin `assigned_by` ni `assigned_at`: ambos datos están en `audit_logs`. Si el panel llega a necesitar "tiene el rol desde…", se agrega `assigned_at` en ese momento.

## Constraints e índices

- **Clave primaria:** compuesta `(user_id, role_id)`; un usuario no recibe dos veces el mismo rol.
- **Unicidad:** la de la clave primaria.
- **Checks:** ninguno.
- **Claves foráneas:**
  - `user_id` → `profiles(id)`; `ON DELETE CASCADE`.
  - `role_id` → `roles(id)`; `ON DELETE RESTRICT`.
- **Índices adicionales:** `(role_id, user_id)` para listar usuarios de un rol y para la FK.

## Relaciones

- `profiles`: N a 1. Un usuario puede tener varios roles (por ejemplo `admin` y, más adelante, `delivery`) o ninguno. Borrar el perfil elimina sus asignaciones; el evento queda en `audit_logs`.
- `roles`: N a 1. Un rol en uso no se borra: hay que desasignarlo primero o desactivarlo.

## Reglas de negocio

- Cadena de autorización: `usuario → user_roles → roles → role_permissions → permissions`. Un permiso se aplica solo si el perfil está `active` y el rol tiene `is_active = true`.
- Un usuario sin filas no tiene permisos.
- Nadie puede asignarse roles a sí mismo (anti-escalada, F5).
- No se puede quitar el rol `admin` al último usuario con `admin.access` (guardia de F5).
- **Primer administrador (D8):** las migraciones no siembran usuarios, porque cada entorno tiene los suyos. La primera asignación de `admin` es un SQL documentado en `docs/database/supabase-cli.md`, ejecutado una vez por entorno.
- **Bajas:** no aplica baja lógica; quitar un rol es borrar la fila.
- **Trazabilidad:** `record_id` del evento de auditoría es `"user_id:role_id"`.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** cada usuario ve sus propias filas (necesita sus roles para armar el menú); `users.manage` ve todas.
- **Inserción, actualización y borrado:** sin `GRANT` directo; solo por RPC con `users.manage` y sin autoasignación.
- **Validación en base de datos:** FK y trigger anti-escalada y de último administrador (F5).
- Sin permisos para `anon`; sin Realtime.

## Validaciones

- Asignar un rol válido; rechazar el par duplicado y referencias inexistentes.
- Rechazar borrar un rol con asignaciones.
- Borrar un perfil elimina sus asignaciones.
- Rechazar la autoasignación y el retiro del último admin (F5).
- Casos de `has_permission`: sin rol, perfil `inactive`, perfil `pending`, rol inactivo, admin.
- RLS: un usuario lee solo sus filas; escribir directo falla con `42501`.

## Impacto en `categories`

Ninguno directo. El usuario de pruebas debe conservar acceso a `categories` cuando se le asigne `admin` (F2) y antes de retirar la política provisoria (F3).
