# HU-USR-002 — Listar usuarios

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **listar los usuarios y filtrarlos**, para **encontrar y gestionar a quienes usan el sistema**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta listar usuarios, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `users.manage`, se rechaza con `FORBIDDEN`.
3. Sin filtros, se devuelven todos los usuarios, cualquiera sea su estado (`active`, `inactive` o `pending`).
4. Cada elemento trae `id`, `email`, `full_name`, `phone`, `status`, `is_banned` y `roles` (cada uno con `id`, `code`, `name` e `is_active`). No trae `avatar_path` ni `created_at`.
5. El orden es fijo: `full_name` ascendente y, a igual nombre, `email` ascendente.
6. `search` es opcional: se recorta, admite hasta 80 caracteres y, si queda vacío, no filtra. Busca coincidencias parciales en `full_name` o en `email`, sin distinguir mayúsculas y minúsculas; sí distingue acentos. Los caracteres `%`, `_` y `\` se buscan como texto literal.
7. `status` es opcional: `active`, `inactive` o `pending`. Si se envía, devuelve solo los usuarios con ese estado.
8. `role_id` es opcional (UUID): devuelve solo los usuarios que tienen ese rol, aunque el rol esté inactivo.
9. Los filtros se combinan (deben cumplirse todos).
10. Si no hay resultados, se devuelve una lista vacía; no es un error.
11. Si algún parámetro es inválido, se rechaza con `VALIDATION_ERROR`.
12. No hay paginación: se devuelven todos los usuarios que cumplen los filtros. Si se agrega, el contrato cambia.
13. La operación es de solo lectura, sin efectos secundarios.

## Fuera de alcance

- Paginación y orden configurable.
- Filtrar por fecha de alta o de último ingreso.
- Exportar la lista.

## Alcance actual y pendientes

- **Permiso actual:** `users.manage`, comprobado en la Action antes de validar y reforzado en la RPC.
- **Permiso previsto:** el mismo.
- **Implementado:** nada todavía.
- **Pendiente:** RPC `admin_list_users` (D16), schema, Servicio, Action y la pantalla `/admin/users`.

## Decisiones pendientes

- Si hará falta paginación cuando crezca la cantidad de usuarios.
- Si la búsqueda debe ignorar acentos.

## Referencias

- Contrato: [`Contract_listUsers`](../../contracts/users/Contract_listUsers.md).
- Modelo de datos: [`Model_profile`](../../database/model/Model_profile.md) y [`Model_user_role`](../../database/model/Model_user_role.md).
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
