import { z } from "zod"

export const getCategorySchema = z.object({
  id: z.uuid({ error: "El id debe ser un UUID válido" }),
  include_deleted: z.boolean({ error: "include_deleted debe ser verdadero o falso" }).optional(),
})
