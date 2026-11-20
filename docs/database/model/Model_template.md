# [nombre_tabla]

## Estructura

| Campo     | Tipo     | Nulo      | Default       |
| --------- | -------- | --------- | ------------- |
| `id` (PK) | `[tipo]` | No        | `[valor o —]` |
| `[campo]` | `[tipo]` | `[Sí/No]` | `[valor o —]` |

> Incluir únicamente los campos que necesita esta tabla. No asumir que todas requieren `id`, `deleted_at`, `updated_by` o marcas de tiempo: justificar su presencia según su función.

## Constraints e índices

- **Clave primaria:** `[campo o clave compuesta]`.
- **Unicidad:** `[campos, alcance y tratamiento de registros dados de baja, si aplica]`.
- **Checks:** `[restricciones de formato, rango y consistencia]`.
- **Claves foráneas:** `[campo]` → `[esquema.tabla(campo)]`; comportamiento de actualización/borrado: `[regla]`.
- **Índices adicionales:** `[columnas y finalidad; solo si hacen falta]`.

## Relaciones

- `[tabla_relacionada]`: `[cardinalidad y propósito de la relación]`.
- `[tabla_relacionada]`: `[efecto de activar, desactivar o dar de baja registros vinculados]`.

## Reglas de negocio

- `[Regla funcional 1, específica y verificable]`.
- `[Regla funcional 2]`.
- **Bajas:** `[si aplica, describir la baja lógica mediante deleted_at y las condiciones para permitirla; no implementar borrado físico en el flujo de negocio]`.
- **Dependencias:** `[qué registros asociados bloquean o condicionan la baja o modificación]`.
- **Trazabilidad:** `[cómo se mantienen updated_at, updated_by o el historial, si corresponde]`.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** `[qué usuarios o roles pueden consultar qué registros]`.
- **Inserción:** `[qué usuarios o roles pueden crear registros]`.
- **Actualización y baja lógica:** `[qué usuarios o roles pueden realizarlas y con qué condiciones]`.
- **Acceso provisional:** denegar las operaciones sin políticas definidas; `TO authenticated` por sí solo no autoriza acciones administrativas.
- **Validación en base de datos:** `[restricciones críticas que deben aplicarse en BD y no solo en la interfaz]`.

## Validaciones

- `[Prueba de creación válida]`.
- `[Prueba de valores inválidos, nulos o duplicados]`.
- `[Prueba de relaciones e integridad referencial]`.
- `[Prueba de baja lógica y condiciones de bloqueo, si aplica]`.
- `[Pruebas de RLS: acceso permitido y denegado]`.
- `[Prueba de actualización de metadatos y auditoría, si aplica]`.

---

**Criterios para completar este modelo**

1. Sustituir los textos entre corchetes y eliminar los apartados que no correspondan; no dejar reglas de ejemplo como si fueran definitivas.
2. Documentar cada restricción una sola vez en su sección; en «Validaciones» describir cómo comprobarla, sin redefinirla.
3. Especificar claramente si la unicidad considera registros dados de baja; no asumir índices parciales.
4. Mantener las bajas de negocio como lógicas donde exista eliminación, especificando sus bloqueos. Nunca describir borrados físicos como parte del flujo de negocio.
5. Referenciar las tablas de Supabase con su esquema correcto, por ejemplo `auth.users(id)`.
6. Habilitar RLS desde el inicio y evitar políticas permisivas provisionales.
7. Basar cada tabla en las nuevas definiciones aprobadas para RestoDev; no trasladar automáticamente las reglas de documentos anteriores.
