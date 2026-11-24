# HU-USR-001 — Crear usuario

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **crear un usuario con su nombre, email y contraseña inicial**, para **darle acceso al sistema con los roles que le correspondan**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta crear un usuario, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `users.manage`, cuando intenta crear un usuario, se rechaza con `FORBIDDEN` y no se crea nada. El permiso se comprueba antes de validar.
3. Dada una persona con `users.manage` y datos válidos, se crea la cuenta en Auth (con el email confirmado) y su perfil `active` con el `full_name` enviado, y se devuelve el usuario creado.
4. `full_name` es obligatorio: se recorta y tiene entre 2 y 120 caracteres; un valor de solo espacios cuenta como vacío. Lo escribe quien da el alta: el servidor nunca lo deduce del email.
5. `email` es obligatorio: se recorta, se pasa a minúsculas, debe tener formato válido y no superar los 254 caracteres.
6. `password` es obligatorio, tiene entre 8 y 72 caracteres y no se recorta.
7. Si ya existe un usuario con ese email, se informa `CONFLICT` y no se crea nada.
8. `role_ids` es opcional (por defecto, ninguno). Si algún rol no existe, se informa `NOT_FOUND` y no se crea nada. Los repetidos se ignoran.
9. Los roles se asignan después de crear la cuenta. Si esa asignación falla, el usuario queda creado sin esos roles y la operación responde con éxito y un mensaje que lo avisa; `data.roles` refleja los roles realmente asignados.
10. Si no se envían roles, el usuario nace sin roles y, por lo tanto, sin permisos. Siempre nace `active`: `status`, `phone`, `id` y cualquier otro campo enviado se ignoran.
11. La contraseña no se guarda, no se devuelve ni se registra.
12. Los datos inválidos se rechazan con `VALIDATION_ERROR` y errores asociados a los campos que fallaron.
13. Tras el alta se revalida la lista de usuarios (`/admin/users`).

## Fuera de alcance

- Invitación por email (usuario `pending`, correo y pantalla para completar el alta): pendiente documentado (D14).
- Alta de `phone` (se edita después, [HU-USR-004](./HU_actualizar_usuario.md)).
- Alta masiva o por importación.
- Cambio de contraseña por el propio usuario.

## Alcance actual y pendientes

- **Permiso actual:** `users.manage`, comprobado en la Action antes de validar.
- **Permiso previsto:** el mismo.
- **Implementado:** nada todavía (documentación de la Fase 6).
- **Pendiente:** `createUser.schema.ts`, `createUser.service.ts` y `createUser.action.ts`; la RPC `admin_assign_role` (F6.2); el formulario `/admin/users/new`.

## Decisiones pendientes

- Quién creó el usuario no queda registrado: el alta la hace la API de Auth con `service_role`, sin `auth.uid()`, así que el evento `insert` de `audit_logs` para `profiles` queda con `actor_id` en `NULL`. Evaluar registrar al actor (por ejemplo, en `app_metadata`).
- Si Auth rechaza la contraseña por su propia política (`weak_password`), se informa como `VALIDATION_ERROR` sin `fieldErrors`. A confirmar.

## Referencias

- Contrato: [`Contract_createUser`](../../contracts/users/Contract_createUser.md).
- Modelo de datos: [`Model_profile`](../../database/model/Model_profile.md).
- Reglas de negocio: sección "Alta y gestión de usuarios" de [`Reglas_de_negocio`](../../Reglas_de_negocio.md).
- Decisiones: D14 y D15 de [`Plan_identidad_y_permisos`](../../Plan_identidad_y_permisos.md).
- HU relacionadas: [HU-USR-006](./HU_asignar_roles_usuario.md).

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
