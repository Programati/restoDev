# HU-CAT-005 — Eliminar categoría (baja lógica)

> Estado: Implementada parcialmente y mergeada en `develop`. El contrato, la Action, el schema y el
> Servicio existen; los criterios 8 y 10 se implementaron según la propuesta y siguen pendientes de
> confirmar. La regla de productos activos (criterio 9) depende de la tabla `products`, que todavía
> no existe. La tabla de verificación todavía no se completó (diferida hasta tener el Front).

## Historia

Como **administrador**, quiero **dar de baja una categoría**, para **dejar de usar una categoría
que ya no corresponde al menú sin perder su historial**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta dar de baja una categoría, se rechaza con
   `UNAUTHORIZED`.
2. El `id` es obligatorio y debe ser un UUID válido; si no, se rechaza con `VALIDATION_ERROR`.
3. Dada una categoría vigente e **inactiva** (`active = false`), sin productos activos, cuando se da
   de baja, se completa `deleted_at` con la fecha y hora actuales y `updated_by` con el usuario de la
   sesión. La categoría no se borra físicamente.
4. Una categoría dada de baja deja de aparecer por defecto en el listado
   ([HU-CAT-003](./HU_listar_categoria.md)) y en la obtención por `id`
   ([HU-CAT-002](./HU_obtener_categoria.md)); solo se ve con `include_deleted = true`.
5. La baja no libera el `name` ni el `slug`: siguen ocupados y no se pueden usar al crear
   ([HU-CAT-001](./HU_crear_categoria.md)) ni al modificar otra categoría
   ([HU-CAT-004](./HU_actualizar_categoria.md)). Para liberarlos hay que renombrar la categoría dada de
   baja.
6. La baja no modifica los demás campos de la categoría (`name`, `slug`, `icon_name`,
   `display_order`, `active`).
7. Si no existe una categoría con ese `id`, se informa `NOT_FOUND`.
8. Si la categoría ya está dada de baja, se informa `CONFLICT` y no se modifica nada. Si dos
   solicitudes simultáneas intentan dar de baja la misma categoría, una lo logra y la otra recibe
   este resultado. _(Propuesta, a confirmar.)_
9. Si la categoría tiene productos activos, es decir, no todos sus productos asociados están
   inactivos, la baja se rechaza con `CONFLICT`, con un mensaje que indica el motivo, y no se
   modifica nada. La base debe garantizar esta regla aunque la escritura no pase por la Action,
   incluido el caso en que se asigne un producto a la categoría mientras se la da de baja.
   _(Pendiente: requiere `products`.)_
10. Si la baja se realiza con éxito, se devuelve la categoría con su `deleted_at`, sin campos de
    auditoría, y el listado de categorías refleja el cambio. _(Propuesta, a confirmar.)_
11. Si la persona no tiene `categories.manage` o la base rechaza la escritura por permisos, se
    informa `FORBIDDEN`.
12. Si la categoría está **activa** (`active = true`), la baja se rechaza con `CONFLICT` y un mensaje
    que pide desactivarla antes, y no se modifica nada. La baja no desactiva la categoría por su
    cuenta: así una categoría activa no queda dada de baja ni sigue apareciendo como activa. Si la
    categoría está activa y además ya dada de baja, prevalece el criterio 8.

## Fuera de alcance

- Borrado físico: no existe en el flujo de negocio ni en los permisos de la base.
- Restaurar una categoría dada de baja (HU futura, sin definir).
- Dar de baja varias categorías a la vez.
- Dar de baja o reasignar los productos de la categoría.
- Registro en `audit_logs`.

## Alcance actual y pendientes

- **Permiso:** `categories.manage`, comprobado en la Action antes de validar y reforzado por RLS
  (`categories_update_by_permission`, porque la baja es un `UPDATE`). Implementado en la Fase 3 de
  [`Plan_identidad_y_permisos`](../../Plan_identidad_y_permisos.md).
- **Implementado y mergeado en `develop`:** contrato, schema, Servicio y Action
  (`deleteCategoryAction`). La baja es un único `UPDATE` atómico con `deleted_at IS NULL` y
  `active = false`; el Servicio distingue `NOT_FOUND` y los dos `CONFLICT` (ya dada de baja / sigue
  activa) con una consulta posterior. No requirió migración: el `GRANT` de `UPDATE` ya existe y no
  hay `GRANT` de `DELETE`.
- **Pendiente:** la regla de productos activos (criterio 9), que debe crearse en la base junto con
  `products`; el endpoint (a definir); la pantalla/botón en el front (flujo: desactivar y luego dar
  de baja); la auditoría (Fase 4); y completar la tabla de
  verificación de abajo (diferida hasta tener el Front).
- La regla de inactividad (criterio 12) hoy la aplica el Servicio; una escritura directa por la Data
  API podría saltearla. Evaluar un `CHECK (deleted_at is null or active = false)` en la base.
- Hasta que exista la restauración, una categoría dada de baja solo se puede renombrar
  ([HU-CAT-004](./HU_actualizar_categoria.md)); no hay forma de volver a dejarla vigente desde la app.

## Decisiones pendientes

- Qué se considera "producto activo" en la base: `active = true`, y si los productos ya dados de baja
  cuentan o no (se propone que no).
- Confirmar que, si la categoría ya está dada de baja, el resultado es `CONFLICT` (implementado así)
  y no `NOT_FOUND` ni un éxito idempotente.
- Confirmar qué devuelve la operación (hoy, la categoría con `deleted_at`).
- Si conviene blindar en la base que una categoría dada de baja esté inactiva (`CHECK`), y en ese
  caso impedir que `updateCategory` la reactive.
- Si hace falta una HU de restauración (propuesta: HU-CAT-006) y si se hace antes de usar la baja en
  producción.
- Regla para el módulo `products`: no se puede asignar un producto a una categoría dada de baja.

## Referencias

- Contrato: [`Contract_deleteCategory`](../../contracts/categories/Contract_deleteCategory.md).
- Modelo de datos: [`Model_category`](../../database/model/Model_category.md).
- HU relacionadas: [HU-CAT-001](./HU_crear_categoria.md), [HU-CAT-002](./HU_obtener_categoria.md),
  [HU-CAT-003](./HU_listar_categoria.md), [HU-CAT-004](./HU_actualizar_categoria.md).

## Verificación

> **Pruebas diferidas hasta tener el Front (decisión del 2026-11-21).** Se ejecutan junto con la
> matriz de la sección 7 de [`Plan_identidad_y_permisos`](../../Plan_identidad_y_permisos.md) (tarea
> F3.8). Hasta entonces todas las filas quedan en "Pendiente". El criterio 9 sigue pendiente además
> hasta que exista `products`.

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
