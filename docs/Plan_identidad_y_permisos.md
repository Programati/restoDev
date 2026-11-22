# Plan: identidad, acceso y auditoría

> Copiar a `docs/Plan_identidad_y_permisos.md`. Última actualización: 2026-11-21.
> Referencia de diseño: `docs/database/DER_identidad_acceso_auditoria.html`. Detalle por tabla: `docs/database/model/Model_*.md`.

## 0. Cómo usar este archivo

- Cada tarea tiene un ID (`F3.4`) para poder decir "sigamos con F3.4" en cualquier chat.
- Se marca `[x]` solo cuando la tarea está **hecha y verificada**, no antes.
- Al cerrar una fase: actualizar la tabla de la sección 1, el registro de cambios (sección 9) y agregar una línea en `PROGRESO.md` con el estado y un enlace a este archivo.
- `PROGRESO.md` sigue siendo el resumen general del proyecto; este archivo es el detalle de este frente. No se duplica contenido entre ambos.
- Si aparece una decisión nueva a mitad de una fase, se agrega en la sección 5 y se resuelve ahí; no se improvisa en el código.

## 1. Estado general

| Fase | Contenido                                           | Rama sugerida                    | Depende de | Estado                                                                                         |
| ---- | --------------------------------------------------- | -------------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| P    | Cerrar `deleteCategory` y sincronizar documentación | `feature/daleteCategory`         | —          | Completada (verificación de HU-CAT-005 diferida a F3.8, y esta al Front)                       |
| F0   | Decisiones y modelos documentados (sin código)      | `docs/identity-access-design`    | P          | Completada (PR mergeado)                                                                       |
| F1   | Base de identidad: `profiles`                       | `feature/identity-profiles`      | F0         | Completada (PR mergeado)                                                                       |
| F2   | Roles, permisos y funciones de autorización         | `feature/roles-permissions`      | F1         | Implementada y verificada en la base; falta el PR                                              |
| F3   | Migrar `categories` a permisos                      | `feature/categories-permissions` | F2         | Implementada y verificada (F3.1 a F3.7); F3.8: documentación hecha, pruebas diferidas al Front |
| F4   | Auditoría (`audit_logs` + triggers)                 | `feature/audit-logs`             | F3         | Pendiente                                                                                      |
| F5   | Protecciones, RPC administrativas y cierre          | `feature/access-hardening`       | F4         | Pendiente                                                                                      |

Una fase = una rama = un PR hacia `develop` (squash), con `pnpm run check:full` en verde. Las migraciones viajan en el mismo PR que el código que las usa y los tipos se regeneran en ese PR (`Git_workflow.md`, sección 8).

## 2. Alcance

**Dentro:**

