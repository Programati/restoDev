# PROGRESO

> Leer este archivo al inicio de cada chat. Reglas y convenciones detalladas en `docs/` y `AGENTS.md`.
> Última actualización: 2026-11-12

## Proyecto

- **Nombre:** resto-app (`restoDev`)
- **Rama actual:** `chore/supabase-cli-setup` (base: `develop`) — PR abierto, en revisión
- **Gestor:** pnpm 12.11.2 · Node 24.22.1

## Stack

| Área                                     | Versión                        |
| ---------------------------------------- | ------------------------------ |
| Next.js (App Router, `src/`)             | 16.4.5                         |
| React                                    | 19.3.0                         |
| TypeScript (strict)                      | 5.9.3                          |
| Tailwind (vía `@tailwindcss/turbopack`)  | 4.3.5                          |
| Zod                                      | 4.6.7                          |
| ESLint + `eslint-config-next`            | 9.39.5 / 16.4.5                |
| Prettier + `prettier-plugin-tailwindcss` | 3.9.10 / 0.8.1                 |
| Husky                                    | 9.1.7                          |
| lint-staged                              | 17.6.0                         |
| Supabase CLI (devDependency)             | versión exacta en package.json |

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
- Supabase: CLI se usa siempre con `pnpm exec supabase <comando>`; proyecto de pruebas vinculado (`supabase link`); el esquema se tipa con `supabase gen types typescript --linked > src/core/types/database.types.ts`

## Docs existentes (`docs/`)

`Stack_restoDev` · `Estructura_de_carpetas` · `Convenciones_de_archivos` · `Contratos_de_actions` · `Reglas_de_negocio` · `Git_workflow` · `contracts/` (`_template`, `errors`, `users/`) · `database/` (`supabase-cli`)

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
- [x] `database.types.ts` regenerado desde la base real (reemplaza el modelo de referencia)
- [x] Guía `docs/database/supabase-cli.md`
- [x] PR de `chore/supabase-cli-setup` abierto hacia `develop` (en revisión)
- [ ] `.env.example` y validación de variables de entorno con Zod
- [ ] Boilerplate de `create-next-app` sin limpiar

## Próximos pasos

1. Esperar aprobación y merge del PR de `chore/supabase-cli-setup` (squash); luego `git switch develop && git pull`
2. Crear la rama `docs/products-model` desde `develop` y escribir `docs/database/modelo/products.md` (tabla, campos, constraints, índices, RLS)
3. Crear la tabla `products` con una migración en `supabase/migrations/` y política RLS provisoria `to authenticated`; regenerar `database.types.ts` en el mismo PR
4. Crear `.env.example` (sin valores reales) y validar variables de entorno con Zod (`src/lib/env.ts`) en `chore/env-validation`
5. Limpiar boilerplate: `src/app/page.tsx`, `globals.css`, `public/*.svg` (en rama nueva desde `develop`)
6. Crear estructura de `src/` según `docs/Estructura_de_carpetas.md`
7. Escribir los contratos de `products` en `docs/contracts/products/` con `_template.md`
8. Implementar el CRUD de `products` (schema Zod, servicio y action) siguiendo `docs/Contratos_de_actions.md`, probándolo con el usuario de pruebas
9. Agregar CI en PRs: `format:check` + `lint` + `typecheck` + `build` (los mismos comandos de `pnpm check:full`)
10. Agregar tests (Vitest) cuando exista lógica de negocio y sumarlos a `check`
11. Planificar auth y roles (ver decisiones abiertas) antes de implementar los contratos de `users`

## Decisiones abiertas

- ESLint 9.39.5 aparece como deprecado (existe 10.14.0). Evaluar migrar cuando `eslint-config-next` lo soporte
- Borrar `docs/contracts/users/createUserOLD.md` y otros archivos obsoletos de `docs/contracts/`
- Modelo de auth y roles: `docs/contracts/users/` pone `role` dentro de `profiles` (`admin | staff | client`), pero las reglas de negocio mencionan más roles (cajero, mesero, delivery). Decidir entre rol simple en `profiles` o RBAC con tablas de roles y permisos. Se posterga hasta después del CRUD de `products`
- Mientras no exista el modelo de roles, las políticas RLS de `products` son provisorias (`to authenticated`) y hay que reemplazarlas al definir el auth

## Registro de cambios

| Fecha      | Cambio                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 2026-11-10 | Archivo creado                                                                                 |
| 2026-11-10 | Setup de calidad: Prettier, Husky, lint-staged; `.gitignore` ajustado                          |
| 2026-11-10 | Setup commiteado en `chore/project-setup`; PR abierto hacia `develop`                          |
| 2026-11-10 | Scripts `check` y `check:full`; docs actualizados con el setup de calidad                      |
| 2026-11-12 | PR de `chore/project-setup` aprobado y mergeado en `develop`                                   |
| 2026-11-12 | Supabase CLI instalada, proyecto vinculado, usuario de pruebas creado y tipos regenerados      |
| 2026-11-12 | Guía `docs/database/supabase-cli.md`; PR de `chore/supabase-cli-setup` abierto hacia `develop` |
