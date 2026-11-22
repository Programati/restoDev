# categories

## Estructura

| Campo           | Tipo          | Longitud             | Nulo | Default             |
| --------------- | ------------- | -------------------- | ---- | ------------------- |
| `id` (PK)       | `uuid`        | —                    | No   | `gen_random_uuid()` |
| `name`          | `citext`      | 2–80                 | No   | —                   |
| `slug`          | `text`        | formato `kebab-case` | No   | —                   |
| `icon_name`     | `text`        | 1–50                 | Sí   | —                   |
| `display_order` | `integer`     | —                    | No   | `0`                 |
| `active`        | `boolean`     | —                    | No   | `true`              |
| `deleted_at`    | `timestamptz` | —                    | Sí   | —                   |
| `created_at`    | `timestamptz` | —                    | No   | `now()`             |
| `updated_at`    | `timestamptz` | —                    | No   | `now()`             |
| `updated_by`    | `uuid`        | —                    | Sí   | —                   |

> La longitud de `name` e `icon_name` la aplican `CHECK` (migración `categories_length_checks`); no se usa `varchar(n)`. `slug` no tiene tope propio: lo acota su formato.

## Constraints e índices

- `id`: clave primaria.
- `name`: único entre **todos** los registros, incluidos los dados de baja; `citext` evita diferencias solo por mayúsculas/minúsculas. Longitud de 2 a 80 caracteres.
- `slug`: único entre **todos** los registros, incluidos los dados de baja; debe cumplir `CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')`.
- `icon_name`: longitud de 1 a 50 caracteres cuando no es nulo.
- `display_order`: `CHECK (display_order >= 0)`.
- `updated_by`: clave foránea a `auth.users(id)` con `ON DELETE SET NULL` (migración `categories_updated_by_on_delete_set_null`): borrar a un usuario no queda bloqueado por las categorías que modificó.

## Relaciones

- `products`: una categoría puede tener varios productos. La baja lógica de una categoría no borra ni modifica sus productos.
- `auth.users`: `updated_by` identifica al usuario que realizó la última modificación; queda en `null` si se borra ese usuario.
- `audit_logs`: cada alta, modificación y baja lógica queda registrada por el trigger `audit_categories` (Fase 4). La baja lógica es un `UPDATE` de `deleted_at`, así que se registra como `update`.

## Reglas de negocio

- `slug` se genera automáticamente a partir del nombre y debe resolver colisiones sin infringir su unicidad.
- No se permiten nombres vacíos.
- `name` y `slug` no pueden reutilizarse, aunque una categoría haya sido dada de baja.
- La única eliminación permitida es la **baja lógica**: se establece `deleted_at`; nunca se ejecuta un borrado físico desde el flujo de negocio.
- **No se permite dar de baja una categoría si tiene al menos un producto activo asociado.** Solo puede darse de baja cuando no tiene productos o cuando todos los productos asociados están inactivos.
- Una categoría inactiva o dada de baja no puede ofrecer productos para la venta.
- `updated_at` se actualiza al modificar la categoría y `updated_by` registra al usuario responsable, cuando corresponda.
- **Auditoría:** todo cambio genera un evento en `audit_logs` con `old_data`, `new_data` y el actor (`auth.uid()`); no se excluyen columnas.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura** (`categories_select_by_permission`): `categories.manage` ve todas las categorías, incluidas las dadas de baja; `categories.read` ve solo las vigentes (`deleted_at is null`).
- **Inserción** (`categories_insert_by_permission`): `categories.manage`.
- **Actualización y baja lógica** (`categories_update_by_permission`): `categories.manage`, en `using` y `with check`. La baja lógica es un `UPDATE` de `deleted_at`.
- **Borrado físico:** sin política y sin `GRANT` de `DELETE`: la única eliminación permitida es la baja lógica.
- **GRANT:** `select`, `insert` y `update` a `authenticated`; nada para `anon`.
- Las políticas verifican permisos (`(select private.has_permission('...'))`), no nombres de rol, así que crear roles nuevos no las toca. Solo ejerce un permiso un perfil `active` con un rol activo.
- Quien puede escribir también puede leer todo (`categories.manage`): `resolveCategorySlug` necesita ver los slugs de las categorías dadas de baja.
- Cuando RLS bloquea un `SELECT` o un `UPDATE`, la base devuelve 0 filas y no un error. Por eso cada Action comprueba el permiso antes (`requirePermission`) para responder `FORBIDDEN`; RLS es la red de seguridad.
- La baja lógica debe pasar por un mecanismo que valide en la base de datos la ausencia de productos activos asociados, sin depender únicamente de la interfaz.
- **Auditoría:** el trigger `audit_categories` (`AFTER INSERT OR UPDATE OR DELETE`, `private.audit_log_change('id')`) es `SECURITY DEFINER`: no requiere `GRANT` adicional a `authenticated` y no interfiere con `set_updated_at` ni con el `.select()` posterior al `insert` o `update`.

> **Estado actual:** la política provisoria `categories_provisional_authenticated_all` se eliminó (migración `drop_categories_provisional_policy`) y la auditoría está activa (migración `audit_trigger_categories`). Pendiente: la baja lógica todavía no valida en la base la ausencia de productos activos; se resuelve al crear `products`.

## Validaciones

- Rechazar un nombre vacío y los nombres duplicados, sin distinguir mayúsculas/minúsculas.
- Rechazar un `slug` inválido o duplicado, incluso si pertenece a un registro dado de baja.
- Rechazar valores negativos en `display_order`.
- Comprobar que la generación automática del `slug` evita colisiones.
- Permitir la baja lógica si no existen productos asociados o si todos están inactivos; rechazarla si existe al menos uno activo.
- Comprobar que la baja lógica conserva los productos y las referencias históricas.
- Verificar que RLS esté habilitado desde el inicio y bloquee accesos no autorizados.
- Verificar la actualización de `updated_at` y la referencia `updated_by`.
- Verificar el registro de auditoría: insertar, modificar y dar de baja una categoría genera un evento cada vez, con el actor correcto. **Verificado el 2026-11-21** en el proyecto de pruebas (3 eventos; el trigger no rompe el `.select()` posterior).
- Verificar la matriz de acceso por permiso (`Plan_identidad_y_permisos.md`, sección 7): sin rol, solo `categories.read`, `categories.manage`, perfil inactivo y rol inactivo; una escritura directa a la Data API sin permiso no tiene efecto.
- Borrar un usuario que modificó categorías deja `updated_by` en `null` y no lo bloquea.
