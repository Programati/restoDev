# PROGRESO

> Leer este archivo al inicio de cada chat. Reglas y convenciones detalladas en `docs/` y `AGENTS.md`.
> Última actualización: 2026-11-14

## Proyecto

- **Nombre:** resto-app (`restoDev`)
- **Rama actual:** `chore/env-validation` (base: `develop`) — trabajo acumulado en commits separados, PR todavía sin abrir
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
- `tsconfig.json`: `strict` y `erasableSyntaxOnly` activos
- Alias de imports: `@/*` → `./src/*`
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `check`, `check:full`, `prepare` (Husky)
- `.prettierrc`: sin `;`, comillas dobles, `trailingComma: all`, `printWidth: 100`, plugin de Tailwind
- `.prettierignore`: incluye `src/core/types/database.types.ts` (generado por Supabase) y `pnpm-lock.yaml`
- `.gitignore`: base de `create-next-app` + `/dist`, `*.log`, `/playwright-report/`, `/test-results/` y la excepción `!.env.example`; `supabase/.temp/` ignorado
- `lint-staged.config.mjs`: `*.{ts,tsx,js,jsx,mjs}` → `eslint --fix` + `prettier --write`; `*.{json,md,css,yml,yaml}` → `prettier --write`
- `.husky/pre-commit`: `pnpm exec lint-staged` y luego `pnpm run typecheck`
- Supabase: CLI se usa siempre con `pnpm exec supabase <comando>`; proyecto de pruebas `restoDevNew` vinculado (`supabase link`); el esquema se tipa con `supabase gen types typescript --linked > src/core/types/database.types.ts`
- Supabase CLI: `db push` apunta por defecto a una base local (necesita Docker); para aplicar migraciones al proyecto de pruebas en la nube usar `pnpm exec supabase db push --remote`
- Variables de entorno: `.env` (no versionado) y `.env.example` (versionado, sin valores). Variables actuales: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Se validan con Zod en `src/lib/env.ts`; las variables se leen por su nombre completo (Next.js solo reemplaza referencias explícitas a `process.env.NOMBRE`)
- Clientes Supabase: `src/lib/supabase/client.ts` (navegador) y `server.ts` (servidor, con cookies; `createClient()` se ejecuta por petición, nunca como constante global)
- `src/proxy.ts` (Next.js 16 renombró `middleware.ts` a `proxy.ts`): llama a `updateSession` de `src/lib/supabase/middleware.ts`; refresca la sesión y redirige a `/login` si no hay sesión (rutas públicas en `PUBLIC_PATHS`). Excluye `/api` del matcher. Es solo comodidad de navegación: la seguridad real va dentro de cada Action (`auth.getUser()`)
- Server Actions se tratan como endpoints públicos: cada una verifica sesión y permisos por sí misma

## Docs existentes (`docs/`)

`Stack_restoDev` · `Estructura_de_carpetas` · `Convenciones_de_archivos` · `Contratos_de_actions` · `Reglas_de_negocio` · `Git_workflow` · `contracts/` (`_template`, `errors`, `users/`, `categories/createCategory`) · `database/` (`supabase-cli`, modelo de `categories`)

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
- [ ] Abrir el PR de `chore/env-validation` hacia `develop` (corre `pnpm check:full` antes)
- [ ] Schema, servicio y action de `createCategory`
- [ ] Resumen `docs/contracts/categories/categories.md` (entidad + tabla de Actions)
- [ ] Nota de política RLS provisoria en `docs/database/modelo/categories.md` y en `createCategory.md`
- [ ] Boilerplate de `create-next-app` sin limpiar

## Próximos pasos

