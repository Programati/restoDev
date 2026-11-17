import type { SupabaseClient } from "@supabase/supabase-js"
import { ServiceError } from "@/lib/errors"
import type { Database } from "@/core/types/database.types"

export async function logout(supabase: SupabaseClient<Database>): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }
}
