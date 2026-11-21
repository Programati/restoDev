# PROGRESO

> Leer este archivo al inicio de cada chat. Reglas y convenciones detalladas en `docs/` y `AGENTS.md`.
> Última actualización: 2026-11-20

## Proyecto

- **Nombre:** resto-app (`restoDev`)
- **Rama:** `docs/identity-access-design` (Fase 0 del plan de identidad y permisos)
- **Cambios locales sin commit ni PR:** documentación de la Fase 0 (plan, 6 modelos, DER, reglas de negocio, convenciones y stack)
- **PRs anteriores:** los PR de setup, Supabase, entorno, autenticación, `createCategory` y `deleteCategory` están completados y mergeados en `develop`
- **Estado actual:** Fase 0 completa a falta de PR; sigue la Fase 1 (`profiles`). Detalle en `docs/Plan_identidad_y_permisos.md`
- **Gestor:** pnpm 12.11.2 · Node 24.22.1

## Stack

| Área                                      | Versión                        |
| ----------------------------------------- | ------------------------------ |
| Next.js (App Router, `src/`)              | 16.4.5                         |
| React                                     | 19.3.0                         |
| TypeScript (strict)                       | 5.9.3                          |
| Tailwind (vía `@tailwindcss/turbopack`)   | 4.3.5                          |
| Zod                                       | 4.6.7                          |
| ESLint + `eslint-config-next`             | 9.39.5 / 16.4.5                |
| Prettier + `prettier-plugin-tailwindcss`  | 3.9.10 / 0.8.1                 |
| Husky                                     | 9.1.7                          |
| lint-staged                               | 17.6.0                         |
| Supabase CLI (devDependency)              | versión exacta en package.json |
| `@supabase/supabase-js` · `@supabase/ssr` | versión exacta en package.json |

## Configuración clave

