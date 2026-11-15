# categories — Contratos del módulo

## Entidad

Categoría de productos del menú. Modelo de datos, constraints y reglas en
[`docs/database/modelo/categories.md`](../../database/modelo/categories.md).

- Tabla: `categories`
- Eliminación: solo **baja lógica** (`deleted_at`); nunca borrado físico desde el flujo de negocio.
- `name` y `slug` son únicos entre todos los registros, incluidos los dados de baja.
- `slug` se genera automáticamente a partir de `name`; el cliente nunca lo envía.

## Actions

| Action           | Descripción                                    | Permiso                                 | Equivalente API              | Ficha                                      | Estado                         |
| ---------------- | ---------------------------------------------- | --------------------------------------- | ---------------------------- | ------------------------------------------ | ------------------------------ |
| `createCategory` | Crea una categoría                             | Sesión activa, rol `admin` (provisorio) | `POST /api/categories → 201` | [`createCategory.md`](./createCategory.md) | Implementada                   |
| `getCategory`    | Obtiene una categoría por `id`                 | Pendiente                               | Pendiente                    | —                                          | Sin ficha                      |
| `listCategories` | Lista categorías                               | Pendiente                               | Pendiente                    | —                                          | Sin ficha                      |
| `updateCategory` | Modifica una categoría                         | Pendiente                               | Pendiente                    | —                                          | Sin ficha                      |
| `deleteCategory` | Baja lógica (rechaza si hay productos activos) | Pendiente                               | Pendiente                    | —                                          | Sin ficha; requiere `products` |
