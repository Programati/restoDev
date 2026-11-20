import { z } from "zod"

export const deleteCategorySchema = z.object({
  id: z.uuid({ error: "El id debe ser un UUID válido" }),
})
