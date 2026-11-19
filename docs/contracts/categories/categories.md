# categories — Contratos del módulo

## Entidad

Categoría de productos del menú. Modelo de datos, constraints y reglas en
[`docs/database/model/categories.md`](../../database/model/categories.md).

- Tabla: `categories`
- Eliminación: solo **baja lógica** (`deleted_at`); nunca borrado físico desde el flujo de negocio.
- `name` y `slug` son únicos entre todos los registros, incluidos los dados de baja.
- `slug` se genera automáticamente a partir de `name`; el cliente nunca lo envía.

## Actions

| Action                 | Descripción                                                                                 | Permiso actual / previsto                                                 | Equivalente API                               | Ficha                                      | Estado                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `createCategoryAction` | Crea una categoría                                                                          | Sesión activa / rol `admin` pendiente                                     | `POST /api/categories → 201` (planificado)    | [`createCategory.md`](./createCategory.md) | Action implementada; Route Handler y rol `admin` pendientes |
| `getCategoryAction`    | Obtiene una categoría por `id`; con `include_deleted` encuentra también las de baja         | Sesión activa (provisorio) / rol `admin` para `include_deleted` pendiente | `GET /api/categories/:id → 200` (planificado) | [`getCategory.md`](./getCategory.md)       | Action implementada; rol `admin` y Route Handler pendientes |
| `listCategoriesAction` | Lista categorías vigentes con filtros opcionales; con `include_deleted` incluye las de baja | Sesión activa (provisorio) / rol `admin` para `include_deleted` pendiente | `GET /api/categories → 200`                   | [`listCategories.md`](./listCategories.md) | Action implementada; rol `admin` y Route Handler pendientes |
| `updateCategory`       | Modifica una categoría                                                                      | Pendiente                                                                 | Pendiente                                     | —                                          | Sin ficha                                                   |
| `deleteCategory`       | Baja lógica (rechaza si hay productos activos)                                              | Pendiente                                                                 | Pendiente                                     | —                                          | Sin ficha; requiere `products`                              |

## Tipos y archivos compartidos para el front

Cada ficha tiene su sección "Uso desde el front" con los imports exactos. Lo común a todo el módulo:

| Import                | Ruta                                          | Para qué                                                                                                              |
| --------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ActionResult<T>`     | `src/core/types/action-result.ts`             | Resultado de toda Action: `{ ok: true, data, message }` o `{ ok: false, error }`                                      |
| `Category`            | `src/core/types/categories/category.types.ts` | Fila completa de una categoría (la devuelve `createCategoryAction`)                                                   |
| `CategoryListItem`    | `src/core/types/categories/category.types.ts` | Subconjunto para listados (la devuelve `listCategoriesAction`); no incluye `created_at`, `updated_at` ni `updated_by` |
| `CategoryDetail`      | `src/core/types/categories/category.types.ts` | Subconjunto para el detalle (la devuelve `getCategoryAction`); mismos campos que el listado, tipo propio              |
| `CreateCategoryInput` | `src/core/types/categories/category.types.ts` | Input de `createCategoryAction` (`z.input` del schema)                                                                |
| `GetCategoryInput`    | `src/core/types/categories/category.types.ts` | Input de `getCategoryAction` (`z.input` del schema)                                                                   |
| `ListCategoriesInput` | `src/core/types/categories/category.types.ts` | Input de `listCategoriesAction` (`z.input` del schema)                                                                |

El front importa las Actions y estos tipos. Los schemas Zod (`src/core/schemas/`) y los Servicios
(`src/core/services/`) son del back y no se importan desde componentes cliente. Los tipos `*Dto`
(`z.infer`) son para el Servicio.

La definición funcional de creación está en la [Historia de Usuario](../../historias_de_usuario/categories/crear_categoria.md).
