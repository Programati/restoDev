import type { SupabaseClient } from "@supabase/supabase-js"

import type { LoginDto } from "@/core/types/auth/auth.types"
import type { Database } from "@/core/types/database.types"
import { ServiceError } from "@/lib/errors"

export async function login(supabase: SupabaseClient<Database>, dto: LoginDto): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: dto.email,
    password: dto.password,
  })

  if (error) {
    if (error.code === "invalid_credentials") {
      throw new ServiceError("UNAUTHORIZED", "Email o contraseña incorrectos")
    }

    console.error("login: falló auth.signInWithPassword", error)
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }
}
