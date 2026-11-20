# HU-CAT-003 — Listar categorías

> Estado: Implementada (Server Action y Route Handler). Pendiente: rol `admin` para
> `include_deleted`.

## Historia

Como **administrador**, quiero **listar las categorías y filtrarlas**, para **encontrar y gestionar
las que organizan el menú**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta listar categorías, se rechaza con `UNAUTHORIZED`.
2. Dada una persona autenticada, cuando lista sin filtros, recibe todas las categorías vigentes (no
   dadas de baja), activas e inactivas.
3. Cada elemento trae `id`, `name`, `slug`, `icon_name`, `display_order`, `active` y `deleted_at`;
   no trae `created_at`, `updated_at` ni `updated_by`.
4. El orden es fijo: `display_order` ascendente y, a igual orden, `name` ascendente.
5. Si no hay resultados, se devuelve una lista vacía; no es un error.
6. `search` es opcional: se recorta, admite hasta 80 caracteres y, si queda vacío, no filtra. Busca
   coincidencias parciales en `name` sin distinguir mayúsculas y minúsculas; sí distingue acentos
   ("cafe" no encuentra "Café"). Los caracteres `%`, `_` y `\` se buscan como texto literal.
7. `active` es opcional: si se envía (`true` o `false`), devuelve solo las categorías con ese
   estado; si se omite, devuelve activas e inactivas.
8. `include_deleted` es opcional, su default es `false`. Con `true`, incluye también las categorías
   dadas de baja, con su fecha en `deleted_at`.
9. Los filtros se combinan (deben cumplirse todos).
10. Si algún parámetro es inválido (`search` demasiado largo, `active` o `include_deleted` no
    booleanos), se rechaza con `VALIDATION_ERROR`.
11. No hay paginación: se devuelven todas las categorías que cumplen los filtros. Si se agrega, el
    contrato cambia.
12. Si la base rechaza la lectura por permisos, se informa `FORBIDDEN`.
13. La operación es de solo lectura, sin efectos secundarios.

## Fuera de alcance

- Paginación y orden configurable.
- Búsqueda por `slug` o por ícono.
- Cantidad de productos por categoría.
- Restaurar categorías dadas de baja (aunque el listado con `include_deleted` es el paso previo).

## Alcance actual y pendientes

- **Permiso actual:** cualquier usuario autenticado (la política RLS provisoria permite leer).
- **Permiso previsto:** rol `admin` cuando `include_deleted` sea `true` (`TODO(roles)`).
- **Implementado:** Server Action, schema Zod y Servicio con filtro de baja lógica.
- **Pendiente:** exigir el rol `admin` para `include_deleted`. El Route Handler `GET /api/categories`
  está implementado; todavía no hay pantalla `/categories` que consuma el listado.

## Decisiones pendientes

- Si hará falta paginación cuando el menú crezca.
- Si la búsqueda debe ignorar acentos.

## Referencias

- Contrato: [`Contract_listCategories`](../../contracts/categories/Contract_listCategories.md).
- Modelo de datos: [`Model_category`](../../database/model/Model_category.md).
- HU relacionadas: [HU-CAT-002](./HU_obtener_categoria.md), [HU-CAT-005](./HU_eliminar_categoria.md).

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
