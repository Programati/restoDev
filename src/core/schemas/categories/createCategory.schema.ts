import { z } from "zod"

export const createCategorySchema = z.object({
  name: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(1, { error: "El nombre es obligatorio", abort: true })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres"),
  icon_name: z
    .string()
    .trim()
    .min(1, "El nombre del ícono no puede se un espacio vacío")
    .max(50, "El nombre del ícono no puede superar los 50 caracteres")
    .nullable()
    .optional(),
  display_order: z
    .number({ error: "El orden debe ser un número" })
    .int("El orden debe ser un entero")
    .min(0, "El orden no puede ser negativo")
    .default(0),
  active: z.boolean({ error: "El estado activo debe ser verdadero o falso" }).default(true),
})
