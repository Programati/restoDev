# audit_logs

> Estado: implementada en la Fase 4 (migraciones `20261122001317_create_audit_logs`, `20261122001855_create_audit_trigger_function`, `20261122002030_audit_triggers_access_tables` y `20261122002343_audit_trigger_categories`), aplicada al proyecto de pruebas. Triggers activos en `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles` y `categories`.

## Estructura

| Campo        | Tipo          | Longitud                      | Nulo | Default                        |
| ------------ | ------------- | ----------------------------- | ---- | ------------------------------ |
| `id` (PK)    | `bigint`      | —                             | No   | `GENERATED ALWAYS AS IDENTITY` |
| `actor_id`   | `uuid`        | —                             | Sí   | —                              |
| `action`     | `text`        | `insert`, `update` o `delete` | No   | —                              |
| `table_name` | `text`        | —                             | No   | —                              |
| `record_id`  | `text`        | —                             | Sí   | —                              |
| `old_data`   | `jsonb`       | —                             | Sí   | —                              |
| `new_data`   | `jsonb`       | —                             | Sí   | —                              |
| `created_at` | `timestamptz` | —                             | No   | `now()`                        |

> Solo inserción. Sin `updated_at`, `deleted_at` ni `updated_by`: un evento nunca se modifica. `id` es `bigint` (orden cronológico y volumen alto) y no `uuid`.
> `table_name` y `record_id` no tienen tope: los fija el trigger a partir de la tabla auditada, y `record_id` puede ser compuesto (`"user_id:role_id"`).

## Constraints e índices

- **Clave primaria:** `id`.
- **Unicidad:** ninguna.
- **Checks:** `audit_logs_action_check` (`action IN ('insert','update','delete')`).
- **Claves foráneas:** `actor_id` → `auth.users(id)`; `ON DELETE SET NULL` (D3). Nunca `CASCADE`: borraría la evidencia. Es el mismo UUID que `profiles.id`, y evita depender del orden de creación de `profiles`.
- **Referencia polimórfica sin FK:** `table_name` + `record_id` apuntan al registro original a propósito, para que el historial sobreviva a su borrado.
- **Índices adicionales:** `audit_logs_created_at_idx` sobre `(created_at desc)` para listar; `audit_logs_table_record_idx` sobre `(table_name, record_id)` para el historial de un registro; `audit_logs_actor_id_idx` sobre `(actor_id)`, necesario para que el `SET NULL` de la FK no escanee la tabla.

## Relaciones

- `auth.users`: 0..1 a N. Un usuario genera muchos eventos; un evento puede no tener actor (`NULL` si actuó el servidor, una migración o un proceso sin `auth.uid()`).
- Demás tablas: lógica, vía `table_name` y `record_id`. En tablas de clave compuesta: `"user_id:role_id"` y `"role_id:permission_code"`.

## Reglas de negocio

- Auditan: `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles` y `categories`.
- El trigger genérico es `private.audit_log_change(claves[, excluidas])`, uno por tabla (`audit_<tabla>`), `AFTER INSERT OR UPDATE OR DELETE ... FOR EACH ROW`. El primer argumento son las columnas de la clave, que se unen con `:` para armar `record_id`; el segundo, las columnas a excluir de `old_data` y `new_data` (hoy ninguna).
- `old_data` se completa en `update` y `delete`; `new_data` en `insert` y `update`.
- `actor_id = auth.uid()` al momento del evento.
- **Baja lógica de `categories`:** es un `UPDATE` de `deleted_at`, así que se registra como `action = 'update'` (con `deleted_at` en `new_data`), no como `delete`.
- **Retención (D9):** sin purga por ahora; el volumen es bajo. Revisar la decisión antes de auditar tablas con más movimiento (por ejemplo `orders`). Si se agrega purga, requerirá una excepción explícita al `REVOKE DELETE`.
- **Datos sensibles (D9):** hoy ninguna tabla auditada tiene campos sensibles; el trigger genérico ya permite excluir columnas por tabla si aparece alguno.
- **Bajas:** el historial no se da de baja ni se edita.
- **Trazabilidad:** es la fuente de quién asignó un rol, quién cambió un permiso y cuándo.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** `audit.read` (política `audit_logs_select_audit_read`).
- **Inserción:** solo el trigger genérico `private.audit_log_change()` (`SECURITY DEFINER`, `search_path` vacío, `AFTER`, para no interferir con `set_updated_at`), con `REVOKE EXECUTE` a `public`, `anon`, `authenticated` y `service_role`.
- **Actualización y borrado:** ninguno. `REVOKE ALL` a `public`, `anon`, `authenticated` y `service_role` y luego solo `GRANT SELECT` a `authenticated`; sin permisos de `UPDATE`, `DELETE` ni `TRUNCATE` para nadie.
- Sin permisos para `anon`. **No se publica en Realtime:** expondría cambios de permisos a canales que no pasan por las RPC.
- **Validación en base de datos:** `CHECK` de `action`, ausencia de privilegios de escritura.

## Validaciones

- Insertar, modificar y dar de baja una categoría genera un evento cada vez, con el actor correcto.
- Un cambio hecho por migración o por el servidor deja `actor_id` en `NULL`.
- Los eventos de tablas de clave compuesta traen `record_id` armado y no `NULL`.
- Borrar al usuario conserva el evento y deja `actor_id` en `NULL`.
- Nadie puede editar ni borrar eventos (`42501`), ni vía `TRUNCATE`.
- Sin `audit.read` no se leen; `anon` no accede.
- La tabla no figura en la publicación de Realtime.
- El trigger no rompe el `.select()` posterior a un `insert` o `update` de `categories`.
- La función de trigger no se puede invocar desde la API (`42501`).

**Verificado el 2026-11-21 en el proyecto de pruebas:**

- Triggers de las 5 tablas de acceso activos y verificados.
- `categories`: `insert`, `update` y baja lógica con `returning` generan 3 eventos con el actor correcto; `old_data` es `NULL` solo en el `insert` y el último `update` trae `deleted_at` en `new_data`. El trigger no rompe el `.select()` posterior.
- `UPDATE` y `DELETE` sobre `audit_logs` rechazados (`42501`); llamar a `private.audit_log_change()` rechazado (`42501`); `anon` no lee `audit_logs` (`42501`).
- Ninguna de las 7 tablas (`audit_logs`, `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles` y `categories`) está en la publicación de Realtime.

**Pendiente de probar (se ejecuta en la matriz F5.8):** que un usuario sin `audit.read` lea 0 filas; que un cambio hecho desde el SQL Editor deje `actor_id` en `NULL`; que borrar un usuario conserve sus eventos con `actor_id` en `NULL`; `TRUNCATE` rechazado.

## Impacto en `categories`

Se agregó el trigger `audit_categories` en F4; no cambian la tabla ni las Actions. Se cierra el pendiente "Registro en `audit_logs`" de los 5 contratos, las HU y `Model_category.md`.
