"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { updateCategorySchema } from "@/core/schemas/categories"
import { updateCategory } from "@/core/services/categories"
import type { ActionResult } from "@/core/types/action-result"
import type { CategoryDetail } from "@/core/types/categories/category.types"
import { ServiceError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"
import { requirePermission } from "@/lib/auth/requirePermission"

// `input` es `unknown`: una Server Action es un endpoint público y puede recibir cualquier cosa.
// El tipo real lo establece Zod, no TypeScript.
export async function updateCategoryAction(input: unknown): Promise<ActionResult<CategoryDetail>> {
  try {
    // 1. Sesión (el proxy es solo comodidad de navegación: la seguridad real va acá)
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesión requerida" } }
    }

    // 2. Permiso (antes de validar)
    const denied = await requirePermission(
      supabase,
      ["categories.manage"],
      "No tenés permiso para modificar categorías",
    )
    if (denied) return denied

    // 3. Validación
    const parsed = updateCategorySchema.safeParse(input ?? {})
    if (!parsed.success) {
      const { fieldErrors, formErrors } = z.flattenError(parsed.error)
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          // La regla "al menos un campo" no pertenece a ningún campo: viaja en el message
          message: formErrors[0] ?? "Datos inválidos",
          fieldErrors,
        },
      }
    }

    // 4. Servicio
    const category = await updateCategory(supabase, parsed.data, user.id)

    // 5. Efectos secundarios
    revalidatePath("/categories")

    return { ok: true, data: category, message: "Categoría actualizada" }
  } catch (error) {
    if (error instanceof ServiceError) {
      return { ok: false, error: { code: error.code, message: error.message } }
    }

    console.error("updateCategoryAction: error inesperado", error)
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Error inesperado. Intentá de nuevo" },
    }
  }
}
