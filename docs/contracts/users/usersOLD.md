# Módulo usuarios

Tabla `profiles` (1:1 con `auth.users`). RLS activo.

## Entidad `User`

| Campo        | Tipo                             | Notas                   |
| ------------ | -------------------------------- | ----------------------- |
| `id`         | `uuid`                           | Igual a `auth.users.id` |
| `email`      | `string`                         | Único                   |
| `full_name`  | `string`                         | 2–80 caracteres         |
| `role`       | `"admin" \| "staff" \| "client"` |                         |
| `phone`      | `string \| null`                 | Formato E.164           |
| `avatar_url` | `string \| null`                 | URL de Supabase Storage |
| `created_at` | `string (ISO 8601)`              |                         |

## Actions

| Action                        | Input                                 | Éxito (`data`)                                                     | Errores                                                      | API                                            |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------- |
| [`createUser`](createUser.md) | `email`, `full_name`, `role`, `phone` | `User`                                                             | `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`  | `POST /api/users`                              |
| [`getUser`](getUser.md)       | `id`                                  | `User`                                                             | `VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`              | `GET /api/users/{id}`                          |
| [`listUsers`](listUsers.md)   | `page`, `pageSize`, `search`, `role`  | `{ items: User[]; total: number; page: number; pageSize: number }` | `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`              | `GET /api/users?page=&pageSize=&search=&role=` |
| [`updateUser`](updateUser.md) | `id`, `full_name`, `role`, `phone`    | `User`                                                             | `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND` | `PATCH /api/users/{id}`                        |
| [`deleteUser`](deleteUser.md) | `id`                                  | `{ id: string }`                                                   | `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND` | `DELETE /api/users/{id}`                       |

Todas pueden devolver `INTERNAL_ERROR`.
