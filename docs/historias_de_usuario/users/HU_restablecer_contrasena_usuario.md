# HU-USR-007 — Restablecer la contraseña de un usuario

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **definir una contraseña nueva para un usuario**, para **devolverle el acceso si la olvidó**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta restablecer una contraseña, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `users.manage`, se rechaza con `FORBIDDEN`. El permiso se comprueba antes de validar.
3. `id` es obligatorio (UUID válido) y `password` es obligatoria, de 8 a 72 caracteres y sin recortar; si no, se rechaza con `VALIDATION_ERROR`.
4. Si no existe un usuario con ese `id`, se informa `NOT_FOUND`.
5. La contraseña se reemplaza en Auth y el usuario inicia sesión con la nueva.
6. Se puede aplicar a un usuario en cualquier estado; si está `inactive`, sigue bloqueado.
7. La contraseña no se guarda, no se devuelve ni se registra. El éxito no trae datos (`null`).
8. Se puede aplicar a la propia cuenta.
9. No se cierran las sesiones que el usuario ya tenía abiertas.

## Fuera de alcance

- Recuperación por email ("olvidé mi contraseña") y cambio de contraseña por el propio usuario.
- Forzar el cambio de contraseña en el próximo ingreso.

## Alcance actual y pendientes

- **Permiso actual:** `users.manage`.
- **Permiso previsto:** el mismo.
- **Implementado:** nada todavía.
- **Pendiente:** schema, Servicio (con `createAdminClient()`), Action y el formulario en el detalle del usuario. No necesita RPC: no toca tablas.

## Decisiones pendientes

- El restablecimiento no deja registro en `audit_logs`: `auth.users` no está auditada y la operación no toca tablas propias. Evaluar un registro propio.
- Si hay que cerrar las sesiones abiertas del usuario.

## Referencias

- Contrato: [`Contract_resetUserPassword`](../../contracts/users/Contract_resetUserPassword.md).
- Decisiones: D5 y D14 de [`Plan_identidad_y_permisos`](../../Plan_identidad_y_permisos.md).
- HU relacionadas: [HU-USR-001](./HU_crear_usuario.md).

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
