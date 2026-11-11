# resto-app (restoDev)

Aplicación web para la gestión de un restaurante. Está construida con Next.js (App Router), TypeScript y Supabase.

> **Estado:** setup inicial del proyecto. Todavía no hay funcionalidades; la estructura de `src/` y la capa de datos se están incorporando por etapas. El avance detallado está en [`PROGRESO.md`](./PROGRESO.md).

## Requisitos

| Herramienta | Versión |
| ----------- | ------- |
| Node.js     | 24.x    |
| pnpm        | 12.x    |

Este proyecto usa **pnpm** como único gestor de paquetes.

## Puesta en marcha

```bash
# 1. Clonar el repositorio (la rama por defecto es develop)
git clone <url-del-repositorio>
cd restoDev

# 2. Instalar dependencias (también activa los hooks de Husky)
pnpm install

# 3. Levantar el servidor de desarrollo
pnpm dev
```

La app queda disponible en [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando             | Qué hace                                                                    |
| ------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`          | Servidor de desarrollo                                                      |
| `pnpm build`        | Build de producción                                                         |
| `pnpm start`        | Sirve el build de producción                                                |
| `pnpm lint`         | ESLint sobre todo el repo                                                   |
| `pnpm typecheck`    | Genera los tipos de rutas y corre `tsc --noEmit`                            |
| `pnpm format`       | Reformatea todo el repo con Prettier (**modifica archivos**)                |
| `pnpm format:check` | Verifica el formato sin modificar nada                                      |
| `pnpm check`        | `format:check` + `lint` + `typecheck`. Rápido; correrlo antes de `pnpm dev` |
| `pnpm check:full`   | `check` + `build`. Correrlo antes de abrir un Pull Request                  |

## Verificación del código

- **Antes de levantar el servidor:** `pnpm check`
- **Antes de abrir un PR:** `pnpm check:full`
- **En cada commit:** el hook de Husky corre `lint-staged` (ESLint y Prettier sobre los archivos en staging) y luego `pnpm typecheck`. Si falla, se corrige y se vuelve a commitear; no se usa `--no-verify`.

Si `format:check` falla, `pnpm format` lo corrige.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict, `erasableSyntaxOnly`) · Tailwind CSS 4 · Zod · ESLint · Prettier · Husky · lint-staged.

## Documentación

| Documento                                                                | Contenido                                   |
| ------------------------------------------------------------------------ | ------------------------------------------- |
| [`docs/Stack_restoDev.md`](./docs/Stack_restoDev.md)                     | Tecnologías del proyecto                    |
| [`docs/Estructura_de_carpetas.md`](./docs/Estructura_de_carpetas.md)     | Organización de carpetas                    |
| [`docs/Convenciones_de_archivos.md`](./docs/Convenciones_de_archivos.md) | Nombres y responsabilidades de los archivos |
| [`docs/Contratos_de_actions.md`](./docs/Contratos_de_actions.md)         | Cómo escribir el contrato de cada Action    |
| [`docs/Reglas_de_negocio.md`](./docs/Reglas_de_negocio.md)               | Reglas de negocio                           |
| [`docs/Git_workflow.md`](./docs/Git_workflow.md)                         | Ramas, commits, PR y publicación            |
