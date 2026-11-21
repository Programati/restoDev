# role_permissions

## Estructura

| Campo                  | Tipo   | Nulo | Default |
| ---------------------- | ------ | ---- | ------- |
| `role_id` (PK)         | `uuid` | No   | —       |
| `permission_code` (PK) | `text` | No   | —       |

> Tabla puente N:M. Sin `id`, `assigned_at` ni `assigned_by`: la clave compuesta identifica la fila y quién concedió el permiso y cuándo se obtiene de `audit_logs`.

## Constraints e índices

- **Clave primaria:** compuesta `(role_id, permission_code)`; impide conceder dos veces el mismo permiso.
- **Unicidad:** la de la clave primaria.
- **Checks:** ninguno.
- **Claves foráneas:**
  - `role_id` → `roles(id)`; `ON DELETE CASCADE`.
  - `permission_code` → `permissions(code)`; `ON UPDATE CASCADE ON DELETE RESTRICT`.
- **Índices adicionales:** `(permission_code, role_id)` para saber a qué roles pertenece un permiso.

## Relaciones

- `roles`: N a 1. Borrar un rol arrastra sus permisos; borrar el rol ya está protegido por `RESTRICT` en `user_roles`.
- `permissions`: N a 1. Un permiso en uso no se puede quitar del catálogo.

## Reglas de negocio

- El rol `admin` tiene todos los permisos del catálogo; el seed los asigna.
- Modificar permisos de un rol requiere `roles.manage`.
- Los permisos de un rol inactivo no se aplican, aunque las filas existan.
- **Bajas:** no aplica baja lógica; quitar un permiso a un rol es borrar la fila, y queda en `audit_logs`.
- **Dependencias:** un permiso asignado a algún rol no se puede borrar del catálogo.
- **Trazabilidad:** `record_id` del evento de auditoría es `"role_id:permission_code"`.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** `roles.manage`.
- **Inserción, actualización y borrado:** sin `GRANT` directo; solo por RPC con `roles.manage`. Es la tabla más sensible del dominio: define quién puede hacer qué.
- **Anti-escalada (F5):** trigger `BEFORE INSERT/UPDATE/DELETE` que exige `roles.manage` y bloquea la autoasignación. Debe permitir migraciones y seed (sin `auth.uid()`), por eso se agrega después de sembrar.
- Sin permisos para `anon`; sin Realtime.

## Validaciones

- La clave compuesta rechaza el par duplicado.
- Rechazar un `role_id` o un `permission_code` inexistente.
- Borrar un rol elimina sus filas; borrar un permiso en uso falla.
- Renombrar un `permission_code` en el catálogo se propaga.
- RLS: sin `roles.manage` no se lee ni se escribe directo (`42501`); `anon` no accede.
- Cada alta o baja genera un evento con `record_id` compuesto (F4).

## Impacto en `categories`

Ninguno directo. Los permisos `categories.*` se conceden al rol `admin` aquí, vía seed.
