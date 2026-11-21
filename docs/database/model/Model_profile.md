# profiles

## Estructura

| Campo         | Tipo             | Nulo | Default     |
| ------------- | ---------------- | ---- | ----------- |
| `id` (PK)     | `uuid`           | No   | —           |
| `full_name`   | `text`           | No   | —           |
| `phone`       | `text`           | Sí   | —           |
| `avatar_path` | `text`           | Sí   | —           |
| `status`      | `profile_status` | No   | `'pending'` |
| `created_at`  | `timestamptz`    | No   | `now()`     |
| `updated_at`  | `timestamptz`    | No   | `now()`     |

> `id` no tiene default: es el mismo UUID de la cuenta en `auth.users`. No hay `deleted_at`, `created_by` ni `updated_by`: la baja se expresa con `status` (D6) y la autoría de cada cambio queda en `audit_logs`. `email`, contraseña, último ingreso y bloqueo real viven en `auth.users` y no se copian.

Enum `profile_status`: `pending` (invitado que no completó el alta), `active` (puede operar), `inactive` (bloqueado y archivado).

## Constraints e índices

- **Clave primaria:** `id`.
- **Unicidad:** ninguna adicional.
- **Checks:** `length(btrim(full_name)) BETWEEN 2 AND 120`; `length(phone) <= 30`.
- **Claves foráneas:** `id` → `auth.users(id)`; `ON DELETE CASCADE`. Un perfil no existe sin cuenta.
- **Índices adicionales:** `(status)` para listados filtrados.

## Relaciones

- `auth.users`: 1 a 1. Un trigger `AFTER INSERT ON auth.users` crea el perfil.
- `user_roles`: 1 a N. Un usuario puede tener varios roles o ninguno.
- `audit_logs`: no hay FK. `audit_logs.actor_id` apunta a `auth.users(id)` (D3), que es el mismo UUID.

## Reglas de negocio

- Todo usuario de Auth tiene exactamente un perfil.
- El trigger crea el perfil `active`, salvo que el alta venga marcada como invitación: en ese caso nace `pending` (D7). El flujo completo de invitación queda fuera de este plan.
- Solo un perfil `active` puede ejercer permisos: `private.has_permission` lo exige.
- **Bajas:** no hay baja lógica con `deleted_at`. Dar de baja es pasar `status` a `inactive`; el borrado de la cuenta de Auth (que elimina el perfil por `CASCADE`) es excepcional.
- **Sincronización con Auth (D5, F5):** al pasar a `inactive` se pone `banned_until` en `auth.users`; al reactivar, se limpia. Se hace con la API de administración de Auth y una clave `service_role` solo de servidor, validada en `env.ts` y nunca `NEXT_PUBLIC_`. Sin esto, el estado de la aplicación no corta sesiones ni la renovación de tokens.
- **Dependencias:** no se puede inactivar ni borrar al último usuario con `admin.access` (guardia de F5).
- **Trazabilidad:** `updated_at` lo mantiene `public.set_updated_at()`. Los cambios quedan en `audit_logs` desde F4.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** cada usuario lee su propio perfil (`id = (select auth.uid())`). Quien tenga `users.manage` lee todos (política agregada en F2).
- **Inserción:** ninguna desde la API; la hace el trigger `handle_new_auth_user` (`SECURITY DEFINER`).
- **Actualización:** sin `GRANT` directo. RLS controla filas, no columnas: con un `UPDATE` directo el usuario podría reactivarse cambiando `status`. Edición de `full_name`, `phone` y `avatar_path` y cambio de `status` por RPC (D4, F5).
- **Baja:** sin `GRANT DELETE`.
- **Acceso provisional:** ninguno.
- **Validación en base de datos:** `CHECK` de longitud, enum cerrado, `REVOKE EXECUTE` de `handle_new_auth_user` a `public`, `anon` y `authenticated`. Se asume que el registro público de Auth está desactivado; si no, cualquiera que se registre obtiene un perfil `active` (sin roles no tiene permisos, pero conviene cerrarlo).
- Esta tabla no se publica en Realtime.

## Validaciones

- Crear un usuario en Auth genera su perfil con el estado esperado (`active`, o `pending` si es invitación).
- Rechazar `full_name` vacío, de 1 carácter o de más de 120; rechazar `phone` de más de 30.
- Rechazar un `status` fuera del enum.
- Borrar la cuenta de Auth elimina el perfil.
- El backfill de usuarios existentes deja `active` y un `full_name` que cumple el `CHECK`.
- RLS: un usuario lee su perfil y no el ajeno; un `UPDATE` o `INSERT` directo falla con `42501`; `anon` no lee nada.
- `updated_at` cambia al modificar la fila.
- Llamar a `handle_new_auth_user` desde la API falla.

## Impacto en `categories`

Ninguno funcional. `categories.updated_by` sigue apuntando a `auth.users(id)` (D3).
