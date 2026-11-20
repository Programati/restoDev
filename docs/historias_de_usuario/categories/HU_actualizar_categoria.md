# HU-CAT-004 — Actualizar categoría

> Estado: Implementada (Server Action). Pendientes: rol `admin`, Route Handler y auditoría.

## Historia

Como **administrador**, quiero **modificar una categoría**, para **mantener actualizado el
menú**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta modificar una categoría, se rechaza con
   `UNAUTHORIZED`.
2. El `id` es obligatorio y debe ser un UUID válido; si no, se rechaza con `VALIDATION_ERROR`.
3. Si no existe una categoría con ese `id`, se informa `NOT_FOUND`.
4. La actualización es parcial: solo cambian los campos enviados; los omitidos conservan su valor.
5. Además del `id`, hay que enviar al menos un campo a modificar; si no, se rechaza con
   `VALIDATION_ERROR`.
6. El nombre, si se envía, se recorta y tiene las mismas reglas que al crear
   ([HU-CAT-001](./HU_crear_categoria.md)): entre 2 y 80 caracteres. Ninguna otra categoría (vigente o
   dada de baja) puede tener ese nombre, sin distinguir mayúsculas y minúsculas; si lo tiene, se
   informa `CONFLICT`.
7. Una categoría no choca consigo misma: conservar su nombre actual o cambiar solo las mayúsculas y
   minúsculas es válido.
8. Si se envía `name`, el `slug` se regenera con la misma regla que al crear (minúsculas, sin
   acentos, guiones; `categoria` si no quedan letras ni números). Si el `slug` lo ocupa otra
   categoría, vigente o dada de baja, se agrega un sufijo numérico; el `slug` propio no cuenta como
   ocupado y nunca se informa error por colisión de `slug`. Si no se envía `name`, el `slug` no
   cambia. Consecuencia: cambiar el nombre cambia el `slug`, y el front debe enviar `name` solo si
   el usuario lo modificó.
9. `icon_name`, si se envía, se recorta y tiene entre 1 y 50 caracteres; `null` quita el ícono y
   omitirlo lo deja como está.
10. `display_order`, si se envía, es un entero entre 0 y 2147483647; `active`, si se envía, es
    booleano.
11. Se pueden modificar las categorías vigentes y las dadas de baja, para que una categoría dada de
    baja pueda liberar su nombre y su `slug`. La operación nunca modifica `deleted_at`: dar de baja
    y restaurar son otras operaciones.
12. `updated_by` se completa con el usuario de la sesión y `updated_at` se actualiza siempre, incluso
    si los valores enviados son iguales a los actuales (no se detectan "sin cambios").
13. Concurrencia: gana la última escritura. Si dos solicitudes simultáneas asignan el mismo nombre a
    categorías distintas, una recibe `CONFLICT`. Si el `slug` se ocupa en simultáneo, se reintenta
    automáticamente; si aun así no se logra, se informa `INTERNAL_ERROR`.
14. La base también exige los límites de longitud, el formato del `slug` y el orden no negativo.
15. Si se modifica con éxito, se devuelve la categoría ya modificada (con el `slug` nuevo, si
    cambió) sin campos de auditoría, y el listado de categorías refleja el cambio.
16. Si la solicitud incluye `slug`, `deleted_at`, `updated_by` o fechas, esos valores se ignoran.
    Un input con solo el `id` y esos campos se rechaza por no tener nada que modificar.
17. Si la base rechaza la escritura por permisos, se informa `FORBIDDEN`; si la política de acceso
    oculta la fila, el resultado es `NOT_FOUND`.

## Fuera de alcance

- Dar de baja ([HU-CAT-005](./HU_eliminar_categoria.md)) y restaurar una categoría.
- Modificar varias categorías a la vez (por ejemplo, reordenar en lote).
- Control de versión optimista.
- Registro en `audit_logs`.

## Alcance actual y pendientes

- **Permiso actual:** cualquier usuario autenticado; política RLS provisoria.
- **Permiso previsto:** rol `admin` (`TODO(roles)`), evaluando si modificar categorías dadas de baja
  requiere el mismo permiso.
- **Implementado:** Server Action, schema Zod y Servicio.
- **Pendiente:** exigir el rol `admin`, el endpoint `PATCH /api/categories/:id` (planificado, todavía
  no existe) y la auditoría.

## Decisiones pendientes

- Qué ocurre al desactivar (`active: false`) una categoría con productos activos, cuando exista
  `products`.
- Si se debe poder poner `active: true` a una categoría dada de baja. Hoy se permite y no tiene
  efecto visible; la restauración será otra operación.
- Si cambiar el `slug` al renombrar es aceptable cuando existan enlaces que lo usen.

## Referencias

- Contrato: [`Contract_updateCategory`](../../contracts/categories/Contract_updateCategory.md).
- Modelo de datos: [`Model_category`](../../database/model/Model_category.md).
- HU relacionadas: [HU-CAT-001](./HU_crear_categoria.md), [HU-CAT-002](./HU_obtener_categoria.md),
  [HU-CAT-005](./HU_eliminar_categoria.md).

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
| 12       |                  | Pendiente |       |
| 13       |                  | Pendiente |       |
| 14       |                  | Pendiente |       |
| 15       |                  | Pendiente |       |
| 16       |                  | Pendiente |       |
| 17       |                  | Pendiente |       |
