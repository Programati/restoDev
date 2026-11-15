// Códigos de error permitidos. Deben coincidir con docs/contracts/errors.md
export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR",
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

// Errores por campo, con la forma que produce Zod: { email: ["Email inválido"] }
export type FieldErrors = Record<string, string[]>

export type ActionError = {
  code: ErrorCode
  message: string
  fieldErrors?: FieldErrors // solo con VALIDATION_ERROR
}

export type ActionResult<T> =
  { ok: true; data: T; message: string } | { ok: false; error: ActionError }
