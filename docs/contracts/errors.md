# ActionResult y códigos de error

## Tipo

```ts
type ActionResult<T> =
  | { ok: true; data: T; message: string }
  | {
      ok: false
      error: { code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> }
    }
```

Ubicación: `src/core/types/action-result.ts`

## Códigos

| code               | Cuándo                                       | message por defecto                | HTTP (solo Route Handlers) |
| ------------------ | -------------------------------------------- | ---------------------------------- | -------------------------- |
| `VALIDATION_ERROR` | Falla el schema Zod                          | Datos inválidos                    | 400                        |
| `UNAUTHORIZED`     | No hay sesión activa                         | Sesión requerida                   | 401                        |
| `FORBIDDEN`        | Rol sin permiso o bloqueo de RLS             | Según la acción                    | 403                        |
| `NOT_FOUND`        | El recurso no existe o no es visible por RLS | Usuario no encontrado              | 404                        |
| `CONFLICT`         | Valor duplicado                              | El email ya está registrado        | 409                        |
| `INTERNAL_ERROR`   | Error inesperado                             | Error inesperado. Intentá de nuevo | 500                        |

- `fieldErrors` solo viene con `VALIDATION_ERROR`
- La columna HTTP la usa únicamente `app/api/`; las Actions no devuelven códigos HTTP
- Toda Action puede devolver `INTERNAL_ERROR`