- `next.config.ts`: `cacheComponents`, `partialPrefetching`, `experimental.agentFeedback`
- `pnpm-workspace.yaml`: `minimumReleaseAge: 4320` (3 días), `saveExact: true`, `allowBuilds` con `sharp` y `unrs-resolver` en `false` y `supabase` en `true` (necesita su script de instalación para descargar el binario)
- `tsconfig.json`: `strict` y `erasableSyntaxOnly` activos (sin `enum`, `namespace` ni parameter properties en constructores: declarar el campo y asignarlo a mano)
- Alias de imports: `@/*` → `./src/*`
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `check`, `check:full`, `prepare` (Husky)
- `.prettierrc`: sin `;`, comillas dobles, `trailingComma: all`, `printWidth: 100`, plugin de Tailwind
- `.prettierignore`: incluye `src/core/types/database.types.ts` (generado por Supabase) y `pnpm-lock.yaml`
- `.gitignore`: base de `create-next-app` + `/dist`, `*.log`, `/playwright-report/`, `/test-results/` y la excepción `!.env.example`; `supabase/.temp/` ignorado
- `lint-staged.config.mjs`: `*.{ts,tsx,js,jsx,mjs}` → `eslint --fix` + `prettier --write`; `*.{json,md,css,yml,yaml}` → `prettier --write`
- `.husky/pre-commit`: `pnpm exec lint-staged` y luego `pnpm run typecheck` (corre sobre todo el proyecto: un archivo temporal con errores bloquea cualquier commit)
- Supabase: CLI se usa siempre con `pnpm exec supabase <comando>`; proyecto de pruebas `restoDevNew` vinculado (`supabase link`); el esquema se tipa con `supabase gen types typescript --linked > src/core/types/database.types.ts`
- Supabase CLI: `db push` apunta por defecto a una base local (necesita Docker); para aplicar migraciones al proyecto de pruebas en la nube usar `pnpm exec supabase db push --remote`
- **GRANT obligatorio en cada tabla:** las tablas creadas por migración no reciben permisos para `anon`, `authenticated` ni `service_role` (solo `REFERENCES`, `TRIGGER`, `TRUNCATE`). Sin `GRANT`, RLS no llega a evaluarse y toda consulta falla con `42501` (los Servicios lo reportan como `INTERNAL_ERROR`). Las tablas deben quedar con RLS, políticas y GRANT mínimo (sin `DELETE` en tablas con baja lógica); las nuevas tablas deben incorporar estas protecciones al crearse. En `categories`, el GRANT se añadió en una migración posterior. Detalle en `docs/database/supabase-cli.md`
- Variables de entorno: `.env` (no versionado) y `.env.example` (versionado, sin valores). Variables actuales: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Se validan con Zod en `src/lib/env.ts`; las variables se leen por su nombre completo (Next.js solo reemplaza referencias explícitas a `process.env.NOMBRE`)
- Clientes Supabase: `src/lib/supabase/client.ts` (navegador) y `server.ts` (servidor, con cookies; `createClient()` se ejecuta por petición, nunca como constante global)
- `src/proxy.ts` (Next.js 16 renombró `middleware.ts` a `proxy.ts`): llama a `updateSession` de `src/lib/supabase/middleware.ts`; refresca la sesión. Sin sesión redirige a `/login` en rutas privadas; `/` es pública (comparación **exacta**, no con `startsWith`, o todo quedaría público) y `/login` está en `PUBLIC_PATHS`. Con sesión, `/` y `/login` redirigen a `/admin`. Los redirects conservan las cookies de sesión refrescadas. Excluye `/api` del matcher. Es solo comodidad de navegación: la seguridad real va dentro de cada Action (`auth.getUser()`)
- Server Actions se tratan como endpoints públicos: cada una verifica sesión y permisos por sí misma, y recibe `input: unknown` que valida con Zod
- Errores de servicio: `src/lib/errors.ts` (`ServiceError` con `code: ErrorCode`). Los Servicios lanzan `ServiceError`; la Action lo convierte en `ActionResult`
- `categories`: unicidad de `name` y `slug`, formato de `slug`, límites de longitud y `display_order >= 0` documentados y aplicados con constraints/migraciones. El servicio `createCategory` detecta la colisión de slug con `error.message.includes("slug")`: si se renombran las constraints, ajustarlo
- `createCategory` implementado: `core/schemas/categories/createCategory.schema.ts`, `core/types/categories/category.types.ts`, `core/services/categories/createCategory.service.ts` (slug con sufijo numérico, reintento si otra petición ocupa el slug, traduce `23505` a `CONFLICT` y `42501` a `FORBIDDEN`) y `actions/categories/createCategory.action.ts` (exporta `createCategoryAction`)
- `logout` implementado: contrato `docs/contracts/auth/Contract_logout.md`, `core/services/auth/logout.service.ts` (+ `index.ts`) y `actions/auth/logout.action.ts` (exporta `logoutAction`, devuelve `ActionResult<null>`; sin schema porque no recibe datos). El botón `features/auth/components/logout-button.tsx` llama a la Action y, si sale bien, hace `router.push("/")` y `router.refresh()`
- `login` separado del componente: contrato `docs/contracts/auth/Contract_login.md`, resumen `docs/contracts/auth/Contract_auth.md`, `core/schemas/auth/login.schema.ts` (+ `index.ts`), `core/types/auth/auth.types.ts`, `core/services/auth/login.service.ts` (+ exportación en `index.ts`) y `actions/auth/login.action.ts` (exporta `loginAction`). Zod valida email y contraseña; el Servicio traduce credenciales inválidas a `UNAUTHORIZED` y otras fallas a `INTERNAL_ERROR`. El formulario ya llama a la Action y conserva `form.reset()` y la navegación a `/admin` en caso de éxito
- Convenciones de librerías: en Zod 4 usar `z.flattenError(error).fieldErrors` y `{ error: "..." }` en los mensajes; en React 19 tipar el submit con `SubmitEvent<HTMLFormElement>` (importado de `react`), no `FormEvent` (deprecado)
- **`cacheComponents` conserva el estado de las páginas ya visitadas** (quedan ocultas, no se desmontan). En formularios, al terminar con éxito hay que apagar `pending` y limpiar los campos (`form.reset()`, guardando antes `const form = event.currentTarget`, porque tras un `await` es `null`); si no, al volver a la pantalla aparece cargada y "cargando". Evitar también `new Date()` en Server Components (puede romper el build con `cacheComponents`)
- Caché de tipos: si se borra o mueve un `page.tsx`, `pnpm check` puede fallar con `.next/dev/types/validator.ts` referenciando el archivo viejo. Solución: parar `pnpm dev`, borrar `.next` y volver a correr
- Rutas y layouts (`src/app/`):
  - `page.tsx` → `/` pública; header con botón **Login** (`components/layout/public-header.tsx`) hacia `/login`
  - `(auth)/login/page.tsx` → `/login`
  - `(dashboard)/layout.tsx` → pantallas con sesión; header `components/layout/site-header.tsx` (marca hacia `/admin`, enlace "Crear categoría" y botón "Salir")
  - `(dashboard)/admin/page.tsx` → `/admin`: "Hola ADMINISTRADOR" (texto fijo por ahora, ver decisiones abiertas)
  - `(dashboard)/categories/new/page.tsx` → formulario de `createCategory`
  - `api/categories/route.ts` → `GET /api/categories`, usa `listCategoriesAction`
  - No existen todavía la pantalla `/categories`, ni los Route Handlers `POST /api/categories`, `GET /api/categories/:id` o `PATCH /api/categories/:id`
  - Solo puede haber un `page.tsx` por ruta: si dos grupos resuelven a la misma ruta, el build falla ("two parallel pages")
