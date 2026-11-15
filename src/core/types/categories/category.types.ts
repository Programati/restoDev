import type { z } from "zod"

import type { Database } from "@/core/types/database.types"
import type { createCategorySchema } from "@/core/schemas/categories"

// Fila completa de la tabla categories
export type Category = Database["public"]["Tables"]["categories"]["Row"]

// Lo que envía el cliente
export type CreateCategoryInput = z.input<typeof createCategorySchema>

// Lo que recibe el Servicio
export type CreateCategoryDto = z.infer<typeof createCategorySchema>
