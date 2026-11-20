# Catálogo de errores

Todas las Actions devuelven `ActionResult<T>`. Cuando `ok` es `false`, `error.code` es uno de los códigos de esta tabla y no se usan otros. Los tipos están definidos en `src/core/types/action-result.ts`; si cambian acá, cambian ahí.

## Códigos

| code               | Cuándo se usa                                                                                   | HTTP (solo Route Handlers) |
| ------------------ | ----------------------------------------------------------------------------------------------- | -------------------------- |
| `VALIDATION_ERROR` | El input no cumple el schema Zod. Es el único código que lleva `fieldErrors`.                   | 400                        |
| `UNAUTHORIZED`     | No hay sesión activa.                                                                           | 401                        |
| `FORBIDDEN`        | Hay sesión, pero el usuario no tiene permiso (rol insuficiente o RLS rechaza la operación).     | 403                        |
| `NOT_FOUND`        | El registro pedido no existe o está dado de baja.                                               | 404                        |
| `CONFLICT`         | La operación choca con el estado actual (valor único ya usado, regla de negocio que lo impide). | 409                        |
| `INTERNAL_ERROR`   | Falla inesperada. No se expone el detalle técnico al cliente.                                   | 500                        |

## Reglas

- Las Actions nunca devuelven códigos HTTP. Solo los Route Handlers traducen `code` a HTTP, según la columna de arriba.
- `fieldErrors` existe únicamente con `VALIDATION_ERROR` y tiene la forma `{ campo: ["mensaje", ...] }`.
- El `message` está en español y es apto para mostrar al usuario.
- `INTERNAL_ERROR` siempre usa el mensaje genérico "Error inesperado. Intentá de nuevo". El detalle real se registra en el servidor, no se devuelve.
- Una ficha de contrato solo puede listar códigos de este catálogo. Si hace falta uno nuevo, primero se agrega acá y en `action-result.ts`.

## Formato de la respuesta

```json
{
  "ok": false,
  "error": {
    "code": "CONFLICT",
    "message": "Ya existe una categoría con ese nombre"
  }
}
```
