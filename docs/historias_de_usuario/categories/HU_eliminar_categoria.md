# HU-CAT-005 — Eliminar categoría (baja lógica)

> Estado: Borrador. Todavía no hay contrato ni código. La regla de productos depende de la tabla
> `products`, que todavía no existe.

## Historia

Como **administrador**, quiero **dar de baja una categoría**, para **dejar de usar una categoría
que ya no corresponde al menú sin perder su historial**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta dar de baja una categoría, se rechaza con
   `UNAUTHORIZED`.
2. El `id` es obligatorio y debe ser un UUID válido; si no, se rechaza con `VALIDATION_ERROR`.
3. Dada una categoría vigente sin productos activos, cuando se da de baja, se completa `deleted_at`
   con la fecha y hora actuales y `updated_by` con el usuario de la sesión. La categoría no se borra
   físicamente.
4. Una categoría dada de baja deja de aparecer por defecto en el listado
   ([HU-CAT-003](./HU_listar_categoria.md)) y en la obtención por `id`
   ([HU-CAT-002](./HU_obtener_categoria.md)); solo se ve con `include_deleted = true`.
5. La baja no libera el `name` ni el `slug`: siguen ocupados y no se pueden usar al crear
   ([HU-CAT-001](./HU_crear_categoria.md)) ni al modificar otra categoría
   ([HU-CAT-004](./HU_actualizar_categoria.md)). Para liberarlos hay que renombrar la categoría dada de
   baja.
6. La baja no modifica los demás campos de la categoría (`name`, `slug`, `icon_name`,
   `display_order`, `active`). _(Propuesta, a confirmar.)_
7. Si no existe una categoría con ese `id`, se informa `NOT_FOUND`.
8. Si la categoría ya está dada de baja, se informa `CONFLICT` y no se modifica nada. Si dos
   solicitudes simultáneas intentan dar de baja la misma categoría, una lo logra y la otra recibe
   este resultado. _(Propuesta, a confirmar.)_
9. Si la categoría tiene productos activos, la baja se rechaza con `CONFLICT`, con un mensaje que
   indica el motivo, y no se modifica nada. La base debe garantizar esta regla aunque la escritura no
   pase por la Action, incluido el caso en que se asigne un producto a la categoría mientras se la da
   de baja. _(Pendiente: requiere `products`.)_
10. Si la baja se realiza con éxito, se devuelve la categoría con su `deleted_at`, sin campos de
    auditoría, y el listado de categorías refleja el cambio. _(Propuesta, a confirmar.)_
11. Si la base rechaza la escritura por permisos, se informa `FORBIDDEN`.

## Fuera de alcance

- Borrado físico: no existe en el flujo de negocio ni en los permisos de la base.
- Restaurar una categoría dada de baja (HU futura, sin definir).
- Dar de baja varias categorías a la vez.
- Dar de baja o reasignar los productos de la categoría.
- Registro en `audit_logs`.

## Alcance actual y pendientes

- **Permiso actual (propuesto):** cualquier usuario autenticado, igual que el resto de `categories`.
- **Permiso previsto:** rol `admin` (`TODO(roles)`).
- **Implementado:** nada.
- **Pendiente:** contrato, Action, schema y Servicio; la regla de productos activos (criterio 9),
  que debe crearse junto con `products`; el endpoint (a definir) y la auditoría.
- Hasta que exista la restauración, una categoría dada de baja solo se puede renombrar
  ([HU-CAT-004](./HU_actualizar_categoria.md)); no hay forma de volver a dejarla vigente desde la app.

## Decisiones pendientes

- Qué se considera "producto activo": ¿`active = true` y no dado de baja? ¿Los productos inactivos
  también bloquean la baja?
- Qué ocurre si la categoría ya está dada de baja: `CONFLICT` (propuesto), `NOT_FOUND` o éxito
  idempotente.
- Si la baja debe poner también `active = false`.
- Qué devuelve la operación (se propone la categoría con `deleted_at`).
- Si hace falta una HU de restauración (propuesta: HU-CAT-006) y si se hace antes de usar la baja en
  producción.
- Regla para el módulo `products`: no se puede asignar un producto a una categoría dada de baja.

## Referencias

- Contrato: pendiente (todavía no existe `Contract_deleteCategory.md`).
- Modelo de datos: [`Model_category`](../../database/model/Model_category.md).
- HU relacionadas: [HU-CAT-001](./HU_crear_categoria.md), [HU-CAT-002](./HU_obtener_categoria.md),
  [HU-CAT-003](./HU_listar_categoria.md), [HU-CAT-004](./HU_actualizar_categoria.md).

## Verificación

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
