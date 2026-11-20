import { z } from "zod"

export const listCategoriesSchema = z.object({
  search: z
    .string({ error: "La búsqueda debe ser texto" })
    .trim()
    .max(80, "La búsqueda no puede superar los 80 caracteres")
    .optional(),
  active: z.boolean({ error: "El estado activo debe ser verdadero o falso" }).optional(),
  include_deleted: z.boolean({ error: "include_deleted debe ser verdadero o falso" }).optional(),
})