- Estilos: `globals.css` mínimo (Tailwind, fuente del sistema, tablas legibles y números con `tabular-nums`); `layout.tsx` raíz con `lang="es"` y metadata de `restoDev`. La guía `docs/Guia_front.md` todavía no existe; hay `TODO(front)` en `globals.css` y `layout.tsx`
- Boilerplate de `create-next-app` eliminado (`page.tsx`, estilos, `public/*.svg`); se conserva `src/app/favicon.ico`
- Login: `src/app/(auth)/login/page.tsx` + `src/features/auth/components/login-form.tsx`. El formulario llama a `loginAction` y ya no ejecuta `signInWithPassword` en el navegador. Tras el éxito apaga `pending`, hace `form.reset()` y `router.replace("/admin")` + `router.refresh()`
- Formulario `src/app/(dashboard)/categories/new/page.tsx` + `src/features/categories/components/category-form.tsx`: usa `noValidate` para que valide el servidor; campo vacío = no enviado (`icon_name` → `null`, `display_order` → se omite)

## Docs existentes (`docs/`)

- Guías raíz: `Stack_restoDev.md`, `Estructura_de_carpetas.md`, `Convenciones_de_archivos.md`, `Contratos_de_actions.md`, `Reglas_de_negocio.md`, `Guia_de_desarrollo_de_funcionalidades.md` y `Git_workflow.md`.
- Plan en curso: `Plan_identidad_y_permisos.md` (identidad, roles, permisos y auditoría; fases P y F0–F5, decisiones y matriz de pruebas).
- Contratos: `Contract_template.md`, `Contract_errors.md`, `auth/Contract_auth.md`, `auth/Contract_login.md`, `auth/Contract_logout.md` y `categories/Contract_categories.md` más las fichas `Contract_createCategory.md`, `Contract_getCategory.md`, `Contract_listCategories.md` y `Contract_updateCategory.md` (y `Contract_deleteCategory.md`, ver estado en el plan, tarea P.2).
- Base de datos: `database/supabase-cli.md`, `database/model/Model_template.md`, `Model_category.md` y los modelos de la Fase 0: `Model_profile.md`, `Model_role.md`, `Model_permission.md`, `Model_role_permission.md`, `Model_user_role.md` y `Model_audit_log.md` (todavía sin migración). Diseño de referencia: `database/DER_identidad_acceso_auditoria.html`.
- Historias: `historias_de_usuario/HU_template.md` y HU de crear, obtener, listar, actualizar y eliminar categorías.

