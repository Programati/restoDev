"use server"

import { z } from "zod"

import { loginSchema } from "@/core/schemas/auth"
import { login } from "@/core/services/auth"
import type { ActionResult } from "@/core/types/action-result"
import { ServiceError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"

export async function loginAction(input: unknown): Promise<ActionResult<null>> {
  try {
    const parsed = loginSchema.safeParse(input)
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

    const supabase = await createClient()
    await login(supabase, parsed.data)

    return { ok: true, data: null, message: "Sesión iniciada" }
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
