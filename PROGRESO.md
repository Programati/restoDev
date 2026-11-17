# PROGRESO

> Leer este archivo al inicio de cada chat. Reglas y convenciones detalladas en `docs/` y `AGENTS.md`.
> Última actualización: 2026-11-16

## Proyecto

- **Nombre:** resto-app (`restoDev`)
- **Rama actual:** `chore/clean-boilerplate` (base: `develop`)
- **Trabajo sin PR mergeado:** limpieza del boilerplate, layout base, home pública, `/admin`, logout y arreglo del formulario de login (todo en la rama actual, con commits separados)
- **Ya en `develop`:** `chore/env-validation` (variables de entorno, clientes Supabase, `proxy.ts`, `ActionResult`, migración de `categories`), login mínimo y `createCategory` (schema, servicio, action, formulario, migración de GRANT)
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
- **GRANT obligatorio en cada tabla:** las tablas creadas por migración no reciben permisos para `anon`, `authenticated` ni `service_role` (solo `REFERENCES`, `TRIGGER`, `TRUNCATE`). Sin `GRANT`, RLS no llega a evaluarse y toda consulta falla con `42501` (los Servicios lo reportan como `INTERNAL_ERROR`). Cada migración que crea una tabla incluye RLS, políticas y `GRANT` (sin `DELETE` en tablas con baja lógica). Detalle en `docs/database/supabase-cli.md`
- Variables de entorno: `.env` (no versionado) y `.env.example` (versionado, sin valores). Variables actuales: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Se validan con Zod en `src/lib/env.ts`; las variables se leen por su nombre completo (Next.js solo reemplaza referencias explícitas a `process.env.NOMBRE`)
- Clientes Supabase: `src/lib/supabase/client.ts` (navegador) y `server.ts` (servidor, con cookies; `createClient()` se ejecuta por petición, nunca como constante global)
- `src/proxy.ts` (Next.js 16 renombró `middleware.ts` a `proxy.ts`): llama a `updateSession` de `src/lib/supabase/middleware.ts`; refresca la sesión. Sin sesión redirige a `/login` en rutas privadas; `/` es pública (comparación **exacta**, no con `startsWith`, o todo quedaría público) y `/login` está en `PUBLIC_PATHS`. Con sesión, `/` y `/login` redirigen a `/admin`. Los redirects conservan las cookies de sesión refrescadas. Excluye `/api` del matcher. Es solo comodidad de navegación: la seguridad real va dentro de cada Action (`auth.getUser()`)
- Server Actions se tratan como endpoints públicos: cada una verifica sesión y permisos por sí misma, y recibe `input: unknown` que valida con Zod
- Errores de servicio: `src/lib/errors.ts` (`ServiceError` con `code: ErrorCode`). Los Servicios lanzan `ServiceError`; la Action lo convierte en `ActionResult`
- `categories`: constraints `categories_slug_key` y `categories_name_key` (verificadas). El servicio `createCategory` detecta la colisión de slug con `error.message.includes("slug")`: si se renombran las constraints, ajustarlo
- `createCategory` implementado: `core/schemas/categories/createCategory.schema.ts`, `core/types/categories/category.types.ts`, `core/services/categories/createCategory.service.ts` (slug con sufijo numérico, reintento si otra petición ocupa el slug, traduce `23505` a `CONFLICT` y `42501` a `FORBIDDEN`) y `actions/categories/createCategory.action.ts` (exporta `createCategoryAction`)
- `logout` implementado: contrato `docs/contracts/auth/logout.md`, `core/services/auth/logout.service.ts` (+ `index.ts`) y `actions/auth/logout.action.ts` (exporta `logoutAction`, devuelve `ActionResult<null>`; sin schema porque no recibe datos). El botón `features/auth/components/logout-button.tsx` llama a la Action y, si sale bien, hace `router.push("/")` y `router.refresh()`
- Convenciones de librerías: en Zod 4 usar `z.flattenError(error).fieldErrors` y `{ error: "..." }` en los mensajes; en React 19 tipar el submit con `SubmitEvent<HTMLFormElement>` (importado de `react`), no `FormEvent` (deprecado)
- **`cacheComponents` conserva el estado de las páginas ya visitadas** (quedan ocultas, no se desmontan). En formularios, al terminar con éxito hay que apagar `pending` y limpiar los campos (`form.reset()`, guardando antes `const form = event.currentTarget`, porque tras un `await` es `null`); si no, al volver a la pantalla aparece cargada y "cargando". Evitar también `new Date()` en Server Components (puede romper el build con `cacheComponents`)
- Caché de tipos: si se borra o mueve un `page.tsx`, `pnpm check` puede fallar con `.next/dev/types/validator.ts` referenciando el archivo viejo. Solución: parar `pnpm dev`, borrar `.next` y volver a correr
- Rutas y layouts (`src/app/`):
  - `(public)/layout.tsx` + `(public)/page.tsx` → `/` pública: "Bienvenido a restoDev" y "Usted aún no está logueado"; header con botón **Login** (`components/layout/public-header.tsx`) hacia `/login`
  - `(auth)/login/page.tsx` → `/login`
  - `(dashboard)/layout.tsx` → pantallas con sesión; header `components/layout/site-header.tsx` (marca hacia `/admin`, enlace "Crear categoría" y botón "Salir")
  - `(dashboard)/admin/page.tsx` → `/admin`: "Hola ADMINISTRADOR" (texto fijo por ahora, ver decisiones abiertas)
  - `(dashboard)/categories/new/page.tsx` → formulario de `createCategory`
  - Solo puede haber un `page.tsx` por ruta: si dos grupos resuelven a la misma ruta, el build falla ("two parallel pages")
