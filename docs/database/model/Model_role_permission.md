# role_permissions

> Estado: implementada en la Fase 2 (migraciones `create_access_tables`, `seed_roles_permissions` y `create_access_read_policies`), aplicada al proyecto de pruebas. El trigger anti-escalada está activo desde F5.4 (`access_anti_escalation`). Las RPC de escritura quedan pendientes hasta la pantalla de gestión (D13).

## Estructura

| Campo                  | Tipo   | Longitud                | Nulo | Default |
| ---------------------- | ------ | ----------------------- | ---- | ------- |
| `role_id` (PK)         | `uuid` | —                       | No   | —       |
| `permission_code` (PK) | `text` | formato `modulo.accion` | No   | —       |

> Tabla puente N:M. Sin `id`, `assigned_at` ni `assigned_by`: la clave compuesta identifica la fila y quién concedió el permiso y cuándo se obtiene de `audit_logs`.
> `permission_code` hereda el formato de `permissions.code` por la clave foránea; no tiene `CHECK` propio.

## Constraints e índices

- **Clave primaria:** compuesta `(role_id, permission_code)`; impide conceder dos veces el mismo permiso.
- **Unicidad:** la de la clave primaria.
- **Checks:** ninguno.
- **Claves foráneas:**
  - `role_id` → `roles(id)`; `ON DELETE CASCADE`.
  - `permission_code` → `permissions(code)`; `ON UPDATE CASCADE ON DELETE RESTRICT`.
- **Índices adicionales:** `role_permissions_permission_code_role_id_idx` sobre `(permission_code, role_id)` para saber a qué roles pertenece un permiso.

## Relaciones

- `roles`: N a 1. Borrar un rol arrastra sus permisos; borrar el rol ya está protegido por `RESTRICT` en `user_roles`.
- `permissions`: N a 1. Un permiso en uso no se puede quitar del catálogo.

## Reglas de negocio

- El rol `admin` tiene todos los permisos del catálogo; el seed los asigna (hoy 6 filas).
- Modificar permisos de un rol requiere `roles.manage`.
- Los permisos de un rol inactivo no se aplican, aunque las filas existan.
- **Bajas:** no aplica baja lógica; quitar un permiso a un rol es borrar la fila, y queda en `audit_logs`.
- **Dependencias:** un permiso asignado a algún rol no se puede borrar del catálogo.
- **Trazabilidad:** `record_id` del evento de auditoría es `"role_id:permission_code"`.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** `roles.manage` (política `role_permissions_select_roles_manage`).
- **Inserción, actualización y borrado:** sin `GRANT` directo; la RPC `admin_set_role_permissions` (con `roles.manage`) está **pendiente** hasta la pantalla de gestión (D13); mientras tanto, solo migración o SQL Editor. Es la tabla más sensible del dominio: define quién puede hacer qué.
- **Anti-escalada (F5.4):** trigger `role_permissions_protect_assignments` (`BEFORE INSERT OR UPDATE OR DELETE`, función `private.protect_access_assignments`). Con `auth.uid()` exige `roles.manage` y bloquea modificar los permisos de un rol que el propio actor tiene asignado (autoasignación indirecta), con `42501`. Sin `auth.uid()` (migraciones, seed, SQL Editor, servidor) no controla nada. **Límite conocido (F5.5):** quitar `admin.access` de un rol no está cubierto por la guardia del último administrador.
- **GRANT:** solo `select` a `authenticated`; nada para `anon`; sin Realtime.

## Validaciones

- La clave compuesta rechaza el par duplicado.
- Rechazar un `role_id` o un `permission_code` inexistente.
- Borrar un rol elimina sus filas; borrar un permiso en uso falla.
- Renombrar un `permission_code` en el catálogo se propaga.
- RLS: sin `roles.manage` no se lee ni se escribe directo (`42501`); `anon` no accede.
- Cada alta o baja genera un evento con `record_id` compuesto (F4).

**Verificado el 2026-11-21 en el proyecto de pruebas:** el seed repetido deja 6 relaciones; el admin lee las 6; un usuario sin rol lee 0. Pendiente de probar: par duplicado, referencias inexistentes, cascada y `RESTRICT`.

## Impacto en `categories`

Ninguno directo. Los permisos `categories.*` se conceden al rol `admin` aquí, vía seed.
