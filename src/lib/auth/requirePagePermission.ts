import type { SupabaseClient, User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { connection } from "next/server"

import type { Database } from "@/core/types/database.types"
import { requirePermission, type PermissionCode } from "@/lib/auth/requirePermission"
import { createClient } from "@/lib/supabase/server"

type PageAccess =
  { ok: true; supabase: SupabaseClient<Database>; user: User } | { ok: false; message: string }

// Debe llamarse dentro de un <Suspense>: lee cookies y, con `cacheComponents`, hacerlo fuera de
// uno rompe el build. `connection()` evita el aviso de `Date.now()` de auth-js al prerenderizar.

export async function requirePagePermission(
  permissions: readonly PermissionCode[],
  message = "No tenés permiso para ver esta página",
): Promise<PageAccess> {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const denied = await requirePermission(supabase, permissions, message)
  if (denied) {
    if (denied.error.code !== "FORBIDDEN") {
      throw new Error("No se pudo verificar el permiso de acceso a la página")
    }
    return { ok: false, message: denied.error.message }
  }

  return { ok: true, supabase, user }
}
