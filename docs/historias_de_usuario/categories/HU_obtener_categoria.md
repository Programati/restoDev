# HU-CAT-002 — Obtener categoría

> Estado: Implementada (Server Action). Pendiente: Route
> Handler.

## Historia

Como **administrador**, quiero **ver el detalle de una categoría**, para **revisarla o editarla**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta obtener una categoría, se rechaza con
   `UNAUTHORIZED`.
2. Dada una persona autenticada y una categoría vigente, cuando la pide por su `id`, recibe `id`,
   `name`, `slug`, `icon_name`, `display_order`, `active` y `deleted_at` (`null`).
3. No se devuelven los campos de auditoría (`created_at`, `updated_at`, `updated_by`).
4. El `id` es obligatorio y debe ser un UUID válido; si no, se rechaza con `VALIDATION_ERROR` con
   el error asociado a `id`.
5. Si no existe una categoría con ese `id`, se informa `NOT_FOUND`.
6. Una categoría vigente con `active = false` se obtiene con normalidad.
7. Por defecto, una categoría dada de baja no se encuentra: se informa `NOT_FOUND`, igual que si no
   existiera.
8. Con `include_deleted = true`, también se obtiene una categoría dada de baja, con su fecha de
   baja en `deleted_at`.
9. `include_deleted` es opcional, su default es `false` y debe ser booleano; si no, se informa
   `VALIDATION_ERROR`.
10. Si la persona no tiene `categories.read` ni `categories.manage`, o pide `include_deleted` sin
    `categories.manage`, o la base rechaza la lectura por permisos, se informa `FORBIDDEN`. Si la política de acceso
    oculta la fila, el resultado es `NOT_FOUND`.
11. La operación es de solo lectura: no modifica la categoría ni tiene efectos secundarios.

## Fuera de alcance

- Obtener por `slug`.
- Mostrar los productos de la categoría o su cantidad.
- Historial o auditoría de cambios.
- Restaurar una categoría dada de baja.

## Alcance actual y pendientes

- **Permiso:** `categories.read` o `categories.manage`; con `include_deleted: true`,
  `categories.manage`. La Action lo comprueba antes de validar (el de `include_deleted`, tras validar)
  y RLS lo refuerza (`categories_select_by_permission`): `categories.read` solo ve las vigentes.
- **Implementado:** Server Action con verificación de permiso, schema Zod y Servicio.
- **Pendiente:** el endpoint `GET /api/categories/:id` (planificado, todavía no existe).

## Decisiones pendientes

- Ninguna por ahora (las categorías dadas de baja las ve quien tiene `categories.manage`).

## Referencias

- Contrato: [`Contract_getCategory`](../../contracts/categories/Contract_getCategory.md).
- Modelo de datos: [`Model_category`](../../database/model/Model_category.md).
- HU relacionadas: [HU-CAT-003](./HU_listar_categoria.md), [HU-CAT-004](./HU_actualizar_categoria.md).

## Verificación

> **Pruebas diferidas hasta tener el Front (decisión del 2026-11-21).** Se ejecutan junto con la
> matriz de la sección 7 de [`Plan_identidad_y_permisos`](../../Plan_identidad_y_permisos.md) (tarea
> F3.8). Hasta entonces todas las filas quedan en "Pendiente".

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
