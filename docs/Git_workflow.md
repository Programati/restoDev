# Convenciones de Git

## 1. Ramas principales

| Rama      | Rol                                                                  | Push directo | Se integra mediante                |
| --------- | -------------------------------------------------------------------- | ------------ | ---------------------------------- |
| `main`    | Código probado y aprobado, listo para producción (Vercel production) | No           | PR desde `develop` (merge commit)  |
| `develop` | Rama de integración y rama por defecto del repositorio (previews)    | No           | PR desde ramas de trabajo (squash) |

Reglas:

- No se commitea directamente en `main` ni en `develop`. Única excepción: el commit inicial del repositorio.
- `develop` salió de `main` y es la **rama por defecto**: los PR se abren contra ella y los clones nuevos arrancan en ella.
- Toda rama de trabajo se crea **desde `develop`** (excepto los hotfix, ver sección 6).
- Todo cambio entra por Pull Request, incluso trabajando en solitario.
- `develop` y `main` nunca se borran.

## 2. Nombres de ramas

Formato: `<tipo>/<descripcion-corta>`

| Tipo        | Cuándo se usa                                            | Ejemplo                                   |
| ----------- | -------------------------------------------------------- | ----------------------------------------- |
| `feature/`  | Nueva funcionalidad                                      | `feature/products-create-action`          |
| `fix/`      | Corrección de un error                                   | `fix/orders-cancel-already-cancelled-409` |
| `refactor/` | Reorganizar código sin cambiar su comportamiento         | `refactor/delivery-quote-into-service`    |
| `docs/`     | Documentación                                            | `docs/orders-create-contract`             |
| `test/`     | Agregar o mejorar pruebas de código ya existente         | `test/orders-payment-plan-sum-mismatch`   |
| `chore/`    | Configuración, dependencias, herramientas, mantenimiento | `chore/project-setup`                     |

Reglas:

- Minúsculas, palabras separadas por guiones (kebab-case), en inglés (coherente con el código).
- Nombre descriptivo y corto: debe decir qué se hace, no cuándo ni quién.
- Una rama = un propósito, de vida corta. Si hace falta otro propósito, otra rama.
- Una rama `test/` es para pruebas sobre código que ya existe.
- Antes de crear archivos nuevos para una funcionalidad o un paso nuevo, se crea su rama desde `develop`:

```
git switch develop
git pull
git switch -c <rama>
```

## 3. Mensajes de commit

Formato: `<tipo>(<alcance opcional>): <resumen en imperativo>`

Correspondencia entre rama y tipo de commit:

| Rama        | Tipo de commit |
| ----------- | -------------- |
| `feature/`  | `feat`         |
| `fix/`      | `fix`          |
| `refactor/` | `refactor`     |
| `docs/`     | `docs`         |
| `test/`     | `test`         |
| `chore/`    | `chore`        |

Reglas:

- Un commit = un cambio lógico. Si el resumen necesita "y", probablemente son dos commits.
- Si el motivo no es obvio, explicarlo en el cuerpo del commit (el "porqué", no el "qué") y en la sección de comentarios del PR.
- Husky ejecuta las validaciones en cada commit (pre-commit): primero `lint-staged` (ESLint con `--fix` y Prettier sobre los archivos en staging) y luego `pnpm run typecheck` sobre todo el proyecto. Si fallan, se corrige y se vuelve a commitear; no se saltea con `--no-verify`.

Ejemplos:

```
chore: initialize project with pnpm and typescript
feat(products): add createProduct action and service
fix(orders): return CONFLICT when cancelling an already cancelled order
refactor(delivery): move delivery quote calculation into service
test(orders): cover payment plan with cash and transfer sum mismatch
docs: add contract for createOrder action
```

## 4. Flujo de trabajo diario (rama de trabajo → `develop`)

1. Actualizar `develop` (`git switch develop && git pull`).
2. Crear la rama de trabajo desde `develop` (`git switch -c feature/products-create-action`).
3. Programar y commitear siguiendo la sección 3.
4. Antes de abrir el PR, traer lo último de `develop` a la rama (`git fetch` y `git rebase origin/develop`). Si ya se había subido la rama, se sube con `git push --force-with-lease`. Reescribir una rama propia y sin PR mergeado está permitido; el historial de `develop` y `main` nunca se reescribe.
5. Correr `pnpm run check:full` en verde (formato, lint, typecheck y build). Antes de levantar el servidor local alcanza con `pnpm run check`. Cuando existan tests, se suman a `check`.
6. Subir la rama y abrir el PR **hacia `develop`**.
   - Título con el formato de commit (ej. `feat(products): add createProduct action and service`).
   - Descripción: qué cambia, por qué, y cómo se verificó. Los detalles extra van en la sección de comentarios.
