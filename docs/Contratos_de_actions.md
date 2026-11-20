# Contratos de Actions

Un contrato por Action, escrito antes del código.

### Paso a paso

1. Copiar `docs/contracts/Contract_template.md` a `docs/contracts/<modulo>/Contract_<actionName>.md`
2. Completar tabla de archivos y permiso
3. Completar "Uso desde el front": qué importa el front (Action, `ActionResult`, tipo de `data`), de qué ruta y para qué, con una frase de por qué
4. Definir Input (campos, tipo, reglas, requerido) con ejemplo JSON
5. Definir Éxito: `data`, `message` y ejemplo JSON
6. Definir Errores: `code`, cuándo, `message`, HTTP y ejemplo JSON
7. Listar Efectos secundarios (`revalidatePath`, Storage)
8. Dibujar Flujo (Mermaid)
9. Agregar la Action a la tabla resumen de `docs/contracts/<modulo>/Contract_<modulo>.md`
10. Escribir el código: `<actionName>.schema.ts`, `<actionName>.service.ts`, `<actionName>.action.ts` (y Route Handler si aplica)

### Reglas

- [ ] Input de la ficha refleja el schema Zod; si difieren, manda el schema
- [ ] Salida siempre `ActionResult<T>`: `{ ok: true, data, message }` | `{ ok: false, error: { code, message, fieldErrors? } }`
- [ ] `ErrorCode`: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`
- [ ] `ErrorCode` definido en `core/types/action-result.ts` y documentado en `docs/contracts/Contract_errors.md`
- [ ] Errores de la ficha usan solo esos `code`
- [ ] Códigos HTTP solo en Route Handlers: 400, 401, 403, 404, 409, 500 según `ErrorCode`
- [ ] Un `docs/contracts/<modulo>/Contract_<modulo>.md` por módulo con entidad y tabla resumen de Actions
- [ ] "Uso desde el front" lista solo lo que el front importa (Action y tipos); schemas y Servicios son del back y no se importan en componentes cliente
- [ ] El tipo de `data` en "Uso desde el front" coincide con el de "Éxito" y con el diagrama de Flujo
- [ ] Si una migración cambia constraints o reglas de datos, la ficha se actualiza en el mismo cambio (sección Reglas de negocio y Validación por capa)

### Estructura

- [ ] `docs/contracts/`: `Contract_errors.md`, `Contract_template.md`, `<modulo>/Contract_<modulo>.md`.
