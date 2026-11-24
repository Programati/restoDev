# users — Contratos del módulo

## Entidad

Usuarios del sistema: cuenta de Auth (`auth.users`: email, contraseña y bloqueo) más su perfil (`profiles`: nombre, teléfono, estado) y sus roles (`user_roles`). Modelo de datos en [`Model_profile.md`](../../database/model/Model_profile.md) y [`Model_user_role.md`](../../database/model/Model_user_role.md).

- Todas las operaciones exigen el permiso `users.manage`, que comprueba cada Action antes de validar.
- El administrador crea la cuenta con email, contraseña inicial y **nombre completo obligatorio** (D14). La invitación por email queda pendiente.
- El usuario nace `active` y sin roles. Sin roles no tiene permisos.
- Las escrituras sobre las tablas de acceso van por RPC `SECURITY DEFINER` (`admin_*`); el email, la contraseña y el bloqueo, por la API de administración de Auth con `createAdminClient()` (solo servidor).
- No hay borrado de usuarios: la baja es `status = inactive` (con bloqueo en Auth).
- Las protecciones de F5 aplican siempre: nadie se asigna roles a sí mismo y no se queda el sistema sin administrador.

## Actions

| Action                    | Descripción                                                    | Permiso        | Equivalente API | Ficha                                                              | Estado                  |
| ------------------------- | -------------------------------------------------------------- | -------------- | --------------- | ------------------------------------------------------------------ | ----------------------- |
| `createUserAction`        | Crea la cuenta y el perfil, y asigna roles si se envían        | `users.manage` | No aplica       | [`Contract_createUser.md`](./Contract_createUser.md)               | Documentada; sin código |
| `listUsersAction`         | Lista usuarios con filtros opcionales                          | `users.manage` | No aplica       | [`Contract_listUsers.md`](./Contract_listUsers.md)                 | Documentada; sin código |
| `getUserAction`           | Obtiene un usuario por `id`                                    | `users.manage` | No aplica       | [`Contract_getUser.md`](./Contract_getUser.md)                     | Documentada; sin código |
| `updateUserAction`        | Modifica parcialmente `full_name` y `phone`                    | `users.manage` | No aplica       | [`Contract_updateUser.md`](./Contract_updateUser.md)               | Documentada; sin código |
| `setUserStatusAction`     | Inactiva o reactiva (y bloquea o desbloquea la cuenta de Auth) | `users.manage` | No aplica       | [`Contract_setUserStatus.md`](./Contract_setUserStatus.md)         | Documentada; sin código |
| `assignUserRoleAction`    | Asigna un rol a un usuario                                     | `users.manage` | No aplica       | [`Contract_assignUserRole.md`](./Contract_assignUserRole.md)       | Documentada; sin código |
| `removeUserRoleAction`    | Quita un rol a un usuario                                      | `users.manage` | No aplica       | [`Contract_removeUserRole.md`](./Contract_removeUserRole.md)       | Documentada; sin código |
| `resetUserPasswordAction` | Define una contraseña nueva para un usuario                    | `users.manage` | No aplica       | [`Contract_resetUserPassword.md`](./Contract_resetUserPassword.md) | Documentada; sin código |

## Tipos y archivos compartidos para el front

Cada ficha tiene su sección "Uso desde el front" con los imports exactos. Lo común a todo el módulo:

| Import                   | Ruta                                 | Para qué                                                                                                           |
| ------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `ActionResult<T>`        | `src/core/types/action-result.ts`    | Resultado de toda Action: `{ ok: true, data, message }` o `{ ok: false, error }`                                   |
| `UserRole`               | `src/core/types/users/user.types.ts` | Rol de un usuario: `id`, `code`, `name`, `is_active`                                                               |
| `UserListItem`           | `src/core/types/users/user.types.ts` | Subconjunto para listados (`listUsersAction`): `id`, `email`, `full_name`, `phone`, `status`, `is_banned`, `roles` |
| `UserDetail`             | `src/core/types/users/user.types.ts` | Detalle (`getUserAction` y las operaciones que modifican): suma `avatar_path` y `created_at`                       |
| `CreateUserInput`        | `src/core/types/users/user.types.ts` | Input de `createUserAction` (`z.input` del schema)                                                                 |
| `ListUsersInput`         | `src/core/types/users/user.types.ts` | Input de `listUsersAction`                                                                                         |
| `GetUserInput`           | `src/core/types/users/user.types.ts` | Input de `getUserAction`                                                                                           |
| `UpdateUserInput`        | `src/core/types/users/user.types.ts` | Input de `updateUserAction`                                                                                        |
| `SetUserStatusInput`     | `src/core/types/users/user.types.ts` | Input de `setUserStatusAction`                                                                                     |
| `UserRoleInput`          | `src/core/types/users/user.types.ts` | Input de `assignUserRoleAction` y `removeUserRoleAction` (`user_id`, `role_id`)                                    |
| `ResetUserPasswordInput` | `src/core/types/users/user.types.ts` | Input de `resetUserPasswordAction`                                                                                 |

`profile_status` (`pending`, `active`, `inactive`) viene de `database.types.ts`. El front importa las Actions y estos tipos; los schemas Zod y los Servicios son del back y no se importan desde componentes cliente. Los tipos `*Dto` (`z.infer`) son para el Servicio.

Las definiciones funcionales están en las HU [HU-USR-001 a HU-USR-007](../../historias_de_usuario/users/).
