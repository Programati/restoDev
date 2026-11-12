# Supabase CLI: instalación, vinculación y usuario de pruebas

Guía para dejar el proyecto conectado a Supabase y con un usuario `admin` para probar el CRUD de `products`.

## 1. Alcance

- [ ] Instalar la CLI de Supabase como dependencia de desarrollo
- [ ] Iniciar la carpeta `supabase/` y vincular el proyecto remoto
- [ ] Crear un usuario de pruebas con rol `admin`
- [ ] Regenerar `src/core/types/database.types.ts` desde la CLI

> Usar un proyecto Supabase de pruebas, no el de producción (ver `Git_workflow.md`, sección 8).

## 2. Instalar la CLI

La CLI se instala por proyecto, no global, para que todos usen la misma versión.

```
pnpm add -D --save-exact supabase
```

Se ejecuta siempre con `pnpm exec supabase <comando>`.

### Scripts de build bloqueados

El paquete `supabase` descarga su binario en un script de instalación. `pnpm-workspace.yaml` bloquea esos scripts por defecto (`allowBuilds`). Habilitar solo este paquete:

```yaml
allowBuilds:
  sharp: false
  unrs-resolver: false
  supabase: true
```

Si ya se instaló y el binario no se descargó, reinstalar con `pnpm install` luego del cambio.

### Verificar

```
pnpm exec supabase --version
```

### Política de antigüedad

`minimumReleaseAge: 4320` (3 días) puede impedir instalar una versión recién publicada. Si pnpm rechaza la versión, esperar o fijar la versión anterior más reciente.

## 3. Iniciar sesión

```
pnpm exec supabase login
```

Abre el navegador para autorizar. El token queda guardado en el equipo; no se versiona.

Alternativa (CI): variable de entorno `SUPABASE_ACCESS_TOKEN`. Nunca en el repositorio.

## 4. Iniciar y vincular el proyecto

1. Iniciar la carpeta `supabase/` (crea `config.toml`; las migraciones ya existentes se conservan):

```
pnpm exec supabase init
```

2. Ver los proyectos disponibles y copiar el `Reference ID` del de pruebas:

```
pnpm exec supabase projects list
```

3. Vincular:

```
pnpm exec supabase link --project-ref <PROJECT_REF>
```

Pide la contraseña de la base de datos (la definida al crear el proyecto). No se guarda en el repositorio.

4. Traer el esquema remoto como migración, solo si la base ya tiene tablas que no están en `supabase/migrations/`:

```
pnpm exec supabase db pull
```

### Qué se versiona

| Archivo / carpeta      | ¿Se versiona? |
| ---------------------- | ------------- |
| `supabase/config.toml` | Sí            |
| `supabase/migrations/` | Sí            |
| `supabase/.temp/`      | No            |
| `supabase/.env*`       | No            |

Agregar `supabase/.temp/` al `.gitignore` si no está.

## 5. Crear el usuario de pruebas

Dos pasos: crear el usuario en Auth y asignarle el rol `admin`.

### 5.1 Crear el usuario en Auth

En el panel de Supabase: **Authentication → Users → Add user → Create new user**.

| Campo             | Valor                        |
| ----------------- | ---------------------------- |
| Email             | `admin@resto.test` (ejemplo) |
| Password          | una contraseña de desarrollo |
| Auto Confirm User | activado                     |

## 6. Regenerar tipos

Cada vez que cambie el esquema:

```
pnpm exec supabase gen types typescript --linked > src/core/types/database.types.ts
```

El archivo está en `.prettierignore`. Si el esquema cambió, el cambio de tipos va en el mismo PR que la migración.

## 7. Comandos de uso frecuente

| Comando                                     | Para qué                                             |
| ------------------------------------------- | ---------------------------------------------------- |
| `pnpm exec supabase migration new <nombre>` | Crear una migración vacía en `supabase/migrations/`  |
| `pnpm exec supabase db push`                | Aplicar migraciones pendientes al proyecto vinculado |
| `pnpm exec supabase db pull`                | Traer cambios hechos en el panel como migración      |
| `pnpm exec supabase migration list`         | Comparar migraciones locales y remotas               |

## 8. Checklist de cierre

- [ ] `pnpm exec supabase --version` responde
- [ ] `supabase link` exitoso contra el proyecto de pruebas
- [ ] Usuario de pruebas creado en Auth
- [ ] `database.types.ts` regenerado y sin errores de `pnpm run typecheck`
- [ ] `supabase/.temp/` ignorado por Git
