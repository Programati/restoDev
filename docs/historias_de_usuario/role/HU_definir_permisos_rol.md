# HU-ROL-006 — Definir los permisos de un rol

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **definir qué permisos concede un rol**, para **controlar qué puede hacer quien lo tenga asignado**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta definir los permisos de un rol, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `roles.manage`, se rechaza con `FORBIDDEN`. El permiso se comprueba antes de validar.
3. `role_id` es obligatorio y debe ser un UUID válido. `permission_codes` es obligatorio, es una lista (puede estar vacía) de códigos con formato `modulo.accion`; los repetidos se ignoran. Si no, se rechaza con `VALIDATION_ERROR`.
4. Si no existe un rol con ese `role_id`, se informa `NOT_FOUND` ("Rol no encontrado").
5. Si algún código no existe en el catálogo de permisos, se informa `NOT_FOUND` ("Permiso no encontrado") y no cambia nada.
6. La operación reemplaza el conjunto completo: al terminar, el rol tiene exactamente los permisos enviados.
7. Una lista vacía quita todos los permisos del rol.
8. Es idempotente: si el rol ya tiene exactamente esos permisos, responde con éxito, no cambia nada y no genera eventos de auditoría.
9. Solo se aplica la diferencia (se agregan los que faltan y se quitan los que sobran) y es atómica: o se aplica todo o no cambia nada.
10. Nadie puede modificar los permisos de un rol que tiene asignado, ni siquiera siendo administrador: se informa `FORBIDDEN` y no cambia nada.
11. No se puede quitar `admin.access` si eso deja al sistema sin administrador (ningún perfil `active` con un rol activo que tenga `admin.access`): se informa `CONFLICT` y no cambia nada.
12. Se pueden definir los permisos de un rol inactivo: quedan guardados pero no se aplican mientras esté inactivo.
13. El cambio rige desde la solicitud siguiente: no hay caché de permisos.
14. Si se realiza con éxito, se devuelve el rol con sus permisos actualizados.
15. Cada permiso agregado o quitado queda en `audit_logs` (eventos `insert` y `delete`, con `record_id` `"role_id:permission_code"` y el actor).
16. Tras el cambio se revalida la lista de roles (`/admin/roles`).

## Fuera de alcance

- Crear, editar o quitar permisos del catálogo: solo por migración.
- Agregar o quitar un único permiso con una operación propia (esta operación siempre reemplaza el conjunto).
- Listar el catálogo de permisos para el selector de la pantalla.
- Asignar roles a usuarios ([HU-USR-006](../users/HU_asignar_roles_usuario.md)).

## Alcance actual y pendientes

- **Permiso actual:** `roles.manage`, comprobado en la Action antes de validar y reforzado por la RPC y por el trigger anti-escalada `role_permissions_protect_assignments` (F5.4).
- **Permiso previsto:** el mismo.
- **Implementado:** el trigger anti-escalada (F5.4) y los de auditoría (F4); el resto está pendiente.
- **Pendiente:** RPC `admin_set_role_permissions` (D13; debe cubrir el criterio 11, límite conocido de la guardia de F5.5), schema, Servicio, Action, tipos y la pantalla de permisos del rol.

## Decisiones pendientes

- Si se pueden modificar los permisos de un rol del sistema como `admin`. Hoy solo lo frenan el criterio 10 (para quien lo tiene asignado) y el criterio 11.
- Si hace falta una Action `listPermissions` para el selector: `permissions` solo lo lee quien tiene `roles.manage`, así que la pantalla necesita una operación que lo exponga.

## Referencias

- Contrato: [`Contract_setRolePermissions`](../../contracts/roles/Contract_setRolePermissions.md).
- Modelo de datos: [`Model_role_permission`](../../database/model/Model_role_permission.md) y [`Model_permission`](../../database/model/Model_permission.md).
- HU relacionadas: [HU-ROL-003](./HU_obtener_rol.md), [HU-ROL-004](./HU_actualizar_rol.md), [HU-USR-006](../users/HU_asignar_roles_usuario.md).

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
| 15       |                  | Pendiente |       |
| 16       |                  | Pendiente |       |
