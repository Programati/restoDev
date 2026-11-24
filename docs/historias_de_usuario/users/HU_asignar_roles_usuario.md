# HU-USR-006 — Asignar y quitar roles a un usuario

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **asignar y quitar roles a un usuario**, para **definir qué puede hacer en el sistema**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta asignar o quitar un rol, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `users.manage`, se rechaza con `FORBIDDEN`. El permiso se comprueba antes de validar.
3. `user_id` y `role_id` son obligatorios y deben ser UUID válidos; si no, se rechaza con `VALIDATION_ERROR`.
4. Si el usuario no existe, se informa `NOT_FOUND` ("Usuario no encontrado"); si el rol no existe, `NOT_FOUND` ("Rol no encontrado").
5. **Asignar** agrega el rol al usuario. Un usuario puede tener varios roles.
6. Asignar un rol que el usuario ya tiene responde con éxito y no cambia nada (idempotente).
7. Se puede asignar un rol inactivo: queda asignado pero no concede permisos mientras esté inactivo.
8. **Quitar** elimina la asignación. Quitar un rol que el usuario no tiene responde con éxito y no cambia nada (idempotente).
9. Nadie puede asignarse ni quitarse roles a sí mismo: se informa `FORBIDDEN` y no cambia nada.
10. No se puede quitar el rol al último administrador: se informa `CONFLICT` y no cambia nada.
11. Si la operación se realiza con éxito, se devuelve el usuario con sus roles actualizados.
12. El cambio de permisos rige desde la solicitud siguiente: no hay caché de permisos.
13. Cada alta y baja de asignación queda en `audit_logs` (eventos `insert` y `delete`, con `record_id` `"user_id:role_id"` y el actor).
14. Tras el cambio se revalida la lista de usuarios (`/admin/users`).

## Fuera de alcance

- Asignar varios roles en una sola operación (el alta de usuario sí admite `role_ids`, [HU-USR-001](./HU_crear_usuario.md)).
- Reemplazar todos los roles de un usuario de una vez.
- Definir qué permisos tiene cada rol ([HU-ROL-006](../roles/HU_definir_permisos_rol.md)).

## Alcance actual y pendientes

- **Permiso actual:** `users.manage`, reforzado por el trigger anti-escalada (F5.4) y la guardia del último administrador (F5.5).
- **Permiso previsto:** el mismo.
- **Implementado:** los triggers de protección (F5.4 y F5.5); el resto está pendiente.
- **Pendiente:** RPC `admin_assign_role` y `admin_remove_role` (D13), schemas, Servicios, Actions y la pantalla de asignación.

## Decisiones pendientes

- Ninguna por ahora.

## Referencias

- Contratos: [`Contract_assignUserRole`](../../contracts/users/Contract_assignUserRole.md) y [`Contract_removeUserRole`](../../contracts/users/Contract_removeUserRole.md).
- Modelo de datos: [`Model_user_role`](../../database/model/Model_user_role.md).
- HU relacionadas: [HU-USR-001](./HU_crear_usuario.md), [HU-USR-003](./HU_obtener_usuario.md).

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
| 14       |                  | Pendiente |       |
