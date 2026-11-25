import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
})

if (!parsed.success) {
  const fieldErrors = z.flattenError(parsed.error).fieldErrors
  throw new Error(`Variables de entorno inválidas: ${JSON.stringify(fieldErrors)}`)
}

export const env = parsed.data

// Clave con privilegios totales sobre Auth. Solo servidor: nunca `NEXT_PUBLIC_`.
// Se valida al pedirla y no al cargar el módulo: `env.ts` también lo importa el cliente del
// navegador, donde esta variable no existe y fallar acá rompería toda la app.
export function getServiceRoleKey(): string {
  const result = z.string().min(1).safeParse(process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!result.success) {
    throw new Error("Variable de entorno inválida: SUPABASE_SERVICE_ROLE_KEY (solo servidor)")
  }
  return result.data
}
