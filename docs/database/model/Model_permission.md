# permissions

## Estructura

| Campo         | Tipo   | Longitud                | Nulo | Default |
| ------------- | ------ | ----------------------- | ---- | ------- |
| `code` (PK)   | `text` | formato `modulo.accion` | No   | —       |
| `module`      | `text` | —                       | No   | —       |
| `name`        | `text` | 2–80                    | No   | —       |
| `description` | `text` | ≤ 250                   | Sí   | —       |

> Catálogo fijo, sembrado por migraciones. La clave natural `code` evita un `id` sin uso y hace legibles las políticas y `role_permissions`. Sin marcas de tiempo ni baja: un permiso que ya no se usa se retira con una migración.
> `code` y `module` no tienen tope de longitud: los acota su formato (ver Constraints). La longitud la aplica un `CHECK`; no se usa `varchar(n)`.

## Constraints e índices

- **Clave primaria:** `code`.
- **Unicidad:** la de la clave primaria.
- **Checks:** `code ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'`; `code LIKE module || '.%'` (el módulo no puede contradecir al código); `length(btrim(name)) BETWEEN 2 AND 80`; `length(description) <= 250`.
- **Claves foráneas:** ninguna.
- **Índices adicionales:** `(module, name)` para agrupar en la pantalla de roles.

## Relaciones

- `role_permissions`: 1 a N. `role_permissions.permission_code` referencia `code` con `ON UPDATE CASCADE ON DELETE RESTRICT`: renombrar un código se propaga; quitar un permiso en uso es una decisión consciente.

## Reglas de negocio

- **Catálogo inicial (D2), solo lo que existe hoy:**

| Código              | Módulo       | Qué habilita                                                              |
| ------------------- | ------------ | ------------------------------------------------------------------------- |
| `categories.read`   | `categories` | Leer categorías no dadas de baja                                          |
| `categories.manage` | `categories` | Crear, modificar y dar de baja categorías; leer también las dadas de baja |
| `users.manage`      | `users`      | Ver usuarios, asignar roles y cambiar el `status` de un perfil            |
| `roles.manage`      | `roles`      | Crear y editar roles y sus permisos                                       |
| `audit.read`        | `audit`      | Consultar `audit_logs`                                                    |
| `admin.access`      | `admin`      | Entrar al panel `/admin`                                                  |

- `categories.manage` incluye la lectura completa; lo resuelve la política de `categories`, no un permiso aparte.
- Los permisos de módulos futuros (`products.*`, `orders.*`) se agregan junto con su módulo.
- Las políticas y las Actions verifican permisos por `code`, nunca nombres de rol.
- **Bajas:** no aplica; se retira por migración, y solo si ningún rol lo usa.
- **Trazabilidad:** los cambios del catálogo quedan en `audit_logs` (F4); no hay `updated_at`.

## Seguridad

- **RLS:** habilitada desde la creación de la tabla.
- **Lectura:** `roles.manage`.
- **Inserción, actualización y borrado:** ninguno desde la API; solo migraciones. Editar el catálogo en runtime permitiría inventar permisos que nada verifica.
- Solo `GRANT SELECT` a `authenticated`. Sin permisos para `anon`; sin Realtime.
- **Validación en base de datos:** formato de `code` y coherencia con `module`.

## Validaciones

- El seed corre dos veces sin errores ni duplicados (`on conflict do nothing`).
- Rechazar un `code` sin punto, con mayúsculas, o cuyo `module` no coincida.
- Rechazar borrar un permiso asignado a un rol.
- RLS: sin `roles.manage` no se lee; escribir directo falla con `42501`.

## Impacto en `categories`

Aporta `categories.read` y `categories.manage`, que usan las políticas y las Actions desde F3.
