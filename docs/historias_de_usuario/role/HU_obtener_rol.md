# HU-ROL-003 — Obtener rol

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **ver el detalle de un rol con sus permisos**, para **revisarlo o editarlo**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta obtener un rol, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `roles.manage`, se rechaza con `FORBIDDEN`. El permiso se comprueba antes de validar.
3. El `id` es obligatorio y debe ser un UUID válido; si no, se rechaza con `VALIDATION_ERROR` con el error asociado a `id`.
4. Si no existe un rol con ese `id`, se informa `NOT_FOUND`.
5. Si existe, se devuelven `id`, `code`, `name`, `description`, `is_system`, `is_active`, `created_at` y `permissions` (cada uno con `code`, `module` y `name`).
6. `permissions` se ordena por `module` ascendente y, a igual módulo, por `name` ascendente.
7. Un rol sin permisos devuelve `permissions` como lista vacía; no es un error.
8. Los roles inactivos y los del sistema se obtienen con normalidad. Un rol inactivo lista sus permisos, aunque no se apliquen mientras esté inactivo.
9. La operación es de solo lectura, sin efectos secundarios.

## Fuera de alcance

- Los usuarios que tienen el rol.
- Historial de cambios del rol (se consulta en `audit_logs`).
- Obtener por `code`.

## Alcance actual y pendientes

- **Permiso actual:** `roles.manage`, comprobado en la Action antes de validar. RLS lo refuerza: `role_permissions` y `permissions` solo las lee quien tiene `roles.manage`.
- **Permiso previsto:** el mismo.
- **Implementado:** nada todavía.
- **Pendiente:** schema, Servicio (lectura directa de `roles` con sus permisos, sin RPC), Action, tipos y la pantalla de detalle.

## Decisiones pendientes

- Ninguna por ahora.

## Referencias

- Contrato: [`Contract_getRole`](../../contracts/roles/Contract_getRole.md).
- Modelo de datos: [`Model_role`](../../database/model/Model_role.md), [`Model_role_permission`](../../database/model/Model_role_permission.md) y [`Model_permission`](../../database/model/Model_permission.md).
- HU relacionadas: [HU-ROL-002](./HU_listar_roles.md), [HU-ROL-004](./HU_actualizar_rol.md), [HU-ROL-006](./HU_definir_permisos_rol.md).

## Verificación

> Las pruebas se ejecutan en F6.5.

| Criterio | Cómo se verificó | Resultado | Fecha |
| -------- | ---------------- | --------- | ----- |
| 1        |                  | Pendiente |       |
| 2        |                  | Pendiente |       |
| 3        |                  | Pendiente |       |
| 4        |                  | Pendiente |       |
| 5        |                  | Pendiente |       |
| 6        |                  | Pendiente |       |
| 7        |                  | Pendiente |       |
| 8        |                  | Pendiente |       |
| 9        |                  | Pendiente |       |
