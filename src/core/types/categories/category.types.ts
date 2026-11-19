import type { z } from "zod"

import type { Database } from "@/core/types/database.types"
import type { createCategorySchema, listCategoriesSchema } from "@/core/schemas/categories"

// Fila completa de la tabla categories
export type Category = Database["public"]["Tables"]["categories"]["Row"]

// Campos que devuelve el listado. `deleted_at` es `null` salvo que se pida `include_deleted`
export type CategoryListItem = Pick<
  Category,
  "id" | "name" | "slug" | "icon_name" | "display_order" | "active" | "deleted_at"
>

// Lo que envía el cliente
export type CreateCategoryInput = z.input<typeof createCategorySchema>
export type ListCategoriesInput = z.input<typeof listCategoriesSchema>

// Lo que recibe el Servicio
export type CreateCategoryDto = z.infer<typeof createCategorySchema>
export type ListCategoriesDto = z.infer<typeof listCategoriesSchema>
