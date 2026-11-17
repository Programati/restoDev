# categories — Contratos del módulo

## Entidad

Categoría de productos del menú. Modelo de datos, constraints y reglas en
[`docs/database/model/categories.md`](../../database/model/categories.md).

- Tabla: `categories`
- Eliminación: solo **baja lógica** (`deleted_at`); nunca borrado físico desde el flujo de negocio.
- `name` y `slug` son únicos entre todos los registros, incluidos los dados de baja.
- `slug` se genera automáticamente a partir de `name`; el cliente nunca lo envía.

## Actions

| Action                 | Descripción                                    | Permiso actual / previsto             | Equivalente API                            | Ficha                                      | Estado                                                      |
| ---------------------- | ---------------------------------------------- | ------------------------------------- | ------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------- |
| `createCategoryAction` | Crea una categoría                             | Sesión activa / rol `admin` pendiente | `POST /api/categories → 201` (planificado) | [`createCategory.md`](./createCategory.md) | Action implementada; Route Handler y rol `admin` pendientes |
| `getCategory`          | Obtiene una categoría por `id`                 | Pendiente                             | Pendiente                                  | —                                          | Sin ficha                                                   |
| `listCategories`       | Lista categorías                               | Pendiente                             | Pendiente                                  | —                                          | Sin ficha                                                   |
| `updateCategory`       | Modifica una categoría                         | Pendiente                             | Pendiente                                  | —                                          | Sin ficha                                                   |
| `deleteCategory`       | Baja lógica (rechaza si hay productos activos) | Pendiente                             | Pendiente                                  | —                                          | Sin ficha; requiere `products`                              |

La definición funcional de creación está en la [Historia de Usuario](../../historias_de_usuario/categories/crear_categoria.md).