7. Otro colaborador revisa y aprueba. Los checks automáticos deben estar en verde.
8. Merge con **squash**: `develop` queda con un commit por cambio.
9. Borrar la rama de trabajo una vez integrada.
10. Todos actualizan su `develop` local (`git pull`).

## 5. Publicación (`develop` → `main`)

Cuando lo acumulado en `develop` está programado, probado y aprobado:

1. Abrir un PR de `develop` hacia `main` con título `release: <descripcion>` (ej. `release: orders and delivery assignments`).
2. En la descripción, listar los cambios incluidos y cómo se probó.
3. Revisión y aprobación de otro colaborador, con los checks en verde.
4. Merge con **merge commit**. **No** usar squash ni rebase en este PR: haría que `main` y `develop` tengan historias distintas para los mismos cambios y el siguiente release traería conflictos y commits duplicados.
5. **No borrar `develop`** después del merge (ignorar el botón de GitHub que ofrece borrar la rama).
6. Opcional: etiquetar el commit en `main` con un tag de versión (`git tag v1.2.0`).

Es normal que, tras el release, `main` tenga un commit de merge que `develop` no tiene. No genera conflictos.

## 6. Hotfix (error urgente en producción)

Si hay un error grave en `main` y `develop` tiene cambios que todavía no están listos para publicarse:

1. Crear la rama desde `main`: `git switch main && git pull && git switch -c fix/<descripcion>` (ej. `fix/orders-total-null-in-sales-ledger`).
2. Abrir PR hacia `main` con revisión y checks, y mergear.
3. Llevar el arreglo a `develop` con un PR de `main` hacia `develop` (merge commit), para no perderlo en el próximo release.

## 7. Protección de ramas

Configurar un Ruleset (o Branch protection) en **`main`** y **`develop`**:

- Requerir Pull Request antes de mergear (sin push directo).
- Requerir al menos 1 aprobación.
- Requerir checks en verde (format:check, lint, typecheck, build y tests) antes de mergear. Son los mismos comandos de `pnpm run check:full`, que el CI debe replicar.
- Bloquear force push.
- Bloquear el borrado de la rama.
- Aplicar las reglas también a administradores.

En Settings → General: activar "Automatically delete head branches" (borra las ramas de trabajo al mergear; `develop` queda protegida por la regla de no borrado) y habilitar los métodos de merge **squash** y **merge commit**.

## 8. Entornos

- `main` → despliegue de producción en Vercel.
- `develop` y ramas de trabajo → previews en Vercel.
- Las migraciones de `supabase/migrations/` viajan en el mismo PR que el código que las usa. Si cambia el esquema, se regenera `src/core/types/database.types.ts` en ese mismo PR.
- Las migraciones no se prueban contra la base de producción desde `develop`: usar un proyecto Supabase de pruebas o Supabase branching.

## 9. Qué se versiona y qué no

Archivo `.gitignore` mínimo:

```
node_modules/
.next/
dist/
.env
.env.local
.env*.local
!.env.example
.vercel/
*.log
coverage/
playwright-report/
test-results/
```

- Sí se versiona `pnpm-lock.yaml`.
- Nunca se versionan secretos ni credenciales (llaves de Supabase, SerpApi, WhatsApp Cloud API, claves VAPID). Para documentar variables de entorno se usa `.env.example` sin valores reales.
- Excepción: `!.env.example` se versiona siempre, para documentar las variables de entorno sin valores reales.

## 10. Primer arranque del repositorio (histórico)

1. `git init`, con `.gitignore` creado antes del primer commit.
2. Commit inicial en `main` (por ejemplo, `.gitignore` y `docs/`).
3. Se crea `develop` desde `main` y se configura como rama por defecto.
4. El trabajo de setup pasa por una rama `chore/project-setup` y su PR hacia `develop`.