## Estado

- [x] Next.js instalado y `pnpm-lock.yaml` regenerado bajo la política de supply-chain
- [x] `typecheck` y `lint` pasan
- [x] Documentación inicial en `docs/`
- [x] Zod instalado
- [x] `.gitignore` alineado con `Git_workflow.md`
- [x] `tsconfig.json` verificado (`strict`, `erasableSyntaxOnly`, alias `@/*`)
- [x] Prettier instalado, configurado y aplicado a todo el repo (`format:check` en verde)
- [x] Husky y lint-staged instalados y configurados
- [x] Hook `pre-commit` (lint-staged + typecheck) configurado y probado con archivos reales
- [x] Docs actualizados con los cambios del setup (`Stack_restoDev`, `Git_workflow`, `Estructura_de_carpetas`)
- [x] Scripts `check` y `check:full` agregados y verificados (`build` en verde)
- [x] Setup mergeado en `develop` (PR de `chore/project-setup`, squash)
- [x] Supabase CLI instalada como devDependency y habilitada en `allowBuilds`
- [x] `supabase/` inicializada y proyecto de pruebas (base nueva) vinculado
- [x] Usuario de pruebas creado en Supabase Auth
- [x] `database.types.ts` regenerado desde la base real
- [x] Guía `docs/database/supabase-cli.md`
- [x] PR de `chore/supabase-cli-setup` mergeado en `develop`
- [x] `.env.example` y validación de variables de entorno con Zod (`src/lib/env.ts`)
- [x] `@supabase/supabase-js` y `@supabase/ssr` instalados; clientes `client.ts` y `server.ts`
- [x] `proxy.ts` + `lib/supabase/middleware.ts` (refresco de sesión y redirección a `/login`, verificado)
- [x] `docs/Estructura_de_carpetas.md` actualizado (`middleware.ts` → `proxy.ts`)
- [x] Contrato `docs/contracts/categories/Contract_createCategory.md` escrito
- [x] Migración de `categories` aplicada al proyecto de pruebas, con RLS activo y política provisoria; `database.types.ts` regenerado
- [x] `src/core/types/action-result.ts` (`ActionResult`, `ErrorCode`, `FieldErrors`) y `docs/contracts/Contract_errors.md`
- [x] Schema, tipos, servicio, `ServiceError` y action de `createCategory`
- [x] Resumen `docs/contracts/categories/Contract_categories.md` (entidad + tabla de Actions)
- [x] Nota de política RLS provisoria en `docs/database/model/Model_category.md` y en `Contract_createCategory.md`
- [x] Página `/login` mínima (temporal), con cookies de sesión verificadas
- [x] Formulario `/categories/new` para probar `createCategory`
- [x] Migración `grant_categories_privileges` (causa del `INTERNAL_ERROR`) y documentación del GRANT
- [x] PR de `chore/env-validation`, login y `createCategory` aceptados y mergeados en `develop`
- [x] Boilerplate de `create-next-app` eliminado y estilos globales mínimos
- [x] Layout base (header, navegación, footer)
- [x] Home pública `/` con botón Login y pantalla `/admin` ("Hola ADMINISTRADOR") con acceso a crear categoría
- [x] `proxy.ts`: `/` pública (comparación exacta) y redirección a `/admin` con sesión
- [x] Contrato e implementación de `logout` (servicio, action y botón "Salir")
- [x] Arreglo del formulario de login (estado conservado por `cacheComponents`)
- [x] Actions, schemas, tipos y servicios de `getCategory`, `listCategories` y `updateCategory`
- [x] Route Handler `GET /api/categories` conectado a `listCategoriesAction`
- [x] Contratos y HU actualizados para las operaciones implementadas de `categories`
- [x] Pruebas manuales de `createCategory` realizadas por el usuario; reporta que funcionan correctamente
- [ ] Registrar qué casos individuales se probaron (conflicto, colisión de slug, validaciones, `UNAUTHORIZED`)
- [x] PRs anteriores de setup, Supabase, entorno, login y `createCategory` completados y mergeados en `develop`
- [x] `pnpm run check:full` ejecutado y aprobado el 2026-11-20 (`format:check`, `lint`, `typecheck` y `build`)
- [x] `docs/Estructura_de_carpetas.md` sincronizado con los archivos actuales del proyecto
- [x] `deleteCategory` implementado y mergeado en `develop` (Action, schema, Servicio y contrato)
- [ ] Sincronizar la documentación de `deleteCategory` (`Estructura_de_carpetas.md`, HU-CAT-005, `Contract_categories.md`); es la tarea P.2 del plan
- [x] Fase 0 del plan de identidad: decisiones D1–D11 confirmadas, 6 modelos, DER corregido, reglas de negocio, convenciones y stack actualizados (falta el PR de documentación)
- [ ] Definir e implementar la protección de la baja frente a productos activos cuando exista la tabla `products`
- [ ] Crear `docs/Guia_front.md` si se mantiene como entregable; el archivo todavía no existe

