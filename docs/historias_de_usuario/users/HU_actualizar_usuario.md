# HU-USR-004 — Actualizar datos de un usuario

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **modificar el nombre y el teléfono de un usuario**, para **mantener sus datos al día**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta modificar un usuario, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `users.manage`, se rechaza con `FORBIDDEN`. El permiso se comprueba antes de validar.
3. El `id` es obligatorio y debe ser un UUID válido; si no, se rechaza con `VALIDATION_ERROR`.
4. Si no existe un usuario con ese `id`, se informa `NOT_FOUND`.
5. La actualización es parcial: solo cambian los campos enviados; los omitidos conservan su valor.
6. Además del `id`, hay que enviar al menos un campo a modificar; si no, se rechaza con `VALIDATION_ERROR`.
7. `full_name`, si se envía, se recorta y tiene entre 2 y 120 caracteres.
8. `phone`, si se envía, se recorta y tiene entre 1 y 30 caracteres; `null` quita el teléfono y omitirlo lo deja como está.
9. `email`, `status`, `roles` y `avatar_path` no se modifican con esta operación: se ignoran. Un input con solo el `id` y esos campos se rechaza por no tener nada que modificar.
10. Se puede modificar a un usuario en cualquier estado y también al propio.
11. `updated_at` se actualiza siempre, incluso si los valores enviados son iguales a los actuales (no se detectan "sin cambios").
12. La base también exige los límites de longitud de `full_name` y `phone`.
13. Si se modifica con éxito, se devuelve el usuario ya modificado, y el listado refleja el cambio.
14. El cambio queda registrado en `audit_logs` (evento `update`, con el actor) por el trigger `audit_profiles`.

## Fuera de alcance

- Cambiar el email (pendiente).
- Cambiar el estado ([HU-USR-005](./HU_cambiar_estado_usuario.md)), los roles ([HU-USR-006](./HU_asignar_roles_usuario.md)) o la contraseña ([HU-USR-007](./HU_restablecer_contrasena_usuario.md)).
- Subir o cambiar el avatar.
- Que el propio usuario edite su perfil desde una pantalla propia.

## Alcance actual y pendientes

- **Permiso actual:** `users.manage`.
- **Permiso previsto:** el mismo (una edición del propio perfil sin `users.manage` queda para una HU futura).
- **Implementado:** nada todavía.
- **Pendiente:** RPC `admin_update_profile` (D16; debe distinguir un campo omitido de `null`), schema, Servicio, Action y el formulario de edición.

## Decisiones pendientes

- Ninguna por ahora.

## Referencias

- Contrato: [`Contract_updateUser`](../../contracts/users/Contract_updateUser.md).
- Modelo de datos: [`Model_profile`](../../database/model/Model_profile.md).
- HU relacionadas: [HU-USR-003](./HU_obtener_usuario.md).

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
