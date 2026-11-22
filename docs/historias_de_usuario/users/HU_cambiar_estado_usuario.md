# HU-USR-005 — Cambiar el estado de un usuario

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **inactivar y reactivar a un usuario**, para **cortar o devolver su acceso sin borrar su historial**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta cambiar el estado de un usuario, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `users.manage`, se rechaza con `FORBIDDEN`. El permiso se comprueba antes de validar.
3. `id` es obligatorio (UUID válido) y `status` es obligatorio y solo admite `active` o `inactive`: `pending` no se puede fijar. Si no, se rechaza con `VALIDATION_ERROR`.
4. Si no existe un usuario con ese `id`, se informa `NOT_FOUND`.
5. Al pasar a `inactive`, el perfil queda `inactive` y la cuenta de Auth se bloquea: el usuario no puede iniciar sesión ni renovar tokens.
6. Al pasar a `active`, el perfil queda `active` y la cuenta de Auth se desbloquea.
7. Una sesión que ya estaba abierta en un perfil `inactive` deja de leer datos, porque las políticas exigen perfil `active`, aunque el token siga vigente.
8. El orden es: primero la base y después Auth. Si el bloqueo en Auth falla, se informa `INTERNAL_ERROR` y el estado de la base ya cambió; repetir la misma operación vuelve a aplicar el bloqueo o el desbloqueo.
9. La operación es idempotente: si el usuario ya tiene ese estado, responde con éxito y vuelve a aplicar el bloqueo o el desbloqueo en Auth.
10. No se puede inactivar al último administrador (perfil `active` con un rol activo que tenga `admin.access`): se informa `CONFLICT` y no cambia nada.
11. Un usuario `pending` se puede pasar a `active` o a `inactive`.
12. Si el cambio se realiza con éxito, se devuelve el usuario con su estado nuevo, y el listado refleja el cambio.
13. El cambio queda registrado en `audit_logs` (evento `update`, con el actor) por el trigger `audit_profiles`.
14. Tras el cambio se revalida la lista de usuarios (`/admin/users`).

## Fuera de alcance

- Borrar la cuenta de Auth: es excepcional y no forma parte del flujo de negocio.
- Cerrar de inmediato las sesiones ya abiertas.
- Inactivar a varios usuarios a la vez.

## Alcance actual y pendientes

- **Permiso actual:** `users.manage`.
- **Permiso previsto:** el mismo.
- **Implementado:** `setUserBanned` (F5.2); el resto está pendiente.
- **Pendiente:** RPC `admin_update_profile_status` (D13), schema, Servicio (que llama a `setUserBanned` después de la RPC), Action y los botones en `/admin/users`.

## Decisiones pendientes

- Si un administrador puede inactivarse a sí mismo. Hoy solo lo frena la guardia del último administrador. Propuesta: rechazarlo.
- Si inactivar debe cerrar las sesiones abiertas del usuario.

## Referencias

- Contrato: [`Contract_setUserStatus`](../../contracts/users/Contract_setUserStatus.md).
- Modelo de datos: [`Model_profile`](../../database/model/Model_profile.md).
- HU relacionadas: [HU-USR-004](./HU_actualizar_usuario.md).

## Verificación

> Las pruebas se ejecutan en F6.5. Incluyen que un usuario bloqueado no pueda iniciar sesión (pendiente desde F5.2).

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
