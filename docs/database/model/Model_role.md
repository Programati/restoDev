# roles

## Estructura

| Campo         | Tipo          | Nulo | Default             |
| ------------- | ------------- | ---- | ------------------- |
| `id` (PK)     | `uuid`        | No   | `gen_random_uuid()` |
| `code`        | `text`        | No   | —                   |
| `name`        | `text`        | No   | —                   |
| `description` | `text`        | Sí   | —                   |
| `is_system`   | `boolean`     | No   | `false`             |
| `is_active`   | `boolean`     | No   | `true`              |
| `created_at`  | `timestamptz` | No   | `now()`             |
| `updated_at`  | `timestamptz` | No   | `now()`             |

> Sin `created_by` ni `deleted_at`: la autoría queda en `audit_logs` y la desactivación se expresa con `is_active` (D6). `id` es interno y estable; el código técnico es `code`.

## Constraints e índices

- **Clave primaria:** `id`.
- **Unicidad:** `code` único; `lower(name)` único (índice sobre la expresión). No hay baja lógica, así que la unicidad cubre todos los registros.
- **Checks:** `code ~ '^[a-z][a-z0-9_.-]{1,49}$'`; `length(btrim(name)) BETWEEN 2 AND 60`; `length(description) <= 250`.
- **Claves foráneas:** ninguna.
- **Índices adicionales:** ninguno; los índices únicos cubren las búsquedas.

## Relaciones

- `user_roles`: 1 a N; `ON DELETE RESTRICT` desde `user_roles.role_id`. Un rol en uso no se borra.
- `role_permissions`: 1 a N; `ON DELETE CASCADE` desde `role_permissions.role_id`.
- Desactivar un rol (`is_active = false`) no borra asignaciones: sus permisos dejan de aplicarse.

## Reglas de negocio

- **Roles sembrados (D1):** solo `admin`, con `is_system = true` y todos los permisos del catálogo. `staff`, `delivery`, cajero y mesero se agregan junto con el módulo que los necesite.
- Un rol `is_system` no se borra, no cambia de `code` y no se desactiva. La regla va en un trigger `BEFORE UPDATE OR DELETE` (F5), no solo en RPC, para que no se pueda saltear por la Data API.
- Los permisos de un rol con `is_active = false` no se aplican.
- **Bajas:** no hay baja lógica con `deleted_at`; se desactiva con `is_active`. El borrado físico solo es posible para roles no `is_system` y sin asignaciones, por RPC con `roles.manage`.
- **Trazabilidad:** `updated_at` con `public.set_updated_at()`; cambios en `audit_logs` desde F4.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** usuarios autenticados con perfil activo (el panel necesita mostrar nombres de rol).
- **Inserción, actualización y borrado:** sin `GRANT` directo; solo `roles.manage` por RPC (`admin_create_role`, `admin_update_role`, `admin_delete_role`, F5). El seed lo hace la migración.
- **Validación en base de datos:** formato de `code`, longitudes y trigger de `is_system`.
- Sin permisos para `anon`; sin publicación en Realtime.

## Validaciones

- Crear un rol válido; rechazar `code` con mayúsculas, espacios o de 1 carácter.
- Rechazar `name` duplicado sin distinguir mayúsculas y `code` duplicado.
- Rechazar borrar un rol con usuarios asignados.
- Rechazar borrar, renombrar el `code` o desactivar `admin`.
- Un rol inactivo no concede permisos (`has_permission` devuelve `false`).
- RLS: usuario autenticado lee; escribir directo falla con `42501`; `anon` no lee.

## Impacto en `categories`

Ninguno directo. Las políticas de `categories` verifican permisos, no nombres de rol, así que crear roles nuevos no las toca.
