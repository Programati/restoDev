# HU-ROL-005 — Eliminar rol

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **eliminar un rol que ya no se usa**, para **mantener limpio el catálogo de roles**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta eliminar un rol, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `roles.manage`, se rechaza con `FORBIDDEN`. El permiso se comprueba antes de validar.
3. El `id` es obligatorio y debe ser un UUID válido; si no, se rechaza con `VALIDATION_ERROR`.
4. Si no existe un rol con ese `id`, se informa `NOT_FOUND`.
5. Dado un rol que no es del sistema y no está asignado a ningún usuario, se elimina. A diferencia de `categories`, `roles` no tiene baja lógica (se desactiva con `is_active`): este es un borrado físico, y los permisos que el rol tenía asignados se eliminan con él.
6. Un rol del sistema no se puede eliminar: se informa `CONFLICT` y no cambia nada.
7. Un rol asignado a algún usuario, de cualquier estado, no se puede eliminar, aunque el rol esté inactivo: se informa `CONFLICT` con un mensaje que indica desasignarlo o desactivarlo, y no cambia nada.
8. Los permisos del catálogo (`permissions`) no se modifican.
9. Concurrencia: si se asigna el rol a un usuario mientras se lo elimina, la base lo impide (`ON DELETE RESTRICT` de `user_roles.role_id`): el rol no se elimina y se informa `CONFLICT`.
10. Al eliminarse, su `code` y su `name` quedan libres para un rol nuevo.
11. Si se elimina con éxito, no se devuelven datos (`null`) y el listado deja de mostrar el rol.
12. La eliminación queda registrada en `audit_logs` (eventos `delete`, con el actor): uno por cada permiso que el rol tenía (`record_id` `"role_id:permission_code"`) y uno por el rol, con su fila anterior en `old_data`.
13. Tras la eliminación se revalida la lista de roles (`/admin/roles`).

## Fuera de alcance

- Desasignar el rol de los usuarios que lo tienen ([HU-USR-006](../users/HU_asignar_roles_usuario.md)).
- Desactivar el rol ([HU-ROL-004](./HU_actualizar_rol.md)).
- Restaurar un rol eliminado.
- Eliminar varios roles a la vez.

## Alcance actual y pendientes

- **Permiso actual:** `roles.manage`, comprobado en la Action antes de validar y reforzado en la RPC.
- **Permiso previsto:** el mismo.
- **Implementado:** las protecciones de la base: `roles_protect_system` (F5.3), `ON DELETE RESTRICT` desde `user_roles` y los triggers de auditoría; el resto está pendiente.
- **Pendiente:** RPC `admin_delete_role` (D13), schema, Servicio, Action, tipos y el botón en `/admin/roles`.

## Decisiones pendientes

- Confirmar el borrado físico (documentado en `Model_role`, que lo limita a roles no del sistema y sin asignaciones) frente a permitir solo desactivar.
- Confirmar que el borrado en cascada de `role_permissions` pasa por el trigger anti-escalada (F5.4) sin bloquear un borrado legítimo, y que genera los eventos de auditoría del criterio 12.

## Referencias

- Contrato: [`Contract_deleteRole`](../../contracts/roles/Contract_deleteRole.md).
- Modelo de datos: [`Model_role`](../../database/model/Model_role.md).
- Decisiones: D6 y D13 de [`Plan_identidad_y_permisos`](../../Plan_identidad_y_permisos.md).
- HU relacionadas: [HU-ROL-004](./HU_actualizar_rol.md), [HU-USR-006](../users/HU_asignar_roles_usuario.md).

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
| 10       |                  | Pendiente |       |
| 11       |                  | Pendiente |       |
| 12       |                  | Pendiente |       |
| 13       |                  | Pendiente |       |
