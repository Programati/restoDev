# categories — Contratos del módulo

## Entidad

Categoría de productos del menú. Modelo de datos, constraints y reglas en
[`Model_category.md`](../../database/model/Model_category.md).

- Tabla: `categories`
- Eliminación: solo **baja lógica** (`deleted_at`); nunca borrado físico desde el flujo de negocio.
- `name` y `slug` son únicos entre todos los registros, incluidos los dados de baja.
- `slug` se genera automáticamente a partir de `name`; el cliente nunca lo envía. **Se regenera cada vez que se modifica `name`** (`updateCategory`).
- Las categorías dadas de baja se pueden renombrar, para liberar su `name` y su `slug`. Al comprobar unicidad, una categoría nunca choca consigo misma.
- Solo se puede dar de baja una categoría **inactiva** (`active = false`); una activa se rechaza con `CONFLICT` y hay que desactivarla antes con `updateCategory`. Cuando exista `products`, tampoco puede tener productos activos.
- Dar de baja una categoría no libera su `name` ni su `slug`, y todavía no se puede restaurar.
- El acceso se rige por permisos (`categories.read`, `categories.manage`), que comprueba cada Action y refuerzan las políticas RLS `categories_select_by_permission`, `categories_insert_by_permission` y `categories_update_by_permission`. No hay política ni `GRANT` de `DELETE`.

## Actions

| Action                 | Descripción                                                                                                                                                     | Permiso                                                                              | Equivalente API                                 | Ficha                                                        | Estado                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `createCategoryAction` | Crea una categoría                                                                                                                                              | `categories.manage`                                                                  | `POST /api/categories → 201` (planificado)      | [`Contract_createCategory.md`](./Contract_createCategory.md) | Action implementada; Route Handler pendiente                                           |
| `getCategoryAction`    | Obtiene una categoría por `id`; con `include_deleted` encuentra también las de baja                                                                             | `categories.read` o `categories.manage`; `include_deleted` exige `categories.manage` | `GET /api/categories/:id → 200` (planificado)   | [`Contract_getCategory.md`](./Contract_getCategory.md)       | Action implementada; Route Handler pendiente                                           |
| `listCategoriesAction` | Lista categorías vigentes con filtros opcionales; con `include_deleted` incluye las de baja                                                                     | `categories.read` o `categories.manage`; `include_deleted` exige `categories.manage` | `GET /api/categories → 200`                     | [`Contract_listCategories.md`](./Contract_listCategories.md) | Action implementada; Route Handler implementado                                        |
| `updateCategoryAction` | Modifica parcialmente cualquier categoría, vigente o dada de baja (`name`, `icon_name`, `display_order`, `active`); regenera el `slug` si cambia `name`         | `categories.manage`                                                                  | `PATCH /api/categories/:id → 200` (planificado) | [`Contract_updateCategory.md`](./Contract_updateCategory.md) | Action implementada; Route Handler pendiente                                           |
| `deleteCategoryAction` | Baja lógica: completa `deleted_at`. Exige categoría inactiva; `CONFLICT` si sigue activa o ya está dada de baja (y, con `products`, si tiene productos activos) | `categories.manage`                                                                  | A definir                                       | [`Contract_deleteCategory.md`](./Contract_deleteCategory.md) | Action implementada; regla de productos activos (requiere `products`) y API pendientes |

## Tipos y archivos compartidos para el front

Cada ficha tiene su sección "Uso desde el front" con los imports exactos. Lo común a todo el módulo:

| Import                | Ruta                                          | Para qué                                                                                                                                                   |
| --------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ActionResult<T>`     | `src/core/types/action-result.ts`             | Resultado de toda Action: `{ ok: true, data, message }` o `{ ok: false, error }`                                                                           |
| `Category`            | `src/core/types/categories/category.types.ts` | Fila completa de una categoría (la devuelve `createCategoryAction`)                                                                                        |
| `CategoryListItem`    | `src/core/types/categories/category.types.ts` | Subconjunto para listados (la devuelve `listCategoriesAction`); no incluye `created_at`, `updated_at` ni `updated_by`                                      |
| `CategoryDetail`      | `src/core/types/categories/category.types.ts` | Subconjunto para el detalle (la devuelven `getCategoryAction`, `updateCategoryAction` y `deleteCategoryAction`); mismos campos que el listado, tipo propio |
| `CreateCategoryInput` | `src/core/types/categories/category.types.ts` | Input de `createCategoryAction` (`z.input` del schema)                                                                                                     |
| `DeleteCategoryInput` | `src/core/types/categories/category.types.ts` | Input de `deleteCategoryAction` (`z.input` del schema)                                                                                                     |
| `GetCategoryInput`    | `src/core/types/categories/category.types.ts` | Input de `getCategoryAction` (`z.input` del schema)                                                                                                        |
| `ListCategoriesInput` | `src/core/types/categories/category.types.ts` | Input de `listCategoriesAction` (`z.input` del schema)                                                                                                     |
| `UpdateCategoryInput` | `src/core/types/categories/category.types.ts` | Input de `updateCategoryAction` (`z.input` del schema)                                                                                                     |

El front importa las Actions y estos tipos. Los schemas Zod (`src/core/schemas/`) y los Servicios
(`src/core/services/`) son del back y no se importan desde componentes cliente. Los tipos `*Dto`
(`z.infer`) son para el Servicio.

La definición funcional de creación está en la
[Historia de Usuario](../../historias_de_usuario/categories/HU_crear_categoria.md); la de la baja,
en [HU-CAT-005](../../historias_de_usuario/categories/HU_eliminar_categoria.md).
