# HU-ROL-002 — Listar roles

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **listar los roles y filtrarlos**, para **encontrar y gestionar los que definen el acceso al sistema**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta listar roles, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `roles.manage` ni `users.manage`, se rechaza con `FORBIDDEN`. El permiso se comprueba antes de validar.
3. Sin filtros, se devuelven todos los roles: activos, inactivos y del sistema.
4. Cada elemento trae `id`, `code`, `name`, `description`, `is_system` e `is_active`. No trae `created_at` ni los permisos del rol (para eso, [HU-ROL-003](./HU_obtener_rol.md)).
5. El orden es fijo: `name` ascendente.
6. `search` es opcional: se recorta, admite hasta 80 caracteres y, si queda vacío, no filtra. Busca coincidencias parciales en `name`, sin distinguir mayúsculas y minúsculas; sí distingue acentos. Los caracteres `%`, `_` y `\` se buscan como texto literal.
7. `is_active` es opcional: si se envía (`true` o `false`), devuelve solo los roles con ese estado; si se omite, devuelve activos e inactivos.
8. Los filtros se combinan (deben cumplirse todos).
9. Si no hay resultados, se devuelve una lista vacía; no es un error.
10. Si algún parámetro es inválido (`search` demasiado largo, `is_active` no booleano), se rechaza con `VALIDATION_ERROR`.
11. No hay paginación: se devuelven todos los roles que cumplen los filtros. Si se agrega, el contrato cambia.
12. La operación es de solo lectura, sin efectos secundarios.

## Fuera de alcance

- Paginación y orden configurable.
- Búsqueda por `code` o por descripción.
- Cantidad de usuarios o de permisos por rol.
- Filtrar por `is_system`.

## Alcance actual y pendientes

- **Permiso actual:** `roles.manage` o `users.manage` (esta última para que la pantalla de usuarios pueda ofrecer los roles al asignarlos), comprobado en la Action antes de validar. RLS lo refuerza (`roles_select_active_users`: cualquier perfil activo lee `roles`).
- **Permiso previsto:** el mismo.
- **Implementado:** nada todavía.
- **Pendiente:** schema, Servicio (lectura directa de `roles`, sin RPC), Action, tipos y la pantalla `/admin/roles`.

## Decisiones pendientes

- Si `users.manage` debe poder listar roles o si basta `roles.manage` y la pantalla de usuarios obtiene los roles por otra vía.
- Si hará falta paginación cuando crezca la cantidad de roles.
- Si la búsqueda debe incluir `code` o ignorar acentos.

## Referencias

- Contrato: [`Contract_listRoles`](../../contracts/roles/Contract_listRoles.md).
- Modelo de datos: [`Model_role`](../../database/model/Model_role.md).
- HU relacionadas: [HU-ROL-003](./HU_obtener_rol.md), [HU-USR-006](../users/HU_asignar_roles_usuario.md).

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
