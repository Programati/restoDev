import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/core/types/database.types"
import { ServiceError } from "@/lib/errors"

// Go duration: ~100 años. Es el bloqueo "indefinido" que admite Auth (`banned_until` en el futuro).
const BAN_DURATION = "876000h"

// Bloquea (`banned = true`) o desbloquea (`banned = false`) la cuenta en Auth, para que un perfil
// `inactive` no pueda iniciar sesión ni renovar tokens (D5).
//
// `adminClient` debe venir de `createAdminClient()`. Lo llama otro Servicio (el cambio de
// `profiles.status`), que ya validó `userId`; no es una Action. Debe ejecutarse DESPUÉS de que la
// base aceptó el cambio de `status`: si la guardia del último administrador lo rechaza, no queda un
// usuario bloqueado con perfil `active`.
export async function setUserBanned(
  adminClient: SupabaseClient<Database>,
  userId: string,
  banned: boolean,
): Promise<void> {
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: banned ? BAN_DURATION : "none",
  })

  if (error) {
    if (error.code === "user_not_found") {
      throw new ServiceError("NOT_FOUND", "Usuario no encontrado")
    }

    console.error("setUserBanned: falló auth.admin.updateUserById", error)
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }
}
