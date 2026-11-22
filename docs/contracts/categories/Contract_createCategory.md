# createCategory — Crear categoría

| Campo           | Valor                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| Action          | `src/actions/categories/createCategory.action.ts`                             |
| Schema          | `src/core/schemas/categories/createCategory.schema.ts`                        |
| Servicio        | `src/core/services/categories/createCategory.service.ts`                      |
| Permiso         | Sesión activa y permiso `categories.manage`                                   |
| Equivalente API | Planificado: `POST /api/categories → 201` (Route Handler aún no implementado) |

La función exportada actualmente es `createCategoryAction`. El actor y los criterios funcionales
están en la [Historia de Usuario](../../historias_de_usuario/categories/HU_crear_categoria.md).
Los códigos HTTP de esta ficha describen el Route Handler planificado; la Server Action no devuelve
códigos HTTP.

## Uso desde el front

| Import                 | Ruta                                              | Para qué                                                                                     |
| ---------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `createCategoryAction` | `src/actions/categories/createCategory.action.ts` | Se llama desde el formulario o el hook de mutación con el input de la sección Input          |
| `ActionResult<T>`      | `src/core/types/action-result.ts`                 | Tipa la respuesta; se discrimina por `ok` para leer `data` o `error` (`code`, `fieldErrors`) |
| `Category`             | `src/core/types/categories/category.types.ts`     | Tipo de `data` en el caso de éxito (`ActionResult<Category>`)                                |

**Por qué solo esto:** el front consume la Action y los tipos de su resultado. El schema Zod y el
Servicio pertenecen al back: importarlos en el cliente duplicaría reglas y arrastraría código de
servidor. Si el formulario valida antes de enviar, es solo una ayuda de experiencia; la validación
real la hacen la Action y la base.

```tsx
const result = await createCategoryAction(input)

if (!result.ok) {
  // result.error.code, result.error.message, result.error.fieldErrors?
  return
}

// result.data: Category
```

## Input

| Campo           | Tipo             | Reglas                                                                                                                                                   | Requerido |
| --------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `name`          | `string`         | Se recorta (`trim`); 2–80 caracteres; único en Servicio/BD entre todas las categorías, incluidas las dadas de baja, sin distinguir mayúsculas/minúsculas | Sí        |
| `icon_name`     | `string \| null` | 1–50 caracteres si se envía                                                                                                                              | No        |
| `display_order` | `number`         | Entero, `>= 0`. Default `0`                                                                                                                              | No        |
| `active`        | `boolean`        | Default `true`                                                                                                                                           | No        |

Campos que **no** se reciben: `slug` (se genera a partir de `name`), `deleted_at` (siempre `null` al crear), `updated_by` (se toma de la sesión) y `id`, `created_at`, `updated_at` (los asigna la base).

```json
{
  "name": "Bebidas sin alcohol",
  "icon_name": "cup-soda",
  "display_order": 2,
  "active": true
}
```

## Éxito

`ActionResult<Category>`

```json
{
  "ok": true,
  "data": {
    "id": "3f6a9c1e-2b47-4d8a-9e15-7a0c4b2d6f88",
    "name": "Bebidas sin alcohol",
    "slug": "bebidas-sin-alcohol",
    "icon_name": "cup-soda",
    "display_order": 2,
    "active": true,
    "deleted_at": null,
    "created_at": "2026-11-13T05:20:00Z",
    "updated_at": "2026-11-13T05:20:00Z",
    "updated_by": "7b1e4c52-9d3a-4f0e-8a21-5c6d7e8f9a01"
  },
  "message": "Categoría creada"
}
```

## Errores

