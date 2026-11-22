import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/core/types/database.types"
import { env, getServiceRoleKey } from "@/lib/env"

// Cliente con la clave service_role: se salta RLS y puede administrar Auth. Solo servidor, y
// únicamente para la API de administración de Auth (D5). Se crea por petición, nunca como
// constante global, y sin sesión: no guarda ni renueva tokens.
export function createAdminClient() {
  return createSupabaseClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
