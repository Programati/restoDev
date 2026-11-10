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
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `prepare` (Husky)
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
- [ ] Prueba completa del hook con archivos reales en staging (al armar los commits)
- [ ] `.env.example` y validación de variables de entorno con Zod
- [ ] Actualizar `docs/Stack_restoDev.md`, `docs/Git_workflow.md` y `docs/Estructura_de_carpetas.md` con los cambios de este setup
- [ ] Setup sin commitear (todo untracked; modificados: `README.md` y `docs/` por el formato de Prettier)
- [ ] Boilerplate de `create-next-app` sin limpiar

## Próximos pasos

1. Crear `.env.example` (sin valores reales) y validar variables de entorno con Zod (`src/lib/env.ts`)
2. Actualizar los docs afectados: `Stack_restoDev.md` (lint-staged en Calidad), `Git_workflow.md` (`!.env.example` y qué corre el pre-commit) y `Estructura_de_carpetas.md` (`.prettierignore`, `lint-staged.config.mjs`)
3. Armar los commits del setup en grupos lógicos (por ejemplo: setup de Next/pnpm/TypeScript, Prettier/Husky/lint-staged, `style: format docs with prettier`) y abrir PR a `develop`
4. Limpiar boilerplate: `src/app/page.tsx`, `globals.css`, `public/*.svg` (en rama nueva desde `develop`)
5. Crear estructura de `src/` según `docs/Estructura_de_carpetas.md`
6. Escribir el primer contrato en `docs/contracts/users/` con `_template.md`
7. Implementar la primera action con su schema Zod, siguiendo `docs/Contratos_de_actions.md`
8. Elegir e instalar la capa de datos según `docs/Stack_restoDev.md`
9. Agregar CI en PRs: `typecheck` + `lint` + `build`
10. Agregar tests (Vitest) cuando exista lógica de negocio

## Decisiones abiertas

- ESLint 9.39.5 aparece como deprecado (existe 10.14.0). Evaluar migrar cuando `eslint-config-next` lo soporte
- Borrar `docs/contracts/users/createUserOLD.md` y otros archivos obsoletos de `docs/contracts/`

## Registro de cambios

| Fecha      | Cambio                                                                |
| ---------- | --------------------------------------------------------------------- |
| 2026-11-10 | Archivo creado                                                        |
| 2026-11-10 | Setup de calidad: Prettier, Husky, lint-staged; `.gitignore` ajustado |
