# HU-ROL-004 — Actualizar rol

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **modificar el nombre, la descripción y el estado de un rol**, para **mantenerlo al día o dejar de aplicar sus permisos sin borrarlo**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta modificar un rol, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `roles.manage`, se rechaza con `FORBIDDEN`. El permiso se comprueba antes de validar.
3. El `id` es obligatorio y debe ser un UUID válido; si no, se rechaza con `VALIDATION_ERROR`.
4. Si no existe un rol con ese `id`, se informa `NOT_FOUND`.
5. La actualización es parcial: solo cambian los campos enviados; los omitidos conservan su valor.
6. Además del `id`, hay que enviar al menos un campo a modificar; si no, se rechaza con `VALIDATION_ERROR`.
7. `name`, si se envía, se recorta y tiene entre 2 y 60 caracteres. Ningún otro rol puede tener ese nombre, sin distinguir mayúsculas y minúsculas; si lo tiene, se informa `CONFLICT`.
8. Un rol no choca consigo mismo: conservar su nombre actual o cambiar solo las mayúsculas y minúsculas es válido.
9. `description`, si se envía, se recorta y tiene entre 1 y 250 caracteres; `null` quita la descripción y omitirla la deja como está.
10. `is_active`, si se envía, es booleano.
11. `code`, `is_system`, `id` y las fechas no se modifican con esta operación: se ignoran. Un input con solo el `id` y esos campos se rechaza por no tener nada que modificar.
12. En un rol del sistema se pueden cambiar `name` y `description`, pero no desactivarlo: se informa `CONFLICT` y no cambia nada.
13. No se puede desactivar un rol si eso deja al sistema sin administrador (ningún perfil `active` con un rol activo que tenga `admin.access`): se informa `CONFLICT` y no cambia nada.
14. Desactivar un rol no borra sus asignaciones ni sus permisos: sus permisos dejan de aplicarse desde la solicitud siguiente, y al reactivarlo vuelven a aplicarse.
15. `updated_at` se actualiza siempre, incluso si los valores enviados son iguales a los actuales (no se detectan "sin cambios").
16. Concurrencia: gana la última escritura. Si dos solicitudes simultáneas asignan el mismo nombre a roles distintos, una recibe `CONFLICT`.
17. La base también exige los límites de longitud de `name` y `description`.
18. Si se modifica con éxito, se devuelve el rol ya modificado, con sus permisos, y el listado refleja el cambio.
19. El cambio queda registrado en `audit_logs` (evento `update`, con el actor) por el trigger `audit_roles`.
20. Tras el cambio se revalida la lista de roles (`/admin/roles`).

## Fuera de alcance

- Cambiar el `code` del rol.
- Definir los permisos del rol ([HU-ROL-006](./HU_definir_permisos_rol.md)).
- Borrar el rol ([HU-ROL-005](./HU_eliminar_rol.md)).
- Modificar varios roles a la vez.
- Control de versión optimista.

## Alcance actual y pendientes

- **Permiso actual:** `roles.manage`, comprobado en la Action antes de validar y reforzado en la RPC.
- **Permiso previsto:** el mismo.
- **Implementado:** el trigger `roles_protect_system` (rechaza desactivar un rol del sistema, F5.3) y el de auditoría `audit_roles` (F4); el resto está pendiente.
- **Pendiente:** RPC `admin_update_role` (D13; debe distinguir un campo omitido de `null` y validar el criterio 13, que hoy no cubre la guardia de F5.5), schema, Servicio, Action, tipos y el formulario de edición.

## Decisiones pendientes

- Si el `code` puede cambiarse en un rol que no es del sistema (propuesta: no, porque es el identificador técnico del rol).
- Si un rol del sistema puede renombrarse (hoy el trigger lo permite).

## Referencias

- Contrato: [`Contract_updateRole`](../../contracts/roles/Contract_updateRole.md).
- Modelo de datos: [`Model_role`](../../database/model/Model_role.md).
- HU relacionadas: [HU-ROL-001](./HU_crear_rol.md), [HU-ROL-003](./HU_obtener_rol.md), [HU-ROL-005](./HU_eliminar_rol.md).

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
| 17       |                  | Pendiente |       |
| 18       |                  | Pendiente |       |
| 19       |                  | Pendiente |       |
| 20       |                  | Pendiente |       |
