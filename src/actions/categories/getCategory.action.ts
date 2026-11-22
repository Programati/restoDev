"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getCategorySchema } from "@/core/schemas/categories"
import { getCategory } from "@/core/services/categories"
import { ServiceError } from "@/lib/errors"
import type { ActionResult } from "@/core/types/action-result"
import type { CategoryDetail } from "@/core/types/categories/category.types"
import { requirePermission } from "@/lib/auth/requirePermission"

export async function getCategoryAction(input: unknown): Promise<ActionResult<CategoryDetail>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesión requerida" } }
  }

  // Permiso (antes de validar)
  const denied = await requirePermission(
    supabase,
    ["categories.read", "categories.manage"],
    "No tenés permiso para ver categorías",
  )
  if (denied) return denied

  const parsed = getCategorySchema.safeParse(input ?? {})
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Datos inválidos",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
    }
  }

  if (parsed.data.include_deleted) {
    const deniedDeleted = await requirePermission(
      supabase,
      ["categories.manage"],
      "No tenés permiso para ver categorías",
    )
    if (deniedDeleted) return deniedDeleted
  }

  try {
    const data = await getCategory(supabase, parsed.data)
    return { ok: true, data, message: "Categoría obtenida" }
  } catch (error) {
    if (error instanceof ServiceError) {
      return { ok: false, error: { code: error.code, message: error.message } }
    }
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Error inesperado. Intentá de nuevo" },
    }
  }
}
