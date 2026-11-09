# Contratos de Actions

Un contrato por Action, escrito antes del código.

### Paso a paso

1. Copiar `docs/contracts/_template.md` a `docs/contracts/<modulo>/<actionName>.md`
2. Completar tabla de archivos y permiso
3. Definir Input (campos, tipo, reglas, requerido) con ejemplo JSON
4. Definir Éxito: `data`, `message` y ejemplo JSON
5. Definir Errores: `code`, cuándo, `message`, HTTP y ejemplo JSON
6. Listar Efectos secundarios (`revalidatePath`, Storage)
7. Dibujar Flujo (Mermaid)
8. Agregar la Action a la tabla resumen de `docs/contracts/<modulo>/<modulo>.md`
9. Escribir el código: `<actionName>.schema.ts`, `<actionName>.service.ts`, `<actionName>.action.ts` (y Route Handler si aplica)

### Reglas

- [ ] Input de la ficha refleja el schema Zod; si difieren, manda el schema
- [ ] Salida siempre `ActionResult<T>`: `{ ok: true, data, message }` | `{ ok: false, error: { code, message, fieldErrors? } }`
- [ ] `ErrorCode`: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`
- [ ] `ErrorCode` definido en `core/types/action-result.ts` y documentado en `docs/contracts/errors.md`
- [ ] Errores de la ficha usan solo esos `code`
- [ ] Códigos HTTP solo en Route Handlers: 400, 401, 403, 404, 409, 500 según `ErrorCode`
- [ ] Un `docs/contracts/<modulo>/<modulo>.md` por módulo con entidad y tabla resumen de Actions

### Estructura

- [ ] `docs/contracts/`: `errors.md`, `_template.md`, `<modulo>/<modulo>.md`, `<modulo>/<actionName>.md`
