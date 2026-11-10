# Módulo usuarios

Tabla `profiles` (1:1 con `auth.users`). Los roles se asignan en `user_roles` y se definen en `roles`. RLS activo.

- El `email` vive en `auth.users`, no en `profiles`.
- Los roles son datos (tabla `roles`, ej.: `admin`, `delivery`, `cajero`, `mesero`), no un enum fijo. Un usuario puede tener varios.
- Baja lógica: `profiles.active` + `profiles.archived_at`. No se borra la fila.

## Entidad `User`

| Campo         | Tipo                        | Notas                                               |
| ------------- | --------------------------- | --------------------------------------------------- |
| `id`          | `uuid`                      | `profiles.id`, igual a `auth.users.id`              |
| `email`       | `string`                    | De `auth.users.email`. Único                        |
| `full_name`   | `string`                    | `profiles.full_name`. 2–80 caracteres               |
| `phone`       | `string \| null`            | `profiles.phone`. Formato E.164                     |
| `notes`       | `string \| null`            | `profiles.notes`. Texto libre, máx. 500 caracteres  |
| `roles`       | `string[]`                  | Códigos (`roles.code`) vía `user_roles`             |
| `active`      | `boolean`                   | `profiles.active`                                   |
| `archived_at` | `string (ISO 8601) \| null` | `profiles.archived_at`. No nulo = usuario archivado |
| `created_at`  | `string (ISO 8601)`         | `profiles.created_at`                               |
| `updated_at`  | `string (ISO 8601)`         | `profiles.updated_at`                               |

## Actions

| Action                        | Input                                           | Éxito (`data`)                                                     | Errores                                                      | API                                                    |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------ |
| [`createUser`](createUser.md) | `email`, `full_name`, `roles`, `phone`, `notes` | `User`                                                             | `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`  | `POST /api/users`                                      |
| [`getUser`](getUser.md)       | `id`                                            | `User`                                                             | `VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`              | `GET /api/users/{id}`                                  |
| [`listUsers`](listUsers.md)   | `page`, `pageSize`, `search`, `role`, `active`  | `{ items: User[]; total: number; page: number; pageSize: number }` | `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`              | `GET /api/users?page=&pageSize=&search=&role=&active=` |
| [`updateUser`](updateUser.md) | `id`, `full_name`, `roles`, `phone`, `notes`    | `User`                                                             | `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND` | `PATCH /api/users/{id}`                                |
| [`deleteUser`](deleteUser.md) | `id`                                            | `{ id: string }`                                                   | `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND` | `DELETE /api/users/{id}`                               |

`deleteUser` archiva (`active = false`, `archived_at = now()`); no elimina de `profiles` ni de `auth.users`.

Todas pueden devolver `INTERNAL_ERROR`.
