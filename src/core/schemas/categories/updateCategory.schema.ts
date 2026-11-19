import { z } from "zod"

export const updateCategorySchema = z
  .object({
    id: z.uuid({ error: "El id debe ser un UUID válido" }),
    name: z
      .string({ error: "El nombre debe ser texto" })
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "El nombre no puede superar los 80 caracteres")
      .optional(),
    icon_name: z
      .string({ error: "El ícono debe ser texto" })
      .trim()
      .min(1, "El ícono no puede estar vacío")
      .max(50, "El ícono no puede superar los 50 caracteres")
      .nullable()
      .optional(),
    display_order: z
      .number({ error: "El orden debe ser un número" })
      .int("El orden debe ser un número entero")
      .min(0, "El orden no puede ser negativo")
      .optional(),
    active: z.boolean({ error: "El estado activo debe ser verdadero o falso" }).optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.icon_name !== undefined ||
      value.display_order !== undefined ||
      value.active !== undefined,
    { error: "Enviá al menos un campo para modificar" },
  )
