import type { ErrorCode } from "@/core/types/action-result"

// Error de negocio lanzado por los Servicios. La Action lo traduce a `ActionResult`
// y el Route Handler a un código HTTP, ambos a partir de `code`.
export class ServiceError extends Error {
  code: ErrorCode

  constructor(code: ErrorCode, message: string) {
    super(message)
    this.name = "ServiceError"
    this.code = code
  }
}