- Estilos: `globals.css` mínimo (Tailwind, fuente del sistema, tablas legibles y números con `tabular-nums`); `layout.tsx` raíz con `lang="es"` y metadata de `restoDev`. La guía `docs/Guia_front.md` todavía no existe; hay `TODO(front)` en `globals.css` y `layout.tsx`
- Boilerplate de `create-next-app` eliminado (`page.tsx`, estilos, `public/*.svg`); se conserva `src/app/favicon.ico`
- Login **temporal**: `src/app/(auth)/login/page.tsx` + `src/features/auth/components/login-form.tsx`, con `signInWithPassword` desde el cliente de navegador (inputs no controlados, lee `FormData`). Tras el éxito apaga `pending`, hace `form.reset()` y `router.replace("/admin")` + `router.refresh()`. Marcado con `TODO(auth)`; se reemplaza por `login.action.ts` (contrato, schema y servicio) al armar el módulo auth
- Formulario `src/app/(dashboard)/categories/new/page.tsx` + `src/features/categories/components/category-form.tsx`: usa `noValidate` para que valide el servidor; campo vacío = no enviado (`icon_name` → `null`, `display_order` → se omite)

## Docs existentes (`docs/`)

`Stack_restoDev` · `Estructura_de_carpetas` · `Convenciones_de_archivos` · `Contratos_de_actions` · `Reglas_de_negocio` · `Git_workflow` · `contracts/` (`_template`, `errors`, `users/`, `categories/categories`, `categories/createCategory`, `auth/logout`) · `database/` (`supabase-cli` con la sección de GRANT, modelo de `categories`)

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
- [x] Contrato `docs/contracts/categories/createCategory.md` escrito
- [x] Migración de `categories` aplicada al proyecto de pruebas, con RLS activo y política provisoria; `database.types.ts` regenerado
- [x] `src/core/types/action-result.ts` (`ActionResult`, `ErrorCode`, `FieldErrors`) y `docs/contracts/errors.md`
- [x] Schema, tipos, servicio, `ServiceError` y action de `createCategory`
- [x] Resumen `docs/contracts/categories/categories.md` (entidad + tabla de Actions)
- [x] Nota de política RLS provisoria en `docs/database/modelo/categories.md` y en `createCategory.md`
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
- [x] Pruebas manuales de `createCategory` realizadas por el usuario; reporta que funcionan correctamente
- [ ] Registrar qué casos individuales se probaron (conflicto, colisión de slug, validaciones, `UNAUTHORIZED`)
- [ ] Abrir el PR de la rama actual hacia `develop`; correr `pnpm check:full` antes
- [ ] Actualizar `docs/Estructura_de_carpetas.md` con los grupos `(public)`, `(dashboard)/admin`, `components/layout/*`, `actions/auth`, `core/services/auth` y `features/auth`
- [ ] Crear `docs/Guia_front.md`; el archivo todavía no existe aunque se lo referencia como documentación del equipo de Front

## Próximos pasos

1. Abrir el PR de la rama actual hacia `develop` (squash): título que resuma los temas y descripción que liste cada uno. Correr `pnpm check:full` antes
2. Registrar los casos individuales cubiertos al probar `createCategory` y sus resultados
3. Resto del CRUD de `categories`: `listCategories` primero (hoy no hay forma de ver las categorías creadas ni pantalla `/categories`), luego `getCategory`, `updateCategory` y `deleteCategory` (baja lógica; necesita `products` para validar que no haya productos activos), cada uno con su contrato antes del código
4. Modelo y migración de `products` (con `category_id` apuntando a `categories`), **incluyendo RLS, políticas y GRANT en la misma migración**; contratos y CRUD
5. Módulo `auth`: contrato `login`, schema, servicio y action; reemplazar el login temporal (`TODO(auth)`)
6. Planificar auth y roles (ver decisiones abiertas): `profiles`, rol, función `is_admin()` y políticas RLS definitivas; que `/admin` solo se muestre a administradores
7. Front: crear `docs/Guia_front.md`, instalar y configurar shadcn/ui, `next-themes`, Sonner y TanStack Query, y reemplazar los estilos Tailwind planos de los formularios y los headers
8. Crear el resto de la estructura de `src/` según `docs/Estructura_de_carpetas.md`
9. Agregar CI en PRs: `format:check` + `lint` + `typecheck` + `build` (los mismos comandos de `pnpm check:full`)
10. Agregar tests (Vitest) cuando exista lógica de negocio y sumarlos a `check`

