# roles

> Estado: implementada en la Fase 2 (migraciones `create_access_tables`, `seed_roles_permissions` y `create_access_read_policies`), aplicada al proyecto de pruebas. El trigger de `is_system` está activo desde F5.3 (`roles_is_system_guard`). Las RPC de escritura quedan pendientes hasta la pantalla de gestión (D13).

## Estructura

| Campo         | Tipo          | Longitud | Nulo | Default             |
| ------------- | ------------- | -------- | ---- | ------------------- |
| `id` (PK)     | `uuid`        | —        | No   | `gen_random_uuid()` |
| `code`        | `text`        | 2–50     | No   | —                   |
| `name`        | `text`        | 2–60     | No   | —                   |
| `description` | `text`        | ≤ 250    | Sí   | —                   |
| `is_system`   | `boolean`     | —        | No   | `false`             |
| `is_active`   | `boolean`     | —        | No   | `true`              |
| `created_at`  | `timestamptz` | —        | No   | `now()`             |
| `updated_at`  | `timestamptz` | —        | No   | `now()`             |

> Sin `created_by` ni `deleted_at`: la autoría queda en `audit_logs` y la desactivación se expresa con `is_active` (D6). `id` es interno y estable; el código técnico es `code`.
> La longitud la aplica un `CHECK` (ver Constraints); no se usa `varchar(n)`.

## Constraints e índices

- **Clave primaria:** `id`.
- **Unicidad:** `code` único; `lower(name)` único (índice `roles_name_lower_key` sobre la expresión). No hay baja lógica, así que la unicidad cubre todos los registros.
- **Checks:** `roles_code_format` (`code ~ '^[a-z][a-z0-9_.-]{1,49}$'`, 2 a 50 caracteres); `roles_name_length` (`length(btrim(name)) BETWEEN 2 AND 60`); `roles_description_length` (`length(description) <= 250`).
- **Claves foráneas:** ninguna.
- **Índices adicionales:** ninguno; los índices únicos cubren las búsquedas.

## Relaciones

- `user_roles`: 1 a N; `ON DELETE RESTRICT` desde `user_roles.role_id`. Un rol en uso no se borra.
- `role_permissions`: 1 a N; `ON DELETE CASCADE` desde `role_permissions.role_id`.
- Desactivar un rol (`is_active = false`) no borra asignaciones: sus permisos dejan de aplicarse.

## Reglas de negocio

- **Roles sembrados (D1):** solo `admin` (nombre "Administrador"), con `is_system = true` y todos los permisos del catálogo. `staff`, `delivery`, cajero y mesero se agregan junto con el módulo que los necesite.
- Un rol `is_system` no se borra, no cambia de `code`, no se desactiva y no cambia su flag `is_system`. Lo aplica el trigger `roles_protect_system` (`BEFORE UPDATE OR DELETE`, función `private.protect_system_roles`, `SECURITY DEFINER`, `EXECUTE` revocado a todos) y rechaza con `23514`. Vale para todos, incluidas las migraciones y el SQL Editor, y no se puede saltear por la Data API. Solo protege las filas que ya eran del sistema.
- Los permisos de un rol con `is_active = false` no se aplican.
- **Bajas:** no hay baja lógica con `deleted_at`; se desactiva con `is_active`. El borrado físico solo es posible para roles no `is_system` y sin asignaciones, por RPC con `roles.manage`.
- **Trazabilidad:** `updated_at` con `public.set_updated_at()` (trigger `roles_set_updated_at`); cambios en `audit_logs` desde F4.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** usuarios autenticados con perfil activo (política `roles_select_active_users`; el panel necesita mostrar nombres de rol).
- **Inserción, actualización y borrado:** sin `GRANT` directo. Las RPC (`admin_create_role`, `admin_update_role`, `admin_delete_role`, con `roles.manage`) están **pendientes** hasta que exista la pantalla de gestión (D13); mientras tanto, solo migración o SQL Editor. El seed lo hace la migración.
- **GRANT:** solo `select` a `authenticated`; nada para `anon`.
- **Validación en base de datos:** formato de `code`, longitudes y trigger de `is_system` (F5.3).
- Sin publicación en Realtime.

## Validaciones

- Crear un rol válido; rechazar `code` con mayúsculas, espacios o de 1 carácter.
- Rechazar `name` duplicado sin distinguir mayúsculas y `code` duplicado.
- Rechazar borrar un rol con usuarios asignados.
- Rechazar borrar, renombrar el `code`, desactivar o cambiar `is_system` de un rol del sistema (`23514`). Verificado en F5.3.
- Un rol inactivo no concede permisos (`has_permission` devuelve `false`).
- RLS: usuario autenticado lee; escribir directo falla con `42501`; `anon` no lee.

**Verificado el 2026-11-21 en el proyecto de pruebas:** el seed corre dos veces sin duplicar (1 rol); un rol inactivo no concede permisos; un usuario activo sin rol lee `roles` (1 fila); `anon` es rechazado con `42501`. Pendiente de probar: los `CHECK` de formato y longitud, los duplicados de `code` y `name`, y el borrado con usuarios asignados.

## Impacto en `categories`

Ninguno directo. Las políticas de `categories` verifican permisos, no nombres de rol, así que crear roles nuevos no las toca.
