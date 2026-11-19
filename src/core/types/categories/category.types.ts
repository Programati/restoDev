import type { z } from "zod"

import type { Database } from "@/core/types/database.types"
import type {
  createCategorySchema,
  getCategorySchema,
  listCategoriesSchema,
  updateCategorySchema,
} from "@/core/schemas/categories"

// Fila completa de la tabla categories
export type Category = Database["public"]["Tables"]["categories"]["Row"]

// Campos que devuelve el listado. `deleted_at` es `null` salvo que se pida `include_deleted`
export type CategoryListItem = Pick<
  Category,
  "id" | "name" | "slug" | "icon_name" | "display_order" | "active" | "deleted_at"
>

// Campos que devuelve getCategory y updateCategory. Hoy coinciden con el listado, pero es un tipo
// propio para poder ampliar el detalle sin tocar el listado. `deleted_at` es `null` salvo que la
// categoría esté dada de baja (getCategory con `include_deleted`, o updateCategory sobre una de baja)
export type CategoryDetail = Pick<
  Category,
  "id" | "name" | "slug" | "icon_name" | "display_order" | "active" | "deleted_at"
>

// Lo que envía el cliente
export type CreateCategoryInput = z.input<typeof createCategorySchema>
export type GetCategoryInput = z.input<typeof getCategorySchema>
export type ListCategoriesInput = z.input<typeof listCategoriesSchema>
export type UpdateCategoryInput = z.input<typeof updateCategorySchema>

// Lo que recibe el Servicio
export type CreateCategoryDto = z.infer<typeof createCategorySchema>
export type GetCategoryDto = z.infer<typeof getCategorySchema>
export type ListCategoriesDto = z.infer<typeof listCategoriesSchema>
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>
