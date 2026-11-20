# Plan: identidad, acceso y auditoría

> Copiar a `docs/Plan_identidad_y_permisos.md`. Última actualización: 2026-11-20.
> Referencia de diseño: `DER_identidad_acceso_auditoria.html`. Detalle por tabla: `docs/database/model/Model_*.md` (se crean en la Fase 0).

## 0. Cómo usar este archivo

- Cada tarea tiene un ID (`F3.4`) para poder decir "sigamos con F3.4" en cualquier chat.
- Se marca `[x]` solo cuando la tarea está **hecha y verificada**, no antes.
- Al cerrar una fase: actualizar la tabla de la sección 1, el registro de cambios (sección 9) y agregar una línea en `PROGRESO.md` con el estado y un enlace a este archivo.
- `PROGRESO.md` sigue siendo el resumen general del proyecto; este archivo es el detalle de este frente. No se duplica contenido entre ambos.
- Si aparece una decisión nueva a mitad de una fase, se agrega en la sección 5 y se resuelve ahí; no se improvisa en el código.

## 1. Estado general

| Fase | Contenido                                           | Rama sugerida                    | Depende de | Estado    |
| ---- | --------------------------------------------------- | -------------------------------- | ---------- | --------- |
| P    | Cerrar `deleteCategory` y sincronizar documentación | `feature/daleteCategory` (hoy)   | —          | Pendiente |
| F0   | Decisiones y modelos documentados (sin código)      | `docs/identity-access-design`    | P          | Pendiente |
| F1   | Base de identidad: `profiles`                       | `feature/identity-profiles`      | F0         | Pendiente |
| F2   | Roles, permisos y funciones de autorización         | `feature/roles-permissions`      | F1         | Pendiente |
| F3   | Migrar `categories` a permisos                      | `feature/categories-permissions` | F2         | Pendiente |
| F4   | Auditoría (`audit_logs` + triggers)                 | `feature/audit-logs`             | F3         | Pendiente |
| F5   | Protecciones, RPC administrativas y cierre          | `feature/access-hardening`       | F4         | Pendiente |

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
2. **Cada migración que crea una tabla incluye RLS, políticas y GRANT mínimo.** Sin `GRANT`, RLS ni se evalúa y todo falla con `42501`. Sin `DELETE` en tablas con baja lógica, y sin permisos para `anon`.
3. **Las migraciones se aplican al proyecto de pruebas** con `pnpm exec supabase db push --remote`; después se regeneran los tipos (`supabase gen types typescript --linked > src/core/types/database.types.ts`). Nunca contra producción desde `develop`.
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
| `categories.updated_by` → `auth.users(id)` sin `ON DELETE`                                           | Con `NO ACTION`, impide borrar un usuario que haya tocado categorías | Decidir (D3): mantener la FK y agregar `ON DELETE SET NULL`                                                        | F3   |
| `TODO(roles)` en las 5 Actions de `categories` (create, get, list, update, delete)                   | Solo se comprueba sesión                                             | Se reemplaza por la verificación de permiso y `FORBIDDEN`                                                          | F3   |
| `include_deleted` en `getCategory` y `listCategories`                                                | Cualquier autenticado puede pedirlo                                  | Exige `categories.manage`                                                                                          | F3   |
| `resolveCategorySlug` (lee los slugs de **todas** las filas, incluidas las de baja)                  | Funciona porque la política permite leer todo                        | Quien pueda escribir debe poder leer todas las filas (ver trampa T2)                                               | F3   |
| `Model_category.md`: sección Seguridad y bloque "Estado actual (provisorio)"                         | Contradice el estado real                                            | Reescribir con las políticas definitivas                                                                           | F3   |
| 5 contratos `Contract_*Category.md`, `Contract_categories.md` y 5 HU (`Alcance actual y pendientes`) | "Permiso actual: cualquier usuario con sesión"                       | Permiso real por operación; quitar "provisorio"                                                                    | F3   |
| "Registro en `audit_logs`" pendiente en contratos, HU y modelo                                       | Pendiente                                                            | Se cierra al activar el trigger sobre `categories`                                                                 | F4   |
| `/admin` con "Hola ADMINISTRADOR" fijo; `proxy.ts` solo comprueba sesión                             | Cualquier usuario autenticado entra                                  | Mostrar el nombre del perfil y exigir `admin.access` fuera del proxy (layout o página)                             | F3   |
| `PROGRESO.md`: "Decisiones abiertas" sobre roles, RLS provisoria y GRANT                             | Abiertas                                                             | Se cierran a medida que se completan las fases                                                                     | F3   |
| `Contract_errors.md` y `ErrorCode`                                                                   | `FORBIDDEN` ya cubre "rol insuficiente o RLS rechaza"                | Sin cambios; no hace falta un código nuevo                                                                         | —    |