1. Abrir el PR de `chore/env-validation` hacia `develop` (squash) cuando se termine el schema, servicio y action de `createCategory`, o antes si se prefiere separar propósitos
2. Paso 10: `src/core/schemas/categories/createCategory.schema.ts` (un schema Zod por archivo, `index.ts` en la carpeta) y `src/core/types/categories/category.types.ts`
3. Paso 11: servicio `createCategory.service.ts` (genera el `slug` con sufijo numérico si colisiona, traduce la violación de unicidad a `CONFLICT`) y tipo `ServiceError` (probablemente en `lib/errors.ts`)
4. Paso 12: action `createCategory.action.ts`: `auth.getUser()` → Zod → servicio → `revalidatePath("/categories")`. Dejar el comentario `TODO(roles)` entre la sesión y la validación
5. Resumen del módulo `categories/categories.md` y nota de RLS provisoria en los docs
6. Probar `createCategory` con el usuario de pruebas
7. Resto del CRUD de `categories` (`getCategory`, `listCategories`, `updateCategory`, `deleteCategory` como baja lógica); la baja lógica necesita `products` para validar que no haya productos activos
8. Modelo y migración de `products` (con `category_id` apuntando a `categories`), contratos y CRUD
9. Planificar auth y roles (ver decisiones abiertas): `profiles`, rol, función `is_admin()` y políticas RLS definitivas
10. Limpiar boilerplate: `src/app/page.tsx`, `globals.css`, `public/*.svg` (en rama nueva desde `develop`)
11. Crear página `/login` (hoy el proxy redirige a una ruta que da 404)
12. Crear el resto de la estructura de `src/` según `docs/Estructura_de_carpetas.md`
13. Agregar CI en PRs: `format:check` + `lint` + `typecheck` + `build` (los mismos comandos de `pnpm check:full`)
14. Agregar tests (Vitest) cuando exista lógica de negocio y sumarlos a `check`

## Decisiones abiertas

- ESLint 9.39.5 aparece como deprecado (existe 10.14.0). Evaluar migrar cuando `eslint-config-next` lo soporte
- Borrar `docs/contracts/users/createUserOLD.md` y otros archivos obsoletos de `docs/contracts/`
- Modelo de auth y roles: `docs/contracts/users/` pone `role` dentro de `profiles` (`admin | staff | client`), pero las reglas de negocio mencionan más roles (cajero, mesero, delivery). Recomendación: rol simple en `profiles`, no RBAC; decidir si `staff` se abre en cajero/mesero/delivery. Se posterga hasta después del CRUD de `categories`
- Política RLS de `categories` provisoria (`to authenticated`, lectura y escritura), contraria a lo que dice `categories.md`; reemplazar por políticas que exijan rol admin al definir los roles. Las Actions llevan `TODO(roles)` donde irá la verificación de rol
- La regla "no dar de baja una categoría con productos activos" debe validarse en la base (no solo en la UI): se resuelve al crear `products`
- El registro en `audit_logs` queda pendiente hasta definir el mecanismo de auditoría
- El contrato `createCategory` fija límites propios (`name` 2–80 caracteres, `icon_name` 1–50) que `categories.md` no define; confirmar o ajustar

## Registro de cambios

| Fecha      | Cambio                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| 2026-11-10 | Archivo creado                                                                                                 |
| 2026-11-10 | Setup de calidad: Prettier, Husky, lint-staged; `.gitignore` ajustado                                          |
| 2026-11-10 | Setup commiteado en `chore/project-setup`; PR abierto hacia `develop`                                          |
| 2026-11-10 | Scripts `check` y `check:full`; docs actualizados con el setup de calidad                                      |
| 2026-11-12 | PR de `chore/project-setup` aprobado y mergeado en `develop`                                                   |
| 2026-11-12 | Supabase CLI instalada, proyecto vinculado, usuario de pruebas creado y tipos regenerados                      |
| 2026-11-12 | Guía `docs/database/supabase-cli.md`; PR de `chore/supabase-cli-setup` abierto hacia `develop`                 |
| 2026-11-13 | Contrato `createCategory` escrito                                                                              |
| 2026-11-14 | `.env.example` y validación de variables con Zod; clientes Supabase y `proxy.ts` (rama `chore/env-validation`) |
| 2026-11-14 | Migración de `categories` con RLS provisoria aplicada con `db push --remote`; tipos regenerados                |
| 2026-11-14 | `ActionResult`, `ErrorCode` y catálogo `docs/contracts/errors.md`                                              |