| code               | Cuándo                                                                                                                      | message                                | HTTP (API) |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------- |
| `VALIDATION_ERROR` | Falla el schema (nombre vacío, `display_order` negativo, etc.)                                                              | Datos inválidos                        | 400        |
| `UNAUTHORIZED`     | Sin sesión                                                                                                                  | Sesión requerida                       | 401        |
| `FORBIDDEN`        | El usuario no tiene `categories.manage` (lo comprueba la Action) o la BD rechaza la escritura por RLS o permisos (`42501`). | No tenés permiso para crear categorías | 403        |
| `CONFLICT`         | El `name` ya existe (incluso en una categoría dada de baja)                                                                 | Ya existe una categoría con ese nombre | 409        |
| `INTERNAL_ERROR`   | Falla inesperada                                                                                                            | Error inesperado. Intentá de nuevo     | 500        |

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos",
    "fieldErrors": {
      "name": ["El nombre es obligatorio"]
    }
  }
}
```

## Reglas de negocio aplicadas

- El `slug` se genera automáticamente desde `name` (minúsculas, sin acentos, palabras separadas por guiones); si no quedan caracteres alfanuméricos, se usa `categoria`. Debe cumplir `^[a-z0-9]+(-[a-z0-9]+)*$`.
- Si el `slug` generado ya existe (en cualquier registro, incluso dado de baja), el Servicio resuelve la colisión agregando un sufijo numérico (`-2`, `-3`, ...). Nunca devuelve error por colisión de `slug`.
- La unicidad de `name` y `slug` la garantiza también la base (constraints `UNIQUE`). Si la inserción falla por violación de unicidad (condición de carrera), el Servicio la traduce a `CONFLICT`.
- `updated_by` se completa con el `id` del usuario de la sesión.
- La categoría se crea siempre con `deleted_at = null`.
- **Permiso:** la Action comprueba la sesión y, antes de validar con Zod, `categories.manage` con `requirePermission` (`FORBIDDEN` si falta). RLS lo refuerza con la política `categories_insert_by_permission`: sin ese permiso la base rechaza el insert (`42501`).
- La Action valida los datos con Zod y la base replica las mismas reglas con constraints `CHECK` (migración `20261118224842_categories_length_checks.sql`): `name` de 2–80 caracteres tras `btrim`, `icon_name` de 1–50 caracteres si no es `null` y `slug` de hasta 100 caracteres. Así los datos también quedan protegidos ante escrituras que no pasan por la Action.
- El Servicio reintenta hasta tres veces si una colisión concurrente ocupa el `slug`; si no logra insertarlo tras esos intentos, devuelve `INTERNAL_ERROR`.

## Validación por capa

- **Action (antes de Zod):** sesión (`UNAUTHORIZED`) y permiso `categories.manage` (`FORBIDDEN`) con `requirePermission`.
- **Zod en la Action:** tipo y longitud del nombre, recorte, tipo/longitud del ícono, entero no negativo
  para `display_order` y booleano para `active`, además de los defaults indicados en el input.
- **Servicio y base de datos:** generación y resolución de colisiones del `slug`; unicidad de `name`
  y `slug`.
- **Base de datos:** también comprueba el formato del `slug` (y su largo máximo de 100), que
  `display_order` no sea negativo y los límites de longitud de `name` (2–80, tras recortar) e
  `icon_name` (1–50).

## Efectos secundarios

- Tras crear la categoría, se llama a `revalidatePath("/categories")`; la vista/listado de categorías todavía no está implementada.
- Pendiente: registrar el cambio en `audit_logs` cuando exista el mecanismo de auditoría.

## Flujo

```mermaid
sequenceDiagram
  participant Front
  participant Action
  participant Zod
  participant Service
  participant Supabase
  Front->>Action: createCategoryAction(input)
  Action->>Supabase: auth.getUser()
  Supabase-->>Action: sesión | null
  Action-->>Front: UNAUTHORIZED (si no hay sesión)
  Action->>Supabase: rpc has_permission (categories.manage)
  Supabase-->>Action: true | false
  Action-->>Front: FORBIDDEN (si falta el permiso)
  Action->>Zod: validar input
  Zod-->>Front: VALIDATION_ERROR + fieldErrors (si falla)
  Action->>Service: createCategory(supabase, dto, userId)
  Service->>Service: generar slug desde name
  Service->>Supabase: insert en categories (RLS)
  Supabase-->>Service: fila | error (unicidad, permisos)
  Service-->>Action: data | ServiceError (CONFLICT, FORBIDDEN)
  Action-->>Front: ActionResult
```

## Estado de implementación

- **Implementado:** Server Action, verificación de permiso, validación Zod, Servicio, persistencia en Supabase y gestión de
  errores.
- **Pendiente:** Route Handler `POST /api/categories` y registro de auditoría.