## Decisiones abiertas

- ESLint 9.39.5 aparece como deprecado (existe 10.14.0). Evaluar migrar cuando `eslint-config-next` lo soporte
- Borrar `docs/contracts/users/createUserOLD.md` y otros archivos obsoletos de `docs/contracts/`
- Modelo de auth y roles: `docs/contracts/users/` pone `role` dentro de `profiles` (`admin | staff | client`), pero las reglas de negocio mencionan más roles (cajero, mesero, delivery). Recomendación: rol simple en `profiles`, no RBAC; decidir si `staff` se abre en cajero/mesero/delivery. Se posterga hasta después del CRUD de `categories`
- `/admin` dice "Hola ADMINISTRADOR" de forma fija: hoy cualquier usuario con sesión lo ve y el `proxy.ts` solo comprueba que haya sesión. Se corrige al definir los roles
- Política RLS de `categories` provisoria (`to authenticated`, lectura y escritura), contraria a lo que dice `categories.md`; reemplazar por políticas que exijan rol admin al definir los roles. Las Actions llevan `TODO(roles)` donde irá la verificación de rol. Hoy `createCategory` no devuelve `FORBIDDEN` por rol
- Permisos (GRANT): regla vigente = GRANT explícito por tabla, mínimo necesario, sin `DELETE` en tablas con baja lógica y sin permisos para `anon`. `service_role` no tiene permisos; concederlos cuando exista un cliente que lo use
- La regla "no dar de baja una categoría con productos activos" debe validarse en la base (no solo en la UI): se resuelve al crear `products`
- El registro en `audit_logs` queda pendiente hasta definir el mecanismo de auditoría
- El contrato `createCategory` fija límites propios (`name` 2–80 caracteres, `icon_name` 1–50) que `categories.md` no define; confirmar o ajustar
- Nombre de las Actions: el código exporta `createCategoryAction` y `logoutAction`, pero las fichas y los diagramas dicen `createCategory(input)` y `logout`. Alinear las fichas (o los nombres) para que no queden desfasados
- Login temporal con el cliente de navegador se aparta del flujo "Server Actions → Servicios". Aceptado como atajo hasta armar el módulo `auth`
- La navegación del header solo tiene "Crear categoría" y "Salir"; se amplía a medida que existan pantallas (lo define Front)

## Registro de cambios

| Fecha      | Cambio                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 2026-11-10 | Archivo creado                                                                                                   |
| 2026-11-10 | Setup de calidad: Prettier, Husky, lint-staged; `.gitignore` ajustado                                            |
| 2026-11-10 | Setup commiteado en `chore/project-setup`; PR abierto hacia `develop`                                            |
| 2026-11-10 | Scripts `check` y `check:full`; docs actualizados con el setup de calidad                                        |
| 2026-11-12 | PR de `chore/project-setup` aprobado y mergeado en `develop`                                                     |
| 2026-11-12 | Supabase CLI instalada, proyecto vinculado, usuario de pruebas creado y tipos regenerados                        |
| 2026-11-12 | Guía `docs/database/supabase-cli.md`; PR de `chore/supabase-cli-setup` abierto hacia `develop`                   |
| 2026-11-13 | Contrato `createCategory` escrito                                                                                |
| 2026-11-14 | `.env.example` y validación de variables con Zod; clientes Supabase y `proxy.ts` (rama `chore/env-validation`)   |
| 2026-11-14 | Migración de `categories` con RLS provisoria aplicada con `db push --remote`; tipos regenerados                  |
| 2026-11-14 | `ActionResult`, `ErrorCode` y catálogo `docs/contracts/errors.md`                                                |
| 2026-11-14 | Schema, tipos, servicio, `ServiceError` y action de `createCategory`; resumen del módulo y nota de RLS           |
| 2026-11-14 | Página `/login` mínima (temporal) y formulario `/categories/new`                                                 |
| 2026-11-14 | `INTERNAL_ERROR` al crear categorías: faltaba GRANT. Migración `grant_categories_privileges` y regla documentada |
| 2026-11-16 | PR de `chore/env-validation`, login y `createCategory` aceptados y mergeados en `develop`                        |
| 2026-11-16 | Boilerplate eliminado, estilos globales mínimos, layout base y `docs/Guia_front.md`                              |
| 2026-11-16 | Home pública `/`, pantalla `/admin` y `proxy.ts` actualizado (`/` pública, redirección a `/admin` con sesión)    |
| 2026-11-16 | Logout: contrato, servicio, action y botón "Salir"                                                               |
| 2026-11-16 | Login: se limpia el formulario y `pending` tras el éxito (estado conservado por `cacheComponents`)               |
| 2026-11-16 | Estado actualizado: rama actual, pruebas manuales reportadas y documentación pendiente verificada                |
