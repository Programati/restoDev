# roles — Contratos del módulo

## Entidad

Roles del sistema: agrupaciones de permisos que se asignan a los usuarios (`user_roles`). Los permisos (`permissions`) son un catálogo fijo sembrado por migraciones. Modelo de datos en [`Model_role.md`](../../database/model/Model_role.md), [`Model_role_permission.md`](../../database/model/Model_role_permission.md) y [`Model_permission.md`](../../database/model/Model_permission.md).

- Las Actions de este módulo exigen `roles.manage`, que comprueba cada Action antes de validar. Excepción: `listRolesAction` también admite `users.manage`, para que la pantalla de usuarios pueda ofrecer los roles al asignarlos.
- Un rol se identifica por `code` (técnico, no editable, único) y se muestra por `name` (único sin distinguir mayúsculas).
- El rol nace activo, sin permisos y sin marca de sistema. Los permisos se definen con `setRolePermissions`.
- **Sin baja lógica:** un rol se desactiva con `is_active` (sus permisos dejan de aplicarse, sin borrar nada) y solo se elimina físicamente si no es del sistema y no está asignado a nadie (D6).
- Los roles del sistema (`is_system`, hoy solo `admin`) no se eliminan, no cambian de `code`, no se desactivan y no cambian su marca. Los crea solo una migración.
- El catálogo de permisos no se modifica desde la app: solo por migración.
- Las escrituras sobre las tablas de acceso van por RPC `SECURITY DEFINER` (`admin_*`, D13); la lectura va directa con RLS.
- Las protecciones de F5 aplican siempre: nadie modifica los permisos de un rol que tiene asignado y no se deja al sistema sin administrador.

## Actions

| Action                     | Descripción                                                              | Permiso                         | Equivalente API | Ficha                                                                | Estado                  |
| -------------------------- | ------------------------------------------------------------------------ | ------------------------------- | --------------- | -------------------------------------------------------------------- | ----------------------- |
| `createRoleAction`         | Crea un rol activo, sin permisos y sin marca de sistema                  | `roles.manage`                  | No aplica       | [`Contract_createRole.md`](./Contract_createRole.md)                 | Documentada; sin código |
| `listRolesAction`          | Lista roles con filtros opcionales                                       | `roles.manage` o `users.manage` | No aplica       | [`Contract_listRoles.md`](./Contract_listRoles.md)                   | Documentada; sin código |
| `getRoleAction`            | Obtiene un rol por `id`, con sus permisos                                | `roles.manage`                  | No aplica       | [`Contract_getRole.md`](./Contract_getRole.md)                       | Documentada; sin código |
| `updateRoleAction`         | Modifica parcialmente `name`, `description` e `is_active`                | `roles.manage`                  | No aplica       | [`Contract_updateRole.md`](./Contract_updateRole.md)                 | Documentada; sin código |
| `deleteRoleAction`         | Elimina un rol que no es del sistema y no está asignado (borrado físico) | `roles.manage`                  | No aplica       | [`Contract_deleteRole.md`](./Contract_deleteRole.md)                 | Documentada; sin código |
| `setRolePermissionsAction` | Reemplaza el conjunto completo de permisos de un rol                     | `roles.manage`                  | No aplica       | [`Contract_setRolePermissions.md`](./Contract_setRolePermissions.md) | Documentada; sin código |

Pendiente de decidir: una Action `listPermissions` que exponga el catálogo para el selector de la pantalla de permisos (HU-ROL-006).

## Tipos y archivos compartidos para el front

Cada ficha tiene su sección "Uso desde el front" con los imports exactos. Lo común a todo el módulo:

| Import                    | Ruta                                 | Para qué                                                                                                     |
| ------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `ActionResult<T>`         | `src/core/types/action-result.ts`    | Resultado de toda Action: `{ ok: true, data, message }` o `{ ok: false, error }`                             |
| `RolePermission`          | `src/core/types/roles/role.types.ts` | Permiso de un rol: `code`, `module`, `name`                                                                  |
| `RoleListItem`            | `src/core/types/roles/role.types.ts` | Subconjunto para listados (`listRolesAction`): `id`, `code`, `name`, `description`, `is_system`, `is_active` |
| `RoleDetail`              | `src/core/types/roles/role.types.ts` | Detalle (`getRoleAction` y las operaciones que modifican): suma `created_at` y `permissions`                 |
| `CreateRoleInput`         | `src/core/types/roles/role.types.ts` | Input de `createRoleAction` (`z.input` del schema)                                                           |
| `ListRolesInput`          | `src/core/types/roles/role.types.ts` | Input de `listRolesAction`                                                                                   |
| `GetRoleInput`            | `src/core/types/roles/role.types.ts` | Input de `getRoleAction`                                                                                     |
| `UpdateRoleInput`         | `src/core/types/roles/role.types.ts` | Input de `updateRoleAction`                                                                                  |
| `DeleteRoleInput`         | `src/core/types/roles/role.types.ts` | Input de `deleteRoleAction`                                                                                  |
| `SetRolePermissionsInput` | `src/core/types/roles/role.types.ts` | Input de `setRolePermissionsAction` (`role_id`, `permission_codes`)                                          |

El front importa las Actions y estos tipos; los schemas Zod y los Servicios son del back y no se importan desde componentes cliente. Los tipos `*Dto` (`z.infer`) son para el Servicio.

Las definiciones funcionales están en las HU [HU-ROL-001 a HU-ROL-006](../../historias_de_usuario/roles/).
