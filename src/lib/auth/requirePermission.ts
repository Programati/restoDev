import type { SupabaseClient } from "@supabase/supabase-js"

import type { ActionResult } from "@/core/types/action-result"
import type { Database } from "@/core/types/database.types"

export type PermissionCode =
  | "categories.read"
  | "categories.manage"
  | "users.manage"
  | "roles.manage"
  | "audit.read"
  | "admin.access"

type ActionFailure = Extract<ActionResult<never>, { ok: false }>

// Devuelve `null` si el usuario tiene AL MENOS UNO de los permisos; si no, un resultado de error
// listo para devolver desde la Action. La seguridad real sigue en RLS: esto da el FORBIDDEN correcto
// (T1) porque RLS solo devuelve 0 filas.
export async function requirePermission(
  supabase: SupabaseClient<Database>,
  permissions: readonly PermissionCode[],
  message: string,
): Promise<ActionFailure | null> {
  for (const code of permissions) {
    const { data, error } = await supabase.rpc("has_permission", { p_code: code })

    if (error) {
      console.error("requirePermission: falló la consulta de permiso", error)
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Error inesperado. Intentá de nuevo" },
      }
    }

    if (data === true) return null
  }

  return { ok: false, error: { code: "FORBIDDEN", message } }
}