## Próximos pasos

1. Abrir y mergear el PR de la Fase 0 (`docs/identity-access-design`).
2. Completar P.2 del plan: sincronizar la documentación de `deleteCategory`.
3. Fase 1 (`feature/identity-profiles`): tabla `profiles`, trigger de alta y backfill. Ver `docs/Plan_identidad_y_permisos.md`.
4. Fases 2 a 5 del plan: roles y permisos, migración de `categories`, auditoría y protecciones.
5. Diseñar la migración de `products` y el mecanismo en base de datos que impida dar de baja categorías con productos activos; incluir RLS, políticas y GRANT. No dar por resuelta esa regla mientras `products` no exista.
6. Completar la interfaz de listado/detalle/edición de categorías cuando se defina su alcance.
7. Crear `docs/Guia_front.md` y evaluar las herramientas de Front cuando se retome ese trabajo.

## Decisiones abiertas

- ESLint 9.39.5 aparece como deprecado (existe 10.14.0). Evaluar migrar cuando `eslint-config-next` lo soporte
- Modelo de auth y roles: decidido en la Fase 0 (ver `docs/Plan_identidad_y_permisos.md`, sección 5) y documentado en los `Model_*`; falta implementarlo (Fases 1 a 5). Se cierra al completar la Fase 3
- `/admin` dice "Hola ADMINISTRADOR" de forma fija: hoy cualquier usuario con sesión lo ve y el `proxy.ts` solo comprueba que haya sesión. Se corrige en la Fase 3 (nombre del perfil y `admin.access` en layout o página)
- Política RLS de `categories` provisoria (`to authenticated`, lectura y escritura), contraria a lo que dice `docs/database/model/Model_category.md`; se reemplaza por políticas basadas en permisos en la Fase 3. Las Actions llevan `TODO(roles)` donde irá la verificación de permiso. Hoy `createCategory` no devuelve `FORBIDDEN` por permiso
- Permisos (GRANT): regla vigente = GRANT explícito por tabla, mínimo necesario, sin `DELETE` en tablas con baja lógica y sin permisos para `anon`. `service_role` no tiene permisos; se usará en la Fase 5 solo para la API de administración de Auth (decisión D5); revisar entonces si hace falta algún GRANT
- La regla "no dar de baja una categoría con productos activos" debe validarse en la base (no solo en la UI). `products` todavía no existe, así que hay que diseñar la protección junto con su modelo y migración
- El registro en `audit_logs` queda pendiente hasta la Fase 4 (decisión D9: sin purga por ahora)
- Fase 1: definir dónde viaja la marca de invitación del alta (conviene `raw_app_meta_data`) y confirmar que el registro público de Auth está desactivado (D7)
- El modelo y el contrato de `categories` documentan límites de `name` (2–80) e `icon_name` (1–50), aplicados también mediante constraints; mantenerlos alineados si cambian
- Nombre de las Actions: el código exporta `createCategoryAction` y `logoutAction`, pero las fichas y los diagramas dicen `createCategory(input)` y `logout`. Alinear las fichas (o los nombres) para que no queden desfasados
- El login ya usa el flujo "Server Actions → Servicios"; las otras funcionalidades de `auth` siguen pendientes
- La navegación del header solo tiene "Crear categoría" y "Salir"; se amplía a medida que existan pantallas (lo define Front)

