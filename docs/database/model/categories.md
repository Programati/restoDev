# categories

## Estructura

| Campo           | Tipo          | Nulo | Default             |
| --------------- | ------------- | ---- | ------------------- |
| `id` (PK)       | `uuid`        | No   | `gen_random_uuid()` |
| `name`          | `citext`      | No   | —                   |
| `slug`          | `text`        | No   | —                   |
| `icon_name`     | `text`        | Sí   | —                   |
| `display_order` | `integer`     | No   | `0`                 |
| `active`        | `boolean`     | No   | `true`              |
| `deleted_at`    | `timestamptz` | Sí   | —                   |
| `created_at`    | `timestamptz` | No   | `now()`             |
| `updated_at`    | `timestamptz` | No   | `now()`             |
| `updated_by`    | `uuid`        | Sí   | —                   |

## Constraints e índices

- `id`: clave primaria.
- `name`: único entre **todos** los registros, incluidos los dados de baja; `citext` evita diferencias solo por mayúsculas/minúsculas.
- `slug`: único entre **todos** los registros, incluidos los dados de baja; debe cumplir `CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')`.
- `display_order`: `CHECK (display_order >= 0)`.
- `updated_by`: clave foránea a `auth.users(id)`.

## Relaciones

- `products`: una categoría puede tener varios productos. La baja lógica de una categoría no borra ni modifica sus productos.
- `auth.users`: `updated_by` identifica al usuario que realizó la última modificación.
- `audit_logs`: los cambios en la categoría deben registrarse en la auditoría cuando se implemente su mecanismo.

## Reglas de negocio

- `slug` se genera automáticamente a partir del nombre y debe resolver colisiones sin infringir su unicidad.
- No se permiten nombres vacíos.
- `name` y `slug` no pueden reutilizarse, aunque una categoría haya sido dada de baja.
- La única eliminación permitida es la **baja lógica**: se establece `deleted_at`; nunca se ejecuta un borrado físico desde el flujo de negocio.
- **No se permite dar de baja una categoría si tiene al menos un producto activo asociado.** Solo puede darse de baja cuando no tiene productos o cuando todos los productos asociados están inactivos.
- Una categoría inactiva o dada de baja no puede ofrecer productos para la venta.
- `updated_at` se actualiza al modificar la categoría y `updated_by` registra al usuario responsable, cuando corresponda.

## Seguridad

- Habilitar **Row Level Security (RLS)** desde la creación de la tabla.
- No conceder permisos de escritura indiscriminados mediante una política `TO authenticated`.
- Definir políticas explícitas de lectura y gestión según los roles y permisos cuando se implemente ese modelo. Hasta entonces, mantener denegadas las operaciones no autorizadas.
- La baja lógica debe pasar por un mecanismo que valide en la base de datos la ausencia de productos activos asociados, sin depender únicamente de la interfaz.

## Validaciones

- Rechazar un nombre vacío y los nombres duplicados, sin distinguir mayúsculas/minúsculas.
- Rechazar un `slug` inválido o duplicado, incluso si pertenece a un registro dado de baja.
- Rechazar valores negativos en `display_order`.
- Comprobar que la generación automática del `slug` evita colisiones.
- Permitir la baja lógica si no existen productos asociados o si todos están inactivos; rechazarla si existe al menos uno activo.
- Comprobar que la baja lógica conserva los productos y las referencias históricas.
- Verificar que RLS esté habilitado desde el inicio y bloquee accesos no autorizados.
- Verificar la actualización de `updated_at`, la referencia `updated_by` y el registro de auditoría.
