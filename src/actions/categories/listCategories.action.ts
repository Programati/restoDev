"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { listCategoriesSchema } from "@/core/schemas/categories"
import { listCategories } from "@/core/services/categories"
import { ServiceError } from "@/lib/errors"
import type { ActionResult } from "@/core/types/action-result"
import type { CategoryListItem } from "@/core/types/categories/category.types"

export async function listCategoriesAction(
  input?: unknown,
): Promise<ActionResult<CategoryListItem[]>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Sesión requerida" } }
  }

  // TODO(roles): definir qué roles pueden listar y exigir rol admin cuando
  // `include_deleted` sea true, cuando exista el modelo de roles

  const parsed = listCategoriesSchema.safeParse(input ?? {})
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

  try {
    const data = await listCategories(supabase, parsed.data)
    return { ok: true, data, message: "Categorías obtenidas" }
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
