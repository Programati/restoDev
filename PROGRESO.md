# PROGRESO

> Leer este archivo al inicio de cada chat. Reglas y convenciones detalladas en `docs/` y `AGENTS.md`.
> Última actualización: 2026-11-10

## Proyecto

- **Nombre:** resto-app (`restoDev`)
- **Rama actual:** `chore/project-setup` (base: `develop`)
- **Gestor:** pnpm 12.11.2 · Node 24.22.1

## Stack

| Área                                     | Versión         |
| ---------------------------------------- | --------------- |
| Next.js (App Router, `src/`)             | 16.4.5          |
| React                                    | 19.3.0          |
| TypeScript (strict)                      | 5.9.3           |
| Tailwind (vía `@tailwindcss/turbopack`)  | 4.3.5           |
| Zod                                      | 4.6.7           |
| ESLint + `eslint-config-next`            | 9.39.5 / 16.4.5 |
| Prettier + `prettier-plugin-tailwindcss` | 3.9.10 / 0.8.1  |
| Husky                                    | 9.1.7           |
| lint-staged                              | 17.6.0          |

## Configuración clave

- `next.config.ts`: `cacheComponents`, `partialPrefetching`, `experimental.agentFeedback`
- `pnpm-workspace.yaml`: `minimumReleaseAge: 4320` (3 días), `saveExact: true`, `allowBuilds` con `sharp` y `unrs-resolver` en `false`
- `tsconfig.json`: `strict` y `erasableSyntaxOnly` activos
- Alias de imports: `@/*` → `./src/*`
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `check`, `check:full`, `prepare` (Husky)
- `.prettierrc`: sin `;`, comillas dobles, `trailingComma: all`, `printWidth: 100`, plugin de Tailwind
- `.prettierignore`: incluye `src/core/types/database.types.ts` (generado por Supabase) y `pnpm-lock.yaml`
- `.gitignore`: base de `create-next-app` + `/dist`, `*.log`, `/playwright-report/`, `/test-results/` y la excepción `!.env.example`
- `lint-staged.config.mjs`: `*.{ts,tsx,js,jsx,mjs}` → `eslint --fix` + `prettier --write`; `*.{json,md,css,yml,yaml}` → `prettier --write`
- `.husky/pre-commit`: `pnpm exec lint-staged` y luego `pnpm run typecheck`

## Docs existentes (`docs/`)

`Stack_restoDev` · `Estructura_de_carpetas` · `Convenciones_de_archivos` · `Contratos_de_actions` · `Reglas_de_negocio` · `Git_workflow` · `contracts/` (`_template`, `errors`, `users/`)

## Estado

- [x] Next.js instalado y `pnpm-lock.yaml` regenerado bajo la política de supply-chain
- [x] `typecheck` y `lint` pasan
- [x] Documentación inicial en `docs/`
- [x] Zod instalado
- [x] `.gitignore` alineado con `Git_workflow.md`
- [x] `tsconfig.json` verificado (`strict`, `erasableSyntaxOnly`, alias `@/*`)
- [x] Prettier instalado, configurado y aplicado a todo el repo (`format:check` en verde)
- [x] Husky y lint-staged instalados y configurados
- [x] Hook `pre-commit` (lint-staged + typecheck) configurado; probado con `lint-staged --all`
- [x] Prueba completa del hook con archivos reales en staging (al armar los commits)
- [x] Docs actualizados con los cambios del setup (`Stack_restoDev`, `Git_workflow`, `Estructura_de_carpetas`)
- [x] Setup commiteado y PR abierto hacia `develop` (en revisión)
- [x] Scripts `check` y `check:full` agregados y verificados (`build` en verde)
- [ ] `.env.example` y validación de variables de entorno con Zod
- [ ] Boilerplate de `create-next-app` sin limpiar

## Próximos pasos

1. Esperar aprobación y merge del PR de `chore/project-setup` (squash); luego `git switch develop && git pull`
2. Crear `.env.example` (sin valores reales) y validar variables de entorno con Zod (`src/lib/env.ts`) en `chore/env-validation`
3. Limpiar boilerplate: `src/app/page.tsx`, `globals.css`, `public/*.svg` (en rama nueva desde `develop`)
4. Crear estructura de `src/` según `docs/Estructura_de_carpetas.md`
5. Escribir el primer contrato en `docs/contracts/users/` con `_template.md`
6. Implementar la primera action con su schema Zod, siguiendo `docs/Contratos_de_actions.md`
7. Elegir e instalar la capa de datos según `docs/Stack_restoDev.md`
8. Agregar CI en PRs: `format:check` + `lint` + `typecheck` + `build` (los mismos comandos de `pnpm check:full`)
9. Agregar tests (Vitest) cuando exista lógica de negocio y sumarlos a `check`

## Decisiones abiertas

- ESLint 9.39.5 aparece como deprecado (existe 10.14.0). Evaluar migrar cuando `eslint-config-next` lo soporte
- Borrar `docs/contracts/users/createUserOLD.md` y otros archivos obsoletos de `docs/contracts/`

## Registro de cambios

| Fecha      | Cambio                                                                    |
| ---------- | ------------------------------------------------------------------------- |
| 2026-11-10 | Archivo creado                                                            |
| 2026-11-10 | Setup de calidad: Prettier, Husky, lint-staged; `.gitignore` ajustado     |
| 2026-11-10 | Setup commiteado en `chore/project-setup`; PR abierto hacia `develop`     |
| 2026-11-10 | Scripts `check` y `check:full`; docs actualizados con el setup de calidad |
