# HU-ROL-001 — Crear rol

> Estado: Borrador (documentada en la Fase 6; sin implementar)

## Historia

Como **administrador**, quiero **crear un rol con su código y nombre**, para **agrupar permisos y asignárselos a quienes los necesiten**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta crear un rol, se rechaza con `UNAUTHORIZED`.
2. Dada una persona con sesión pero sin `roles.manage`, se rechaza con `FORBIDDEN` y no se crea nada. El permiso se comprueba antes de validar.
3. Dada una persona con `roles.manage` y datos válidos, se crea el rol y se devuelve el rol creado, activo, sin permisos y sin marca de sistema.
4. `code` es obligatorio: se recorta y debe tener entre 2 y 50 caracteres, empezar con una letra minúscula y contener solo minúsculas, dígitos, `_`, `.` o `-`. No se pasa a minúsculas: un código con mayúsculas se rechaza con `VALIDATION_ERROR`.
5. No se puede repetir un `code`: se informa `CONFLICT` y no se crea nada.
6. `name` es obligatorio: se recorta y tiene entre 2 y 60 caracteres. No se puede repetir, sin distinguir mayúsculas y minúsculas: se informa `CONFLICT`.
7. `description` es opcional: si se envía, se recorta y tiene entre 1 y 250 caracteres; si se omite o es `null`, el rol queda sin descripción.
8. El rol nace siempre activo (`is_active = true`) y no es de sistema (`is_system = false`). Si la solicitud incluye `is_active`, `is_system`, `id` o fechas, se ignoran.
9. El rol nace sin permisos: se definen después ([HU-ROL-006](./HU_definir_permisos_rol.md)).
10. Los datos inválidos se rechazan con `VALIDATION_ERROR` y errores asociados a los campos que fallaron.
11. Concurrencia: si dos solicitudes simultáneas usan el mismo `code` o el mismo `name`, una crea el rol y la otra recibe `CONFLICT`.
12. Integridad: la base también exige el formato del `code` y los límites de longitud, de modo que una escritura que no pase por la Action no pueda dejar datos inválidos.
13. El alta queda registrada en `audit_logs` (evento `insert`, con el actor) por el trigger `audit_roles`.
14. Tras el alta se revalida la lista de roles (`/admin/roles`).

## Fuera de alcance

- Definir los permisos del rol ([HU-ROL-006](./HU_definir_permisos_rol.md)).
- Crear roles del sistema (`is_system`): solo por migración.
- Duplicar un rol existente.
- Roles operativos (cajero, mesero, delivery): se definen en `Reglas_de_negocio.md` antes de sembrarse con su módulo.

## Alcance actual y pendientes

- **Permiso actual:** `roles.manage`, comprobado en la Action antes de validar y reforzado en la RPC.
- **Permiso previsto:** el mismo.
- **Implementado:** la tabla `roles` con sus `CHECK` e índices únicos y el trigger de auditoría `audit_roles`; nada propio de la operación.
- **Pendiente:** RPC `admin_create_role` (D13), schema, Servicio, Action, tipos y el formulario `/admin/roles/new`.

## Decisiones pendientes

- Si un rol puede crearse inactivo (propuesta: no; nace activo y se desactiva con [HU-ROL-004](./HU_actualizar_rol.md)).
- Si se aceptan permisos al crear (propuesta: no; se definen con HU-ROL-006).
- Si `code` se normaliza a minúsculas en lugar de rechazar las mayúsculas (propuesta: rechazar, coherente con el `CHECK`).

## Referencias

- Contrato: [`Contract_createRole`](../../contracts/roles/Contract_createRole.md).
- Modelo de datos: [`Model_role`](../../database/model/Model_role.md).
- HU relacionadas: [HU-ROL-006](./HU_definir_permisos_rol.md), [HU-USR-006](../users/HU_asignar_roles_usuario.md).

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
