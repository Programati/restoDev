import type { z } from "zod"

import type { loginSchema } from "@/core/schemas/auth"

export type LoginDto = z.infer<typeof loginSchema>
