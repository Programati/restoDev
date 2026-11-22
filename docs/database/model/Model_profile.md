# profiles

> Estado: implementada en la Fase 1 (`20261121130112_create_profiles.sql` y `20261121130136_backfill_profiles.sql`), aplicada al proyecto de pruebas y verificada. La marca de invitación del alta (D7) viaja en `raw_app_meta_data ->> 'invited' = 'true'`.

## Estructura

| Campo         | Tipo             | Longitud | Nulo | Default     |
| ------------- | ---------------- | -------- | ---- | ----------- |
| `id` (PK)     | `uuid`           | —        | No   | —           |
| `full_name`   | `text`           | 2–120    | No   | —           |
| `phone`       | `text`           | ≤ 30     | Sí   | —           |
| `avatar_path` | `text`           | —        | Sí   | —           |
| `status`      | `profile_status` | —        | No   | `'pending'` |
| `created_at`  | `timestamptz`    | —        | No   | `now()`     |
| `updated_at`  | `timestamptz`    | —        | No   | `now()`     |

> `id` no tiene default: es el mismo UUID de la cuenta en `auth.users`. No hay `deleted_at`, `created_by` ni `updated_by`: la baja se expresa con `status` (D6) y la autoría de cada cambio queda en `audit_logs`. `email`, contraseña, último ingreso y bloqueo real viven en `auth.users` y no se copian.
> La longitud se mide tras `btrim` y la aplica un `CHECK` (ver Constraints); no se usa `varchar(n)`.

Enum `profile_status`: `pending` (invitado que no completó el alta), `active` (puede operar), `inactive` (bloqueado y archivado).

## Constraints e índices

- **Clave primaria:** `id`.
- **Unicidad:** ninguna adicional.
- **Checks:** `profiles_full_name_length` (`length(btrim(full_name)) BETWEEN 2 AND 120`); `profiles_phone_length` (`phone IS NULL OR length(phone) <= 30`).
- **Claves foráneas:** `id` → `auth.users(id)`; `ON DELETE CASCADE`. Un perfil no existe sin cuenta.
- **Índices adicionales:** `profiles_status_idx` sobre `(status)` para listados filtrados.

## Relaciones

- `auth.users`: 1 a 1. Un trigger `AFTER INSERT ON auth.users` (`on_auth_user_created`) crea el perfil.
- `user_roles`: 1 a N. Un usuario puede tener varios roles o ninguno.
- `audit_logs`: no hay FK. `audit_logs.actor_id` apunta a `auth.users(id)` (D3), que es el mismo UUID.

## Reglas de negocio

- Todo usuario de Auth tiene exactamente un perfil.
- El trigger crea el perfil `active`, salvo que el alta venga marcada como invitación (`raw_app_meta_data ->> 'invited' = 'true'`): en ese caso nace `pending` (D7). El flujo completo de invitación queda fuera de este plan.
- `full_name` sale de `raw_user_meta_data ->> 'full_name'` o, si falta, de la parte local del email; se recorta a 120 caracteres y, si queda con menos de 2, se usa `Usuario` para que el alta en Auth nunca falle por el `CHECK`.
- Solo un perfil `active` puede ejercer permisos: `private.has_permission` lo exige.
- **Bajas:** no hay baja lógica con `deleted_at`. Dar de baja es pasar `status` a `inactive`; el borrado de la cuenta de Auth (que elimina el perfil por `CASCADE`) es excepcional.
- **Sincronización con Auth (D5, F5.2):** al pasar a `inactive` se bloquea la cuenta en `auth.users` (`banned_until`); al reactivar, se limpia. Se hace con la API de administración de Auth y la clave `service_role` (solo servidor, `getServiceRoleKey()` en `env.ts`, nunca `NEXT_PUBLIC_`). La pieza es `setUserBanned(adminClient, userId, banned)` (`src/core/services/auth/setUserBanned.service.ts`): bloquea con `ban_duration` `"876000h"` (unos 100 años) y limpia con `"none"`; si el usuario no existe lanza `NOT_FOUND` y cualquier otra falla sale como `INTERNAL_ERROR`. **Verificada el 2026-11-22** (ver el plan, F5.2). **Orden obligatorio:** se llama después de que la base aceptó el cambio de `status`, para que la guardia del último administrador (`profiles_protect_last_admin`) rechace antes de bloquear a alguien. **Pendiente:** conectarla con el cambio de `status`, que llegará con la RPC `admin_update_profile_status` (D13). Hasta entonces, cambiar `status` por SQL no toca `banned_until`. Sin el bloqueo, el estado de la aplicación no corta sesiones ni la renovación de tokens.
- **Dependencias:** no se puede inactivar ni borrar al último administrador (perfil `active` con rol activo que tenga `admin.access`). Lo aplica el trigger `profiles_protect_last_admin` (`BEFORE UPDATE OR DELETE`, función `private.protect_last_admin`) con `23514`, para todos, incluidas migraciones y SQL Editor (F5.5). Como el borrado de la cuenta de Auth cae en cascada sobre `profiles`, también queda bloqueado para el último administrador.
- **Trazabilidad:** `updated_at` lo mantiene `public.set_updated_at()` (trigger `profiles_set_updated_at`). Los cambios quedan en `audit_logs` desde F4.
- **Backfill:** los usuarios que ya existían al crear la tabla recibieron un perfil `active` (migración `backfill_profiles`, idempotente).

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** cada usuario lee su propio perfil (política `profiles_select_own`, `id = (select auth.uid())`). Quien tenga `users.manage` lee todos (política agregada en F2).
- **Inserción:** ninguna desde la API; la hace el trigger `handle_new_auth_user` (`SECURITY DEFINER`).
- **Actualización:** sin `GRANT` directo. RLS controla filas, no columnas: con un `UPDATE` directo el usuario podría reactivarse cambiando `status`. Edición de `full_name`, `phone` y `avatar_path` y cambio de `status` por RPC (D4), pendientes hasta que exista la pantalla de gestión (D13).
- **Baja:** sin `GRANT DELETE`.
- **GRANT:** solo `select` a `authenticated`; nada para `anon`.
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

**Verificado el 2026-11-21 en el proyecto de pruebas:** backfill del usuario existente (`active`), alta de un usuario nuevo con perfil `active`, borrado en cascada, lectura del propio perfil (1 fila) y ninguno ajeno, `UPDATE` directo rechazado (`42501`), llamada a la función de trigger rechazada (`42501`) y lectura como `anon` rechazada (`42501`). Pendiente de probar: `pending` por invitación y los `CHECK` de longitud.

**Verificado el 2026-11-22 (bloqueo en Auth, F5.2):** `setUserBanned(..., true)` deja `banned_until` en una fecha lejana (29 oct 2126), `setUserBanned(..., false)` lo deja vacío y un UUID inexistente lanza `NOT_FOUND` (500 en el Route Handler temporal de prueba, con el log del error). Pendiente de probar: que un usuario bloqueado no pueda iniciar sesión (ver F5.9: `login.service` hoy convierte `user_banned` en `INTERNAL_ERROR`).

## Impacto en `categories`

Ninguno funcional. `categories.updated_by` sigue apuntando a `auth.users(id)` (D3).
