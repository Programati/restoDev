# HU-USR-003 — Obtener usuario

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **ver el detalle de un usuario**, para **revisarlo o editarlo**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta obtener un usuario, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `users.manage`, se rechaza con `FORBIDDEN`.
3. El `id` es obligatorio y debe ser un UUID válido; si no, se rechaza con `VALIDATION_ERROR` con el error asociado a `id`.
4. Si no existe un usuario con ese `id`, se informa `NOT_FOUND`.
5. Si existe, se devuelven `id`, `email`, `full_name`, `phone`, `avatar_path`, `status`, `is_banned`, `created_at` y `roles` (cada uno con `id`, `code`, `name` e `is_active`).
6. Un usuario `inactive` o `pending` se obtiene con normalidad.
7. `roles` incluye también los roles inactivos, con `is_active = false`.
8. La operación es de solo lectura, sin efectos secundarios.

## Fuera de alcance

- Historial de cambios del usuario (se consulta en `audit_logs`).
- Último ingreso y sesiones activas.

## Alcance actual y pendientes

- **Permiso actual:** `users.manage`.
- **Permiso previsto:** el mismo.
- **Implementado:** nada todavía.
- **Pendiente:** RPC `admin_get_user` (D16), schema, Servicio, Action y la pantalla de detalle.

## Decisiones pendientes

- Ninguna por ahora.

## Referencias

- Contrato: [`Contract_getUser`](../../contracts/users/Contract_getUser.md).
- Modelo de datos: [`Model_profile`](../../database/model/Model_profile.md).
- HU relacionadas: [HU-USR-002](./HU_listar_usuarios.md), [HU-USR-004](./HU_actualizar_usuario.md).

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