- Las 6 tablas propias: `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `audit_logs` (más `auth.users`, que ya existe en Supabase).
- Funciones de autorización, seed del catálogo y del rol base, RLS y GRANT de cada tabla.
- Migrar `categories` (política, FK, Actions, documentación) para que use permisos reales.
- Auditoría de las tablas de seguridad y de `categories`.
- Protecciones contra escalada de privilegios y contra quedarse sin administrador.

**Fuera (fases futuras, no bloquean este plan):**

- Pantallas de gestión de usuarios y roles; flujo de invitación completo (UI y Actions).
- Módulo `products` y su protección de baja de categorías (usará estos permisos cuando exista).
- Roles operativos (cajero, mesero, delivery) con permisos de módulos que todavía no existen. Se agregan al catálogo junto con cada módulo.
- Menú público para `anon` (hoy `anon` no tiene ningún permiso y se mantiene así).

## 3. Reglas transversales (valen en todas las fases)

1. **No duplicar lo que da Supabase.** Email, contraseña, último ingreso y bloqueo real viven en `auth.users`. Se referencia con `auth.users(id)`; nunca se copian esos campos.
2. **Cada migración que crea una tabla incluye RLS, políticas y GRANT mínimo.** Sin `GRANT`, RLS ni se evalúa y todo falla con `42501`. Sin `DELETE` en tablas con baja lógica, y sin permisos para `anon`. (En F2 las políticas de lectura se separaron en una migración posterior; con RLS activo y sin políticas, nadie lee nada en el intervalo.)
3. **Las migraciones se aplican al proyecto de pruebas** con `pnpm exec supabase db push --remote` (antes, `--dry-run`); después se regeneran los tipos con el comando seguro de `PROGRESO.md` (`--project-id`, vía archivo temporal; nunca redirigir directo a `database.types.ts`). Nunca contra producción desde `develop`.
4. **Una migración nueva por cambio; no se edita una ya aplicada.** `categories` se modifica con migraciones `alter`, no recreándola.
5. **Orden seguro en cambios de acceso:** primero se crea lo nuevo, se prueba con el usuario admin, y recién después se elimina lo viejo. Así nunca quedás sin acceso.
6. **Funciones `SECURITY DEFINER`:** `set search_path` fijo, nombres calificados con esquema, y `REVOKE EXECUTE ... FROM public, anon` (en Postgres el `EXECUTE` por defecto es de `public`). Las que no deben llamarse desde la API van en el esquema `private`, que no debe estar expuesto en la configuración de la API.
7. **Las políticas que llaman funciones de `private` necesitan** `GRANT USAGE` sobre el esquema y `GRANT EXECUTE` sobre la función para `authenticated`; si no, fallan con `42501` aunque el usuario tenga el permiso.
8. **En políticas se escribe** `(select auth.uid())` y `(select private.has_permission('x'))` para que se evalúen una vez por consulta, no por fila.
9. **Las políticas verifican permisos, no nombres de rol.** Así se pueden crear roles nuevos sin tocar las políticas.
10. **La seguridad real va en la base y en cada Action** (`auth.getUser()` + permiso). El `proxy.ts` y la interfaz son solo comodidad de navegación.
11. **Ciclo por tabla/fase** (de `Guia_de_desarrollo_de_funcionalidades.md`): modelo `Model_*.md` → migración → tipos regenerados → contrato/Actions si aplica → verificación → PR.
12. **Cada fase termina con una línea "Impacto en `categories`"**, aunque sea "ninguno".
13. El pre-commit corre `typecheck` sobre todo el proyecto: un archivo temporal con errores bloquea cualquier commit.

## 4. Inventario: lo que ya existe y se ve afectado

| Elemento                                                                                             | Estado hoy                                                           | Qué cambia                                                                                                         | Fase |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---- |
| Política `categories_provisional_authenticated_all` (`for all to authenticated using (true)`)        | Cualquier usuario con sesión lee y escribe                           | Se reemplaza por políticas separadas de lectura, alta y modificación basadas en permisos; sin política de `DELETE` | F3   |
| `GRANT select, insert, update on categories to authenticated`                                        | Correcto (sin `DELETE`)                                              | Se mantiene; se verifica que no haya `GRANT` para `anon`                                                           | F3   |
| `categories.updated_by` → `auth.users(id)` sin `ON DELETE`                                           | Con `NO ACTION`, impide borrar un usuario que haya tocado categorías | Mantener la FK y agregar `ON DELETE SET NULL` (D3)                                                                 | F3   |
| `TODO(roles)` en las 5 Actions de `categories` (create, get, list, update, delete)                   | Solo se comprueba sesión                                             | Se reemplaza por la verificación de permiso y `FORBIDDEN`                                                          | F3   |
| `include_deleted` en `getCategory` y `listCategories`                                                | Cualquier autenticado puede pedirlo                                  | Exige `categories.manage`                                                                                          | F3   |
| `resolveCategorySlug` (lee los slugs de **todas** las filas, incluidas las de baja)                  | Funciona porque la política permite leer todo                        | Quien pueda escribir debe poder leer todas las filas (ver trampa T2)                                               | F3   |
| `Model_category.md`: sección Seguridad y bloque "Estado actual (provisorio)"                         | Contradice el estado real                                            | Reescribir con las políticas definitivas                                                                           | F3   |
| 5 contratos `Contract_*Category.md`, `Contract_categories.md` y 5 HU (`Alcance actual y pendientes`) | "Permiso actual: cualquier usuario con sesión"                       | Permiso real por operación; quitar "provisorio"                                                                    | F3   |
| "Registro en `audit_logs`" pendiente en contratos, HU y modelo                                       | Pendiente                                                            | Se cierra al activar el trigger sobre `categories`                                                                 | F4   |
| `/admin` con "Hola ADMINISTRADOR" fijo; `proxy.ts` solo comprueba sesión                             | Cualquier usuario autenticado entra                                  | Mostrar el nombre del perfil y exigir `admin.access` fuera del proxy (layout o página)                             | F3   |
| `PROGRESO.md`: "Decisiones abiertas" sobre roles, RLS provisoria y GRANT                             | Abiertas                                                             | Se cierran a medida que se completan las fases                                                                     | F3   |
| `Contract_errors.md` y `ErrorCode`                                                                   | `FORBIDDEN` ya cubre "rol insuficiente o RLS rechaza"                | Sin cambios; no hace falta un código nuevo                                                                         | —    |

## 5. Decisiones

D1 a D11 se confirmaron el 2026-11-20 (Fase 0). Los 6 `Model_*.md`, el DER, `Reglas_de_negocio.md`, `Convenciones_de_archivos.md` y `Stack_restoDev.md` las reflejan. Una decisión nueva a mitad de una fase se agrega acá (regla de la sección 0).

- [x] **D1. Roles base.** Sembrar solo `admin` (`is_system = true`). `staff` y `delivery` (mencionados en el DER) y cajero/mesero se agregan junto con los módulos que los necesiten, y ahí se define su regla en `Reglas_de_negocio.md`.
- [x] **D2. Catálogo de permisos** (formato `modulo.accion`), solo lo que existe hoy: `categories.read`, `categories.manage`, `users.manage`, `roles.manage`, `audit.read`, `admin.access`. `admin.access` y `audit.read` quedan explícitos (el DER los usaba sin listarlos). `categories.manage` incluye `categories.read` (lo resuelve la política, no un permiso aparte).
- [x] **D3. Referencia de autoría.** `auth.users(id)` en `categories.updated_by` y en `audit_logs.actor_id` (el DER proponía `profiles(id)`; ya corregido). Es el mismo UUID, evita una dependencia de orden y no obliga a tocar datos de `categories`. En `categories.updated_by` se agrega `ON DELETE SET NULL`.
- [x] **D4. RPC frente a "el Servicio consulta Supabase directo".** Lecturas y escrituras simples siguen el flujo actual (Servicio + cliente Supabase + RLS). `SECURITY DEFINER` + `supabase.rpc()` solo para operaciones sensibles (asignar roles y permisos, cambiar `status`). Escrito en `Convenciones_de_archivos.md` y `Stack_restoDev.md`.
- [x] **D5. Cómo se sincroniza `banned_until` con `profiles.status`.** API de administración de Auth con una clave `service_role` (solo servidor, validada en `env.ts`, nunca `NEXT_PUBLIC_`). Hoy `service_role` no tiene cliente. Se implementa en F5.2; ahí también se revisa si hace falta algún `GRANT` a `service_role` (hoy no tiene ninguno).
- [x] **D6. Baja de `profiles` y `roles`.** Usan `status` / `is_active` y no `deleted_at`. Documentado como excepción deliberada en sus modelos.
- [x] **D7. Alta e invitación.** El enum incluye `pending`; el trigger crea perfiles `active` salvo que venga marcado como invitación; el flujo completo de invitación queda fuera de alcance. Resuelto en F1: la marca viaja en `raw_app_meta_data ->> 'invited' = 'true'` (el usuario no puede editarlo). El registro público de Auth ("Allow new users to sign up") estaba activo y se desactivó en el proyecto de pruebas el 2026-11-21; hay que revisarlo en cada entorno nuevo (producción incluido).
- [x] **D8. Primer administrador.** Las migraciones siembran roles y permisos, no usuarios (cada entorno tiene usuarios distintos). La asignación del primer `admin` es un SQL documentado en `docs/database/supabase-cli.md` (sección 6.2), ejecutado una vez por entorno (F2.5). Ejecutado en el proyecto de pruebas el 2026-11-21.
- [x] **D9. Auditoría: retención y datos sensibles.** Sin purga por ahora (volumen bajo); se revisa antes de auditar tablas con más movimiento, como `orders`. Hoy no hay campos sensibles en las tablas auditadas; el trigger debe poder excluir columnas por tabla si aparece alguno.
- [x] **D10. Aprobación del DER.** Título corregido (6 tablas propias más `auth.users`), `actor_id` alineado con D3 y marcado como aprobado.
- [x] **D11. Autorización en las Actions.** Un helper único (por ejemplo `src/lib/auth/requirePermission.ts`) que use `private.has_permission` vía RPC o `get_current_access_context()`, devuelva `FORBIDDEN` y se invoque en cada Action antes de validar con Zod. Un solo lugar para el cambio. (La parte "vía RPC" no es posible tal cual: ver D12.)
- [x] **D12. Cómo consulta permisos el helper de D11 (resuelta en F3.1b).** Detectada en F2: `private` no está expuesto en la API, así que `supabase.rpc("has_permission")` no llega a `private.has_permission`. Opciones: (a) función puente `public.has_permission(p_code text)` que delega en la de `private`, con `REVOKE EXECUTE` a `public` y `anon` y `GRANT` a `authenticated`; (b) adelantar `get_current_access_context()` de F5.6 (usuario, roles y permisos en una llamada) y que el helper lea de ahí. La (a) es la más chica y alcanza para F3; la (b) evita una llamada por permiso y sirve también para la interfaz. **Resuelta con la opción (a):** `public.has_permission(p_code text)` (`SECURITY INVOKER`, `search_path` vacío, `EXECUTE` revocado a `public` y `anon` y concedido a `authenticated`), que delega en `private.has_permission`; `requirePermission` la llama con `supabase.rpc()`. `get_current_access_context()` sigue prevista en F5.6.

### Tareas de la Fase 0

- [x] F0.1 Cerrar D1–D11.
- [x] F0.2 Crear los 6 `docs/database/model/Model_*.md` desde `Model_template.md`, con la sección "Impacto en `categories`" donde corresponda. Archivos: `Model_profile.md`, `Model_role.md`, `Model_permission.md`, `Model_role_permission.md`, `Model_user_role.md` y `Model_audit_log.md` (singular, como `Model_category.md`).
- [x] F0.3 Mover el DER a `docs/database/` y corregir su título; `audit_logs.actor_id` alineado con D3.
- [x] F0.4 Completar `Reglas_de_negocio.md` para los roles y permisos acordados.
- [x] F0.5 Actualizar `Convenciones_de_archivos.md` y `Stack_restoDev.md` según D4.
- [x] F0.6 Agregar este plan y el enlace en `PROGRESO.md`.
- [x] F0.7 Al copiar los archivos al repo: correr `pnpm format` y `pnpm check:full`, y abrir el PR de documentación hacia `develop`. Mergeado el 2026-11-21.
- **Impacto en `categories`:** ninguno; solo queda decidido.
- **Cierre:** decisiones confirmadas y modelos escritos; PR de documentación mergeado.

## 6. Fases

### Fase P. Prerrequisito: cerrar `deleteCategory`

La implementación de `deleteCategory` ya está mergeada en `develop` y la documentación está al día.

- [x] P.1 Pasar `check:full` en la rama actual y abrir el PR hacia `develop`.
- [x] P.2 Sincronizar `PROGRESO.md` (estado real de `deleteCategory`), `Estructura_de_carpetas.md` (agregados `deleteCategory.action.ts`, `.schema.ts`, `.service.ts` y `Contract_deleteCategory.md`) y el estado de HU-CAT-005. **La tabla de verificación de HU-CAT-005 se completa en F3.8**, cuando haya permisos reales, para probar todo junto (F3.8 la difiere hasta tener el Front).
- [x] P.3 Mergear en `develop` y crear la rama de la Fase 0 desde ahí (la rama con el typo `daleteCategory` se borra al mergear).
- **Impacto en `categories`:** cierra la operación de baja con permiso provisorio, tal como está documentada.

### Fase 1. Base de identidad: `profiles`

Migraciones: `create_profiles` (F1.2 a F1.5) y `backfill_profiles` (F1.6). Mergeada en `develop`.

- [x] F1.1 Rama `feature/identity-profiles` desde `develop`.
- [x] F1.2 Migración: enum `profile_status` (`pending`, `active`, `inactive`) y tabla `profiles` (`id` PK y FK a `auth.users` con `ON DELETE CASCADE`, `full_name` 2–120 tras `btrim`, `phone` ≤ 30, `avatar_path`, `status` default `'pending'` según D7, `created_at`, `updated_at`), índice `(status)`.
- [x] F1.3 Trigger `set_updated_at` reutilizando `public.set_updated_at()` (ya existe).
- [x] F1.4 `ENABLE ROW LEVEL SECURITY`; política de lectura del propio perfil (`id = (select auth.uid())`); `GRANT select` a `authenticated`; **sin** escritura directa desde la API.
- [x] F1.5 Función `handle_new_auth_user` (`SECURITY DEFINER`, `search_path` fijo) y trigger `AFTER INSERT ON auth.users`; `REVOKE EXECUTE` de la función. Marca de invitación (D7) en `raw_app_meta_data ->> 'invited'`; el trigger sobre `auth.users` se aplicó sin problemas con `db push --remote`.
- [x] F1.6 **Backfill** de los usuarios que ya existen en `auth.users` (incluido el de pruebas): `status = 'active'`, `full_name` tomado de `raw_user_meta_data` o, si falta, de la parte local del email (debe cumplir el CHECK de 2–120).
- [x] F1.7 Regenerar `database.types.ts`; actualizar `Model_profile.md`, lista de migraciones en `Estructura_de_carpetas.md` y `PROGRESO.md`.
- **Verificación (2026-11-21, proyecto de pruebas):** el usuario existente tiene perfil `active`; un usuario nuevo recibe perfil `active`; borrar la cuenta elimina el perfil (cascada); un usuario lee su perfil y no el ajeno; `UPDATE` directo, llamada a `handle_new_auth_user` y lectura como `anon` fallan con `42501`; `createCategory` sigue funcionando; `format` y `check:full` en verde. **No probado:** alta `pending` por invitación y `CHECK` de longitud.
- **Impacto en `categories`:** ninguno funcional. Se comprobó que crear una categoría sigue funcionando.

### Fase 2. Roles y permisos

Migraciones: `create_access_tables` (F2.2), `create_authorization_functions` (F2.3), `seed_roles_permissions` (F2.4) y `create_access_read_policies` (F2.6).

- [x] F2.1 Rama `feature/roles-permissions`.
- [x] F2.2 Migración de tablas: `roles`, `permissions` (PK natural `code`), `role_permissions` y `user_roles`, con PK compuestas, FK con las reglas `ON DELETE` del DER (sección 3.2), CHECK de formato/longitud e índices. RLS y `GRANT select` de cada una (las escrituras llegan por migración o RPC).
- [x] F2.3 Esquema `private` y funciones `private.has_permission(code)`, `private.has_role(code)`, `private.is_admin()` (= `has_role('admin')`): `SECURITY DEFINER`, `STABLE`, `search_path` fijo; verifican perfil `active`, rol `is_active` y la cadena `user_roles → roles → role_permissions → permissions`. `GRANT USAGE` + `EXECUTE` a `authenticated`, `REVOKE` a `public` y `anon`. Confirmado que `private` no está expuesto en la API (Settings → API → Exposed schemas: solo `public` y `graphql_public`).
- [x] F2.4 Migración de seed (idempotente, `on conflict do nothing`): permisos de D2, rol `admin` con `is_system = true` y su relación con todos los permisos.
- [x] F2.5 Asignar `admin` al usuario de pruebas con el SQL documentado (D8).
- [x] F2.6 Políticas de lectura de cada tabla según el DER 3.4 (`roles` para usuarios activos; `permissions` y `role_permissions` con `roles.manage`; `user_roles` filas propias o `users.manage`); incluye agregar `users.manage` a la lectura de `profiles`.
- [x] F2.7 Regenerar tipos; completar `Model_*.md` de las cuatro tablas, `supabase-cli.md` (procedimiento del primer admin, sección 6.2) y `PROGRESO.md`.
- **Verificación (2026-11-21, proyecto de pruebas):**
  - `has_permission`: `true` para el admin activo; `false` sin sesión, con perfil `pending`, con perfil `inactive`, con rol inactivo, sin rol y con un permiso inexistente. `is_admin()` es `true` para el admin.
  - Ejecución: `authenticated` puede ejecutar la función; `anon` no puede ejecutarla ni usar el esquema `private`.
  - Políticas: el admin ve 2 `profiles`, 1 `roles`, 6 `permissions`, 6 `role_permissions` y 1 `user_roles`; un usuario activo sin rol ve solo su `profile`, 1 `roles` y nada de lo demás; `anon` es rechazado con `42501`.
  - Seed repetido sin duplicados (6 permisos, 1 rol, 6 relaciones); `createCategory` sigue funcionando; `format` y `check:full` en verde.
  - **No probado:** los `CHECK` de formato y longitud, los duplicados, las cascadas y `RESTRICT`.
- **Impacto en `categories`:** ninguno todavía (la política provisoria sigue). Se confirmó que el usuario admin conserva el acceso.

### Fase 3. Migrar `categories` a permisos (punto crítico)

Es una migración de alteración, no de recreación. Orden obligatorio:

- [x] F3.1 Rama `feature/categories-permissions`.
- [x] F3.1b Resolver D12: migración con la función puente en `public` (o `get_current_access_context()`), con `REVOKE EXECUTE` a `public` y `anon` y `GRANT` a `authenticated`; probar que un usuario con y sin permiso recibe `true`/`false` vía `supabase.rpc()`.
- [x] F3.2 Migración A, **solo agrega**: tres políticas nuevas sobre `categories`.
  - Lectura: `categories.manage`, o `deleted_at is null` con `categories.read`.
  - Alta: `with check` con `categories.manage`.
  - Modificación: `using` y `with check` con `categories.manage`.
  - Sin política de `DELETE` (y sin `GRANT` de `DELETE`).
- [x] F3.3 Probar con el admin y con un usuario sin permisos (sección 7) mientras la provisoria sigue activa. Ojo: las políticas permisivas se combinan con `OR`, así que la prueba real de denegación solo es válida **después** del paso siguiente.
- [x] F3.4 Migración B: `drop policy categories_provisional_authenticated_all`. Repetir la matriz completa.
- [x] F3.5 Migración C (D3): `updated_by` con `ON DELETE SET NULL`. Verificar que borrar un usuario de prueba ya no queda bloqueado.
- [x] F3.6 Crear el helper de D11 y reemplazar los 5 `TODO(roles)`:
  - `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`: exigen `categories.manage`.
  - `getCategoryAction`, `listCategoriesAction`: exigen `categories.read`, y `categories.manage` si `include_deleted` es `true`.
  - El permiso se comprueba **antes** de validar con Zod y devuelve `FORBIDDEN` con los mensajes ya documentados.
- [x] F3.7 `/admin`: mostrar el nombre del perfil en lugar de "Hola ADMINISTRADOR" y exigir `admin.access` en el layout o la página (no en el proxy).
- [ ] F3.8 Documentación: `Model_category.md` (Seguridad y bloque provisorio), los 5 `Contract_*Category.md`, `Contract_categories.md`, las 5 HU (`Permiso actual` y `Pendiente`) y `PROGRESO.md` (cerrar las decisiones abiertas de roles, RLS provisoria y `/admin`). **Incluye completar la tabla de verificación de HU-CAT-005** (diferida desde P.2), probando sus criterios junto con la matriz de la sección 7; el criterio 9 sigue pendiente hasta que exista `products`. **Estado:** documentación sincronizada. **Las pruebas de la matriz de la sección 7 y las tablas de verificación de las 5 HU quedan diferidas hasta tener el Front** (decisión del 2026-11-21: todavía no hay pantallas ni Route Handlers para ejercitar las Actions). Esa parte de F3.8 queda abierta; el PR de la fase puede abrirse sin ella, dejando el diferimiento anotado en el PR.
- **Verificación:** la matriz de la sección 7 completa para las 5 operaciones, vía Action y vía `GET /api/categories`; escrituras directas a la Data API sin permiso fallan; `check:full`. **Diferida hasta tener el Front** (ver F3.8). Lo verificado en F3.1 a F3.7 con SQL y con el usuario admin se mantiene como está.
- **Impacto en `categories`:** es la fase donde cambia: política, FK, Actions, front y documentación.

### Fase 4. Auditoría

- [ ] F4.1 Rama `feature/audit-logs`.
- [ ] F4.2 Migración: `audit_logs` (`id bigint` identidad, `actor_id` → `auth.users(id)` `ON DELETE SET NULL`, `action`, `table_name`, `record_id`, `old_data`, `new_data`, `created_at`), índices `(created_at desc)`, `(table_name, record_id)`, `(actor_id)`. RLS: lectura con `audit.read`. `GRANT select` únicamente; `REVOKE UPDATE, DELETE, TRUNCATE` a todos los roles.
- [ ] F4.3 Trigger genérico `SECURITY DEFINER` (`AFTER`, así no interfiere con `set_updated_at`): `actor_id = auth.uid()` (NULL si actúa el servidor o una migración), `record_id` compuesto (`"user_id:role_id"`, `"role_id:permission_code"`) en las tablas sin `id`, exclusión de campos de D9. `REVOKE EXECUTE` de la función.
- [ ] F4.4 Activar el trigger primero en `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`; verificar; después en `categories`.
- [ ] F4.5 Confirmar que `audit_logs` no está en la publicación de Realtime.
- [ ] F4.6 Documentación: `Model_audit_log.md`; en `categories`, quitar "Registro en `audit_logs`" de los pendientes de los 5 contratos, las HU y el modelo, y pasar los "Efectos secundarios" a "implementado".
- **Verificación:** insertar, modificar y dar de baja una categoría genera un evento cada vez con el actor correcto; nadie puede editar ni borrar eventos; un usuario sin `audit.read` no los lee; `check:full`.
- **Impacto en `categories`:** se agrega el trigger; no cambian la tabla ni las Actions. Verificar que el trigger no rompe `.select()` posterior a `insert`/`update`.

### Fase 5. Protecciones y cierre

- [ ] F5.1 Rama `feature/access-hardening`.
- [ ] F5.2 Implementar la sincronización de `banned_until` con `profiles.status` según D5 (al pasar a `inactive` se bloquea; al reactivar se limpia): cliente de administración de Auth con `service_role` solo de servidor, variable validada en `env.ts` (nunca `NEXT_PUBLIC_`) y entrada en `.env.example` sin valor. Revisar si hace falta algún `GRANT` a `service_role`.
- [ ] F5.3 Trigger de `is_system`: rechaza borrar roles del sistema, cambiarles el `code` o desactivarlos (en trigger, no solo en RPC).
- [ ] F5.4 Protección anti-escalada en `user_roles` y `role_permissions`: exige `roles.manage` y bloquea la autoasignación. Debe **permitir** las migraciones y el seed (sin `auth.uid()`); por eso va en esta fase, no antes.
- [ ] F5.5 Guardia del último administrador: impide quitar `admin`, inactivar o borrar al último usuario con `admin.access`.
- [ ] F5.6 RPC `admin_*` y `get_current_access_context()` (usuario, roles y permisos en una llamada), con `REVOKE` a `public`/`anon`. Los Servicios las invocan con `supabase.rpc()` (D4). Si en F3 se eligió la opción (b) de D12, `get_current_access_context()` ya existe.
- [ ] F5.7 `REVOKE EXECUTE` de todas las funciones de trigger a `public`, `anon` y `authenticated`; revisión final de `GRANT`s de las 7 tablas (sin `anon`, sin `DELETE` donde hay baja lógica).
- [ ] F5.8 Ejecutar la matriz de la sección 7 sobre **todas** las tablas y registrar resultados.
- [ ] F5.9 Cierre documental: `Estructura_de_carpetas.md`, `Stack_restoDev.md`, `supabase-cli.md`, `PROGRESO.md` (estado y decisiones cerradas), y este archivo en "Completada".
- **Impacto en `categories`:** ninguno directo; se verifica de nuevo toda la matriz.
- **Cierre del plan:** todas las fases en "Completada" y la matriz verificada.

## 7. Matriz de verificación de acceso

Se ejecuta en F2 (funciones), F3 (categories) y F5 (todas las tablas). Se anota el resultado en la tabla de verificación de cada HU y en el PR.

> **Estado (2026-11-21):** la ejecución completa de esta matriz sobre `categories` vía Actions y vía `GET /api/categories` queda **diferida hasta tener el Front** (tarea F3.8). Hasta entonces, las tablas de verificación de las HU quedan en "Pendiente". Al retomarla, registrar cada resultado en las HU y en el PR.

| Usuario de prueba                           | Leer categorías | Leer categorías de baja | Crear / modificar / dar de baja | `/admin`             |
| ------------------------------------------- | --------------- | ----------------------- | ------------------------------- | -------------------- |
| Sin sesión                                  | `UNAUTHORIZED`  | `UNAUTHORIZED`          | `UNAUTHORIZED`                  | Redirige a `/login`  |
| Con sesión, sin rol                         | `FORBIDDEN`     | `FORBIDDEN`             | `FORBIDDEN`                     | Denegado             |
| Con `categories.read` solamente             | Sí              | `FORBIDDEN`             | `FORBIDDEN`                     | Denegado             |
| Con `categories.manage`                     | Sí              | Sí                      | Sí                              | Según `admin.access` |
| Perfil `inactive` o `pending` con rol admin | `FORBIDDEN`     | `FORBIDDEN`             | `FORBIDDEN`                     | Denegado             |
| Admin con rol `is_active = false`           | `FORBIDDEN`     | `FORBIDDEN`             | `FORBIDDEN`                     | Denegado             |

Además, para cada tabla expuesta: intentar escribir **sin pasar por la Action** (directo a la Data API) con cada usuario.

**Cómo probar RLS sin Docker:** en el SQL Editor del proyecto de pruebas, con un bloque `do $$ ... $$` que cambia de rol con `set_config('role', ..., true)` y `set_config('request.jwt.claims', ...)`, acumula los resultados en un texto y termina con `raise exception` (así se deshace todo, incluso usuarios de prueba insertados en `auth.users`, y el mensaje trae el resumen). Se usó en F1 y F2; el patrón está en `docs/database/supabase-cli.md`, sección 9.

## 8. Trampas conocidas (leer antes de cada fase)

- **T1. Con permisos en RLS, el rechazo no siempre es `42501`.** Un `SELECT` o un `UPDATE` bloqueado por `using` devuelve 0 filas, no error. En `updateCategory` eso se vería como `NOT_FOUND`, y en `deleteCategory`, tras la consulta de existencia, como el `CONFLICT` engañoso "Desactivá la categoría antes de darla de baja". Por eso la verificación de permiso en la Action (F3.6) no es opcional: es la que produce el `FORBIDDEN` correcto; RLS es la red de seguridad.
- **T2. Quien escribe tiene que leer todo.** `resolveCategorySlug` necesita ver los slugs de categorías dadas de baja. Si una política ocultara esas filas a alguien que puede crear o renombrar, la detección de colisiones fallaría y terminaría en `INTERNAL_ERROR`. De ahí la política de lectura: `categories.manage` ve todo.
- **T3. Políticas permisivas se suman con `OR`.** Mientras exista la provisoria, las nuevas no restringen nada (F3.3).
- **T4. `GRANT` olvidado = `42501` en todo.** Se revisa en cada tabla y función nueva.
- **T5. `SECURITY DEFINER` sin `REVOKE` queda invocable por cualquiera** desde la API.
- **T6. Protecciones demasiado tempranas bloquean el seed.** Anti-escalada y guardia del último admin van en F5, después de sembrar.
- **T7. Tipos generados.** Las funciones de `private` no aparecen en `database.types.ts`; las RPC de `public` sí. Regenerar tras cada migración, con el comando seguro (T10).
- **T8. Caché de tipos de Next.** Si se borra o mueve una `page.tsx` (F3.7), parar `pnpm dev`, borrar `.next` y volver a correr.
- **T9. `cacheComponents`** conserva el estado de páginas ya visitadas: si `/admin` pasa a depender del perfil, evitar `new Date()` en Server Components y revisar que no muestre datos de una sesión anterior tras cerrar sesión.
- **T10. Redirigir `gen types` directo al archivo lo vacía si el comando falla.** `supabase gen types typescript --linked` falla con "Cannot find project ref". Usar `--project-id` y un archivo temporal (`> /tmp/db.types.ts && mv ...`). Recuperación: `git checkout -- src/core/types/database.types.ts`.
- **T11. Las funciones de `private` no se pueden llamar con `supabase.rpc()`.** El esquema no está expuesto (a propósito). Las Actions necesitan una función puente en `public` (D12). Las políticas RLS sí pueden llamar a `private.*` porque se evalúan dentro de la base.
- **T12. Un usuario de Auth creado en el panel recibe perfil `active` y ningún rol.** Con el registro público desactivado (D7) solo se crean usuarios desde el panel o la API de administración, pero mientras `categories` tenga la política provisoria, ese usuario puede leer y escribir categorías. Corregido en F3.4: sin roles no tiene permisos sobre `categories`.

## 9. Registro de cambios

| Fecha      | Cambio                                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-20 | Archivo creado con el plan por fases, decisiones y matriz de pruebas                                                                                                                                     |
| 2026-11-20 | F0: confirmadas D1, D3, D5 y D9; escritos los 6 modelos (F0.2) y `Reglas_de_negocio.md` (F0.4)                                                                                                           |
| 2026-11-20 | F0: confirmadas D2, D4, D6, D7, D8, D10 y D11; DER corregido (F0.3), convenciones y stack (F0.5) y `PROGRESO.md` (F0.6) actualizados. `deleteCategory` mergeada                                          |
| 2026-11-21 | Fase P completada: documentación de `deleteCategory` sincronizada (P.2). La tabla de verificación de HU-CAT-005 se difiere a F3.8                                                                        |
| 2026-11-21 | F0 completada: PR de documentación mergeado en `develop` (F0.7)                                                                                                                                          |
| 2026-11-21 | F1 completada: migraciones `create_profiles` y `backfill_profiles` aplicadas, verificadas y mergeadas; D7 resuelta (marca `invited` en `raw_app_meta_data`); trampa T10                                  |
| 2026-11-21 | F2 implementada y verificada en la base (tablas, funciones `private`, seed, primer admin y políticas de lectura); `supabase-cli.md` actualizada; agregadas D12 (abierta), T11 y T12 y la tarea F3.1b     |
| 2026-11-21 | Registro público de Auth desactivado en el proyecto de pruebas (cierra el pendiente de D7)                                                                                                               |
| 2026-11-21 | F3 implementada y verificada hasta F3.7 (D12 resuelta con la función puente; `/admin` con `admin.access` y `requirePagePermission`); F3.8: documentación sincronizada, tablas de verificación pendientes |
| 2026-11-21 | F3.8: las pruebas de la matriz (sección 7) y las tablas de verificación de las 5 HU se difieren hasta tener el Front; la fase queda lista para abrir su PR con ese diferimiento anotado                  |