## Registro de cambios

| Fecha      | Cambio                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-10 | Archivo creado                                                                                                                                           |
| 2026-11-10 | Setup de calidad: Prettier, Husky, lint-staged; `.gitignore` ajustado                                                                                    |
| 2026-11-10 | Setup commiteado en `chore/project-setup`; PR abierto hacia `develop`                                                                                    |
| 2026-11-10 | Scripts `check` y `check:full`; docs actualizados con el setup de calidad                                                                                |
| 2026-11-12 | PR de `chore/project-setup` aprobado y mergeado en `develop`                                                                                             |
| 2026-11-12 | Supabase CLI instalada, proyecto vinculado, usuario de pruebas creado y tipos regenerados                                                                |
| 2026-11-12 | Guía `docs/database/supabase-cli.md`; PR de `chore/supabase-cli-setup` aprobado y mergeado en `develop`                                                  |
| 2026-11-13 | Contrato `createCategory` escrito                                                                                                                        |
| 2026-11-14 | `.env.example` y validación de variables con Zod; clientes Supabase y `proxy.ts` (rama `chore/env-validation`)                                           |
| 2026-11-14 | Migración de `categories` con RLS provisoria aplicada con `db push --remote`; tipos regenerados                                                          |
| 2026-11-14 | `ActionResult`, `ErrorCode` y catálogo `docs/contracts/Contract_errors.md`                                                                               |
| 2026-11-14 | Schema, tipos, servicio, `ServiceError` y action de `createCategory`; resumen del módulo y nota de RLS                                                   |
| 2026-11-14 | Página `/login` mínima (temporal) y formulario `/categories/new`                                                                                         |
| 2026-11-14 | `INTERNAL_ERROR` al crear categorías: faltaba GRANT. Migración `grant_categories_privileges` y regla documentada                                         |
| 2026-11-16 | PR de `chore/env-validation`, login y `createCategory` aceptados y mergeados en `develop`                                                                |
| 2026-11-16 | Boilerplate eliminado, estilos globales mínimos y layout base; la guía Front quedó pendiente                                                             |
| 2026-11-16 | Home pública `/`, pantalla `/admin` y `proxy.ts` actualizado (`/` pública, redirección a `/admin` con sesión)                                            |
| 2026-11-16 | Logout: contrato, servicio, action y botón "Salir"                                                                                                       |
| 2026-11-16 | Login: se limpia el formulario y `pending` tras el éxito (estado conservado por `cacheComponents`)                                                       |
| 2026-11-16 | Estado actualizado: rama actual, pruebas manuales reportadas y documentación pendiente verificada                                                        |
| 2026-11-17 | Login separado: contrato `docs/contracts/auth/Contract_login.md`, schema Zod, tipos, servicio y Server Action                                            |
| 2026-11-17 | Resumen de contratos `docs/contracts/auth/Contract_auth.md` agregado y documentación obsoleta del login temporal corregida                               |
| 2026-11-17 | `pnpm check:full` aprobado para el login separado; cambios integrados en `develop` mediante PR                                                           |
| 2026-11-20 | PRs anteriores confirmados como completados; estado sincronizado con `get/list/updateCategory` y `GET /api/categories`; `deleteCategory` sigue pendiente |
| 2026-11-20 | Referencias de documentación con prefijos `HU_`, `Contract_` y `Model_` sincronizadas                                                                    |
| 2026-11-20 | `deleteCategory` mergeada en `develop`; Fase 0 del plan de identidad y permisos completa a falta del PR (`docs/Plan_identidad_y_permisos.md`)            |
