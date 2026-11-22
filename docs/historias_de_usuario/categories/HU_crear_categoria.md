# HU-CAT-001 — Crear categoría

> Estado: Implementada (Server Action). Pendientes: Route Handler y auditoría
> (ver "Alcance actual y pendientes").

## Historia

Como **administrador**, quiero **crear una categoría**, para **organizar los productos del menú**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta crear una categoría mediante la Action, la operación
   se rechaza con `UNAUTHORIZED`.
2. Dada una persona autenticada, cuando envía datos válidos, se crea la categoría y se devuelve la
   categoría creada (con su `id`, `slug` y demás campos). La categoría nueva aparece en el listado
   de categorías vigentes.
3. El nombre se recorta antes de guardarse, es obligatorio y debe tener entre 2 y 80 caracteres. Un
   nombre formado solo por espacios cuenta como vacío.
4. No se puede repetir un nombre, sin distinguir mayúsculas y minúsculas, incluso si la categoría
   existente está dada de baja. Se informa `CONFLICT`. Para reutilizar el nombre de una categoría
   dada de baja hay que renombrar esa categoría ([HU-CAT-004](./HU_actualizar_categoria.md)), no crear
   una nueva.
5. El ícono es opcional; si se envía, se recorta y debe tener entre 1 y 50 caracteres. Si se omite,
   se guarda como `null`.
6. El orden es un entero mayor o igual a cero y menor o igual a 2147483647 (el máximo que admite la
   base); si se omite, su valor es `0`. Un límite de negocio menor está pendiente de definir.
7. El estado activo es booleano y, si se omite, su valor es `true`.
8. El `slug` no se recibe del formulario: se genera desde el nombre en minúsculas, sin acentos y con
   palabras separadas por guiones (formato `^[a-z0-9]+(-[a-z0-9]+)*$`). Si el nombre no contiene
   letras ni números, el `slug` base es `categoria`. Si el `slug` ya existe, se resuelve con un
   sufijo numérico (`-2`, `-3`, ...), incluso si el `slug` ocupado pertenece a una categoría dada de
   baja. Nunca se informa error por colisión de `slug`.
9. La categoría se crea con `deleted_at = null` y `updated_by` igual al usuario de la sesión. Las
   fechas de creación y modificación las asigna la base.
10. Los datos inválidos se rechazan con `VALIDATION_ERROR` y errores asociados a los campos que
    fallaron.
11. Concurrencia: si dos solicitudes simultáneas usan el mismo nombre, una crea la categoría y la
    otra recibe `CONFLICT`. Si el `slug` se ocupa en simultáneo, se reintenta automáticamente; si
    aun así no se logra reservar, se informa `INTERNAL_ERROR`.
12. Integridad: la base también exige los límites de longitud, el formato del `slug` y el orden no
    negativo, de modo que una escritura que no pase por la Action no pueda dejar datos inválidos.
13. Si la solicitud incluye `slug`, `deleted_at`, `updated_by`, `id` o fechas, esos valores se
    ignoran.
14. Dada una persona con sesión pero sin el permiso `categories.manage`, cuando intenta
    crear una categoría, se rechaza con `FORBIDDEN` y no se crea nada.

## Fuera de alcance

- Editar, dar de baja o restaurar una categoría (ver HU-CAT-004 y HU-CAT-005).
- Comprobar que `icon_name` exista en un catálogo de íconos.
- Asociar productos a la categoría.
- Registro en `audit_logs`.

## Alcance actual y pendientes

- **Permiso:** `categories.manage`. La Action lo comprueba antes de validar (`FORBIDDEN`) y RLS lo
  refuerza (política `categories_insert_by_permission`).
- **Implementado:** Server Action con verificación de permiso, schema Zod, Servicio, migraciones y
  formulario.
- **Pendiente:** el endpoint `POST /api/categories` (objetivo futuro, todavía no existe); el
  registro en `audit_logs`, hasta implementar el mecanismo de auditoría (Fase 4).

## Decisiones pendientes

- Límite de negocio para el orden (hoy solo el tope técnico de la base). Hay que agregarlo en Zod y
  en un `CHECK`: hoy Zod no tiene máximo y un valor mayor a 2147483647 llegaría a la base y se
  informaría como `INTERNAL_ERROR` en lugar de `VALIDATION_ERROR`.
- Confirmar los límites de `name` (2–80) e `icon_name` (1–50), que provienen del contrato.

## Referencias

- Contrato: [`Contract_createCategory`](../../contracts/categories/Contract_createCategory.md).
- Modelo de datos: [`Model_category`](../../database/model/Model_category.md).

## Verificación

> **Pruebas diferidas hasta tener el Front (decisión del 2026-11-21).** Se ejecutan junto con la
> matriz de la sección 7 de [`Plan_identidad_y_permisos`](../../Plan_identidad_y_permisos.md) (tarea
> F3.8). Hasta entonces todas las filas quedan en "Pendiente".

Las pruebas manuales reportadas no registran los casos individuales; hasta registrarlos, quedan
pendientes.

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