## 5. Decisiones (Fase 0)

Cada decisión lleva una recomendación; se marca `[x]` cuando queda **confirmada**.

- [ ] **D1. Roles base.** Recomendación: sembrar solo `admin` ahora (`is_system = true`). `staff` y `delivery` (mencionados en el DER) y cajero/mesero se agregan junto con los módulos que los necesiten. `Reglas_de_negocio.md` está vacío: completarlo para estos roles antes de sembrarlos.
- [ ] **D2. Catálogo de permisos** (formato `modulo.accion`). Recomendación, solo lo que existe hoy: `categories.read`, `categories.manage`, `users.manage`, `roles.manage`, `audit.read`, `admin.access`. El DER usa `admin.access` y `audit.read` sin listarlos en el catálogo: dejarlos explícitos. `categories.manage` incluye `categories.read` (lo resuelve la política, no un permiso aparte).
- [ ] **D3. Referencia de autoría.** Recomendación: `auth.users(id)` en `categories.updated_by` y en `audit_logs.actor_id` (el DER propone `profiles(id)`). Es el mismo UUID, evita una dependencia de orden y no obliga a tocar datos de `categories`. En `categories.updated_by` agregar `ON DELETE SET NULL`.
- [ ] **D4. RPC frente a "el Servicio consulta Supabase directo".** Recomendación: lecturas y escrituras simples siguen el flujo actual (Servicio + cliente Supabase + RLS). `SECURITY DEFINER` + `supabase.rpc()` solo para operaciones sensibles (asignar roles y permisos, cambiar `status`). Dejarlo escrito en `Convenciones_de_archivos.md` y `Stack_restoDev.md`.
- [ ] **D5. Cómo se sincroniza `banned_until` con `profiles.status`.** Opciones: API de administración de Auth con una clave `service_role` (solo servidor, validada en `env.ts`, nunca `NEXT_PUBLIC_`) o una función SQL. Hoy `service_role` no tiene permisos ni cliente. Decidir antes de la F5.
- [ ] **D6. Baja de `profiles` y `roles`.** Usan `status` / `is_active` y no `deleted_at`. Documentarlo como excepción deliberada en sus modelos.
- [ ] **D7. Alta e invitación.** El DER define `pending` y `onboarding_required` sin describir el flujo. Recomendación para este plan: el enum incluye `pending`, el trigger crea perfiles `active` salvo que venga marcado como invitación, y el flujo completo de invitación queda fuera de alcance.
- [ ] **D8. Primer administrador.** Recomendación: las migraciones siembran roles y permisos, no usuarios (cada entorno tiene usuarios distintos). La asignación del primer `admin` es un SQL documentado en `docs/database/supabase-cli.md`, ejecutado una vez por entorno.
- [ ] **D9. Auditoría: retención y datos sensibles.** Decidir política de retención de `audit_logs` y qué campos excluir de `old_data` / `new_data` (hoy no hay ninguno sensible en las tablas auditadas).
- [ ] **D10. Aprobación del DER.** Corregir el título ("7 tablas" → 6 propias más `auth.users`) y marcarlo aprobado.
- [ ] **D11. Autorización en las Actions.** Recomendación: un helper único (por ejemplo `src/lib/auth/requirePermission.ts`) que use `private.has_permission` vía RPC o `get_current_access_context()`, devuelva `FORBIDDEN` y se invoque en cada Action antes de validar con Zod. Un solo lugar para el cambio.

