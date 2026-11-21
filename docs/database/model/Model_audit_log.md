# audit_logs

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
- **Checks:** `action IN ('insert','update','delete')`.
- **Claves foráneas:** `actor_id` → `auth.users(id)`; `ON DELETE SET NULL` (D3). Nunca `CASCADE`: borraría la evidencia. Es el mismo UUID que `profiles.id`, y evita depender del orden de creación de `profiles`.
- **Referencia polimórfica sin FK:** `table_name` + `record_id` apuntan al registro original a propósito, para que el historial sobreviva a su borrado.
- **Índices adicionales:** `(created_at desc)` para listar; `(table_name, record_id)` para el historial de un registro; `(actor_id)`, necesario para que el `SET NULL` de la FK no escanee la tabla.

## Relaciones

- `auth.users`: 0..1 a N. Un usuario genera muchos eventos; un evento puede no tener actor (`NULL` si actuó el servidor, una migración o un proceso sin `auth.uid()`).
- Demás tablas: lógica, vía `table_name` y `record_id`. En tablas de clave compuesta: `"user_id:role_id"` y `"role_id:permission_code"`.

## Reglas de negocio

- Auditan: `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles` y `categories`.
- `old_data` se completa en `update` y `delete`; `new_data` en `insert` y `update`.
- `actor_id = auth.uid()` al momento del evento.
- **Retención (D9):** sin purga por ahora; el volumen es bajo. Revisar la decisión antes de auditar tablas con más movimiento (por ejemplo `orders`). Si se agrega purga, requerirá una excepción explícita al `REVOKE DELETE`.
- **Datos sensibles (D9):** hoy ninguna tabla auditada tiene campos sensibles; el trigger genérico debe poder excluir columnas por tabla si aparece alguno.
- **Bajas:** el historial no se da de baja ni se edita.
- **Trazabilidad:** es la fuente de quién asignó un rol, quién cambió un permiso y cuándo.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** `audit.read`.
- **Inserción:** solo el trigger genérico `SECURITY DEFINER` (`AFTER`, para no interferir con `set_updated_at`), con `REVOKE EXECUTE` a `public`, `anon` y `authenticated`.
- **Actualización y borrado:** ninguno. Solo `GRANT SELECT`; `REVOKE UPDATE, DELETE, TRUNCATE` a todos los roles.
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

## Impacto en `categories`

Se agrega el trigger en F4; no cambian la tabla ni las Actions. Se cierra el pendiente "Registro en `audit_logs`" de los 5 contratos, las HU y `Model_category.md`.
