"use server"

import { logout } from "@/core/services/auth"
import type { ActionResult } from "@/core/types/action-result"
import { ServiceError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"

export async function logoutAction(): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient()
    await logout(supabase)
    return { ok: true, data: null, message: "Sesión cerrada" }
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