### Tareas de la Fase 0

- [ ] F0.1 Cerrar D1–D11 (puede hacerse conversando de a una).
- [ ] F0.2 Crear los 6 `docs/database/model/Model_*.md` desde `Model_template.md` (`profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `audit_logs`), con la sección "Impacto en `categories`" donde corresponda.
- [ ] F0.3 Mover o enlazar el DER dentro de `docs/database/` y corregir su título.
- [ ] F0.4 Completar `Reglas_de_negocio.md` para los roles y permisos acordados.
- [ ] F0.5 Actualizar `Convenciones_de_archivos.md` y `Stack_restoDev.md` según D4.
- [ ] F0.6 Agregar este plan y el enlace en `PROGRESO.md`.
- **Impacto en `categories`:** ninguno; solo queda decidido.
- **Cierre:** decisiones confirmadas y modelos escritos; PR de documentación mergeado.

## 6. Fases

### Fase P. Prerrequisito: cerrar `deleteCategory`

`PROGRESO.md` dice que la implementación no comenzó, pero la Action, el schema, el Servicio, el contrato y el export en `index.ts` ya existen. Hay que dejar esa rama cerrada antes de tocar permisos, para no mezclar dos cambios.

- [ ] P.1 Pasar `check:full` en la rama actual y abrir el PR hacia `develop`.
- [ ] P.2 Sincronizar `PROGRESO.md` (estado real de `deleteCategory`), `Estructura_de_carpetas.md` (faltan `deleteCategory.action.ts`, `.schema.ts`, `.service.ts` y `Contract_deleteCategory.md`) y la tabla de verificación de HU-CAT-005.
- [ ] P.3 Mergear en `develop` y crear la rama de la Fase 0 desde ahí (la rama actual tiene un typo, `daleteCategory`; se borra al mergear).
- **Impacto en `categories`:** cierra la operación de baja con permiso provisorio, tal como está documentada.

### Fase 1. Base de identidad: `profiles`

- [ ] F1.1 Rama `feature/identity-profiles` desde `develop`.
- [ ] F1.2 Migración: enum `profile_status` (`pending`, `active`, `inactive`) y tabla `profiles` (`id` PK y FK a `auth.users` con `ON DELETE CASCADE`, `full_name` 2–120 tras `btrim`, `phone` ≤ 30, `avatar_path`, `status` default `'pending'` según D7, `created_at`, `updated_at`), índice `(status)`.
- [ ] F1.3 Trigger `set_updated_at` reutilizando `public.set_updated_at()` (ya existe).
- [ ] F1.4 `ENABLE ROW LEVEL SECURITY`; política de lectura del propio perfil (`id = (select auth.uid())`); `GRANT select` a `authenticated`; **sin** escritura directa desde la API.
- [ ] F1.5 Función `handle_new_auth_user` (`SECURITY DEFINER`, `search_path` fijo) y trigger `AFTER INSERT ON auth.users`; `REVOKE EXECUTE` de la función. Probar que el trigger sobre `auth.users` se aplica con `db push --remote`.
- [ ] F1.6 **Backfill** de los usuarios que ya existen en `auth.users` (incluido el de pruebas): `status = 'active'`, `full_name` tomado de `raw_user_meta_data` o, si falta, de la parte local del email (debe cumplir el CHECK de 2–120).
- [ ] F1.7 Regenerar `database.types.ts`; actualizar `Model_profile.md`, lista de migraciones en `Estructura_de_carpetas.md` y `PROGRESO.md`.
- **Verificación:** un usuario nuevo recibe perfil; el usuario existente tiene perfil `active`; un usuario lee su perfil y no el ajeno; un `UPDATE` directo falla con `42501`; `check:full`.
- **Impacto en `categories`:** ninguno funcional. Comprobar que crear una categoría sigue funcionando.

### Fase 2. Roles y permisos

- [ ] F2.1 Rama `feature/roles-permissions`.
- [ ] F2.2 Migración de tablas: `roles`, `permissions` (PK natural `code`), `role_permissions` y `user_roles`, con PK compuestas, FK con las reglas `ON DELETE` del DER (sección 3.2), CHECK de formato/longitud e índices. RLS y GRANT de cada una (solo `select` donde corresponda; las escrituras llegan por migración o RPC).
- [ ] F2.3 Esquema `private` y funciones `private.has_permission(code)`, `private.has_role(code)`, `private.is_admin()`: `SECURITY DEFINER`, `STABLE`, `search_path` fijo; verifican perfil `active`, rol `is_active` y la cadena `user_roles → roles → role_permissions → permissions`. `GRANT USAGE` + `EXECUTE` a `authenticated`, `REVOKE` a `public` y `anon`. Confirmar que `private` no está expuesto en la API.
- [ ] F2.4 Migración de seed (idempotente, `on conflict do nothing`): permisos de D2, rol `admin` con `is_system = true` y su relación con todos los permisos.
- [ ] F2.5 Asignar `admin` al usuario de pruebas con el SQL documentado (D8).
- [ ] F2.6 Políticas de lectura de cada tabla según el DER 3.4 (`roles.manage`, `users.manage`, filas propias).
- [ ] F2.7 Regenerar tipos; completar `Model_*.md` de las cuatro tablas, `supabase-cli.md` (procedimiento del primer admin) y `PROGRESO.md`.
- **Verificación:** `has_permission` por cada caso de la matriz de la sección 7 (sin rol, perfil inactivo, perfil `pending`, rol inactivo, admin); seed repetible sin errores; `check:full`.
- **Impacto en `categories`:** ninguno todavía (la política provisoria sigue). Confirmar que el usuario admin conserva el acceso.

### Fase 3. Migrar `categories` a permisos (punto crítico)

Es una migración de alteración, no de recreación. Orden obligatorio:

- [ ] F3.1 Rama `feature/categories-permissions`.
- [ ] F3.2 Migración A, **solo agrega**: tres políticas nuevas sobre `categories`.
  - Lectura: `categories.manage`, o `deleted_at is null` con `categories.read`.
  - Alta: `with check` con `categories.manage`.
  - Modificación: `using` y `with check` con `categories.manage`.
  - Sin política de `DELETE` (y sin `GRANT` de `DELETE`).
- [ ] F3.3 Probar con el admin y con un usuario sin permisos (sección 7) mientras la provisoria sigue activa. Ojo: las políticas permisivas se combinan con `OR`, así que la prueba real de denegación solo es válida **después** del paso siguiente.
- [ ] F3.4 Migración B: `drop policy categories_provisional_authenticated_all`. Repetir la matriz completa.
- [ ] F3.5 Migración C (según D3): `updated_by` con `ON DELETE SET NULL`. Verificar que borrar un usuario de prueba ya no queda bloqueado.
- [ ] F3.6 Crear el helper de D11 y reemplazar los 5 `TODO(roles)`:
  - `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`: exigen `categories.manage`.
  - `getCategoryAction`, `listCategoriesAction`: exigen `categories.read`, y `categories.manage` si `include_deleted` es `true`.
  - El permiso se comprueba **antes** de validar con Zod y devuelve `FORBIDDEN` con los mensajes ya documentados.
- [ ] F3.7 `/admin`: mostrar el nombre del perfil en lugar de "Hola ADMINISTRADOR" y exigir `admin.access` en el layout o la página (no en el proxy).
- [ ] F3.8 Documentación: `Model_category.md` (Seguridad y bloque provisorio), los 5 `Contract_*Category.md`, `Contract_categories.md`, las 5 HU (`Permiso actual` y `Pendiente`) y `PROGRESO.md` (cerrar las decisiones abiertas de roles, RLS provisoria y `/admin`).
- **Verificación:** la matriz de la sección 7 completa para las 5 operaciones, vía Action y vía `GET /api/categories`; escrituras directas a la Data API sin permiso fallan; `check:full`.
- **Impacto en `categories`:** es la fase donde cambia: política, FK, Actions, front y documentación.

### Fase 4. Auditoría

- [ ] F4.1 Rama `feature/audit-logs`.
- [ ] F4.2 Migración: `audit_logs` (`id bigint` identidad, `actor_id` → `auth.users(id)` `ON DELETE SET NULL`, `action`, `table_name`, `record_id`, `old_data`, `new_data`, `created_at`), índices `(created_at desc)`, `(table_name, record_id)`, `(actor_id)`. RLS: lectura con `audit.read`. `GRANT select` únicamente; `REVOKE UPDATE, DELETE, TRUNCATE` a todos los roles.
- [ ] F4.3 Trigger genérico `SECURITY DEFINER` (`AFTER`, así no interfiere con `set_updated_at`): `actor_id = auth.uid()` (NULL si actúa el servidor o una migración), `record_id` compuesto (`"user_id:role_id"`, `"role_id:permission_code"`) en las tablas sin `id`, exclusión de campos de D9. `REVOKE EXECUTE` de la función.
- [ ] F4.4 Activar el trigger primero en `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`; verificar; después en `categories`.
- [ ] F4.5 Confirmar que `audit_logs` no está en la publicación de Realtime.
- [ ] F4.6 Documentación: `Model_audit_logs.md`; en `categories`, quitar "Registro en `audit_logs`" de los pendientes de los 5 contratos, las HU y el modelo, y pasar los "Efectos secundarios" a "implementado".
- **Verificación:** insertar, modificar y dar de baja una categoría genera un evento cada vez con el actor correcto; nadie puede editar ni borrar eventos; un usuario sin `audit.read` no los lee; `check:full`.
- **Impacto en `categories`:** se agrega el trigger; no cambian la tabla ni las Actions. Verificar que el trigger no rompe `.select()` posterior a `insert`/`update`.

### Fase 5. Protecciones y cierre

- [ ] F5.1 Rama `feature/access-hardening`.
- [ ] F5.2 Resolver D5 e implementar la sincronización de `banned_until` con `profiles.status` (al pasar a `inactive` se bloquea; al reactivar se limpia).
- [ ] F5.3 Trigger de `is_system`: rechaza borrar roles del sistema, cambiarles el `code` o desactivarlos (en trigger, no solo en RPC).
- [ ] F5.4 Protección anti-escalada en `user_roles` y `role_permissions`: exige `roles.manage` y bloquea la autoasignación. Debe **permitir** las migraciones y el seed (sin `auth.uid()`); por eso va en esta fase, no antes.
- [ ] F5.5 Guardia del último administrador: impide quitar `admin`, inactivar o borrar al último usuario con `admin.access`.
- [ ] F5.6 RPC `admin_*` y `get_current_access_context()` (usuario, roles y permisos en una llamada), con `REVOKE` a `public`/`anon`. Los Servicios las invocan con `supabase.rpc()` (D4).
- [ ] F5.7 `REVOKE EXECUTE` de todas las funciones de trigger a `public`, `anon` y `authenticated`; revisión final de `GRANT`s de las 7 tablas (sin `anon`, sin `DELETE` donde hay baja lógica).
- [ ] F5.8 Ejecutar la matriz de la sección 7 sobre **todas** las tablas y registrar resultados.
- [ ] F5.9 Cierre documental: `Estructura_de_carpetas.md`, `Stack_restoDev.md`, `supabase-cli.md`, `PROGRESO.md` (estado y decisiones cerradas), y este archivo en "Completada".
- **Impacto en `categories`:** ninguno directo; se verifica de nuevo toda la matriz.
- **Cierre del plan:** todas las fases en "Completada" y la matriz verificada.

## 7. Matriz de verificación de acceso

Se ejecuta en F2 (funciones), F3 (categories) y F5 (todas las tablas). Se anota el resultado en la tabla de verificación de cada HU y en el PR.

| Usuario de prueba                           | Leer categorías | Leer categorías de baja | Crear / modificar / dar de baja | `/admin`             |
| ------------------------------------------- | --------------- | ----------------------- | ------------------------------- | -------------------- |
| Sin sesión                                  | `UNAUTHORIZED`  | `UNAUTHORIZED`          | `UNAUTHORIZED`                  | Redirige a `/login`  |
| Con sesión, sin rol                         | `FORBIDDEN`     | `FORBIDDEN`             | `FORBIDDEN`                     | Denegado             |
| Con `categories.read` solamente             | Sí              | `FORBIDDEN`             | `FORBIDDEN`                     | Denegado             |
| Con `categories.manage`                     | Sí              | Sí                      | Sí                              | Según `admin.access` |
| Perfil `inactive` o `pending` con rol admin | `FORBIDDEN`     | `FORBIDDEN`             | `FORBIDDEN`                     | Denegado             |
| Admin con rol `is_active = false`           | `FORBIDDEN`     | `FORBIDDEN`             | `FORBIDDEN`                     | Denegado             |

Además, para cada tabla expuesta: intentar escribir **sin pasar por la Action** (directo a la Data API) con cada usuario.

**Cómo probar RLS sin Docker:** en el SQL Editor del proyecto de pruebas, dentro de una transacción, usar `set local role authenticated;` y `set local request.jwt.claims = '{"sub":"<uuid del usuario>"}';`, ejecutar la consulta y hacer `rollback`.

## 8. Trampas conocidas (leer antes de cada fase)

- **T1. Con permisos en RLS, el rechazo no siempre es `42501`.** Un `SELECT` o un `UPDATE` bloqueado por `using` devuelve 0 filas, no error. En `updateCategory` eso se vería como `NOT_FOUND`, y en `deleteCategory`, tras la consulta de existencia, como el `CONFLICT` engañoso "Desactivá la categoría antes de darla de baja". Por eso la verificación de permiso en la Action (F3.6) no es opcional: es la que produce el `FORBIDDEN` correcto; RLS es la red de seguridad.
- **T2. Quien escribe tiene que leer todo.** `resolveCategorySlug` necesita ver los slugs de categorías dadas de baja. Si una política ocultara esas filas a alguien que puede crear o renombrar, la detección de colisiones fallaría y terminaría en `INTERNAL_ERROR`. De ahí la política de lectura: `categories.manage` ve todo.
- **T3. Políticas permisivas se suman con `OR`.** Mientras exista la provisoria, las nuevas no restringen nada (F3.3).
- **T4. `GRANT` olvidado = `42501` en todo.** Se revisa en cada tabla y función nueva.
- **T5. `SECURITY DEFINER` sin `REVOKE` queda invocable por cualquiera** desde la API.
- **T6. Protecciones demasiado tempranas bloquean el seed.** Anti-escalada y guardia del último admin van en F5, después de sembrar.
- **T7. Tipos generados.** Las funciones de `private` no aparecen en `database.types.ts`; las RPC de `public` sí. Regenerar tras cada migración.
- **T8. Caché de tipos de Next.** Si se borra o mueve una `page.tsx` (F3.7), parar `pnpm dev`, borrar `.next` y volver a correr.
- **T9. `cacheComponents`** conserva el estado de páginas ya visitadas: si `/admin` pasa a depender del perfil, evitar `new Date()` en Server Components y revisar que no muestre datos de una sesión anterior tras cerrar sesión.

## 9. Registro de cambios

| Fecha      | Cambio                                                               |
| ---------- | -------------------------------------------------------------------- |
| 2026-11-20 | Archivo creado con el plan por fases, decisiones y matriz de pruebas |
