# Supabase CLI: instalación, vinculación, usuario de pruebas y administración de acceso

Guía para dejar el proyecto conectado a Supabase, aplicar migraciones, regenerar tipos y crear el primer usuario `admin` de cada entorno.

## 1. Alcance

- [x] Instalar la CLI de Supabase como dependencia de desarrollo
- [x] Iniciar la carpeta `supabase/` y vincular el proyecto remoto
- [x] Crear un usuario de pruebas y asignarle el rol `admin`
- [x] Regenerar `src/core/types/database.types.ts` desde la CLI

> Usar un proyecto Supabase de pruebas, no el de producción (ver `Git_workflow.md`, sección 8). El CLI etiqueta como `production` la rama principal de cualquier proyecto (incluido el de pruebas `restoDevNew`); esa etiqueta no indica que sea el proyecto de producción real.

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

## 5. Aplicar migraciones

`db push` apunta por defecto a una base local (necesita Docker). Para aplicar al proyecto de pruebas en la nube se usa `--remote`, y conviene mirar antes qué va a aplicar:

```
pnpm exec supabase db push --remote --dry-run
pnpm exec supabase db push --remote
```

Se aplican todas las migraciones pendientes, en orden de timestamp. Crear cada migración con `pnpm exec supabase migration new <nombre>` (genera el timestamp) y pegar el SQL; no copiar archivos con nombres inventados. Una migración nueva por cambio: no se edita una ya aplicada.

## 6. Usuarios de prueba y primer administrador

Las migraciones siembran roles y permisos, **no usuarios**: cada entorno tiene los suyos. Por eso el primer administrador se asigna a mano, una vez por entorno.

### 6.1 Crear el usuario en Auth

En el panel de Supabase: **Authentication → Users → Add user → Create new user**.

| Campo             | Valor                        |
| ----------------- | ---------------------------- |
| Email             | `admin@resto.test` (ejemplo) |
| Password          | una contraseña de desarrollo |
| Auto Confirm User | activado                     |

Un trigger crea su perfil (`profiles`) automáticamente con estado `active`. Si el usuario ya existía antes de la migración `create_profiles`, la migración `backfill_profiles` le creó el perfil.

### 6.2 Asignar el rol `admin` (D8)

Con el usuario creado y las migraciones de la Fase 2 aplicadas, correr en el **SQL Editor** (cambiar el email):

```sql
insert into public.user_roles (user_id, role_id)
select u.id, r.id
from auth.users u
cross join public.roles r
where u.email = 'admin@resto.test'
  and r.code = 'admin'
on conflict do nothing;
```

Comprobar que tiene los 6 permisos del catálogo:

```sql
select u.email, r.code as rol, rp.permission_code
from auth.users u
join public.user_roles ur on ur.user_id = u.id
join public.roles r on r.id = ur.role_id
join public.role_permissions rp on rp.role_id = r.id
where u.email = 'admin@resto.test'
order by rp.permission_code;
```

Resultado esperado: `admin.access`, `audit.read`, `categories.manage`, `categories.read`, `roles.manage` y `users.manage`. Esta asignación se hace con el rol `postgres` del SQL Editor, que no pasa por RLS ni por `GRANT`; desde la API nadie puede hacerla (no hay escritura directa sobre `user_roles`).

## 7. Regenerar tipos

Cada vez que cambie el esquema:

```
pnpm exec supabase gen types typescript --project-id <PROJECT_REF> > /tmp/db.types.ts && mv /tmp/db.types.ts src/core/types/database.types.ts
```

**No redirigir directo al archivo** (`> src/core/types/database.types.ts`): la redirección lo vacía antes de que el comando corra, y si el comando falla queda vacío. Con `--linked` pasa justamente eso (`Cannot find project ref`), y además `--linked` está deprecado. Si el archivo se vació por error: `git checkout -- src/core/types/database.types.ts`.

El archivo está en `.prettierignore`. Si el esquema cambió, el cambio de tipos va en el mismo PR que la migración. Las funciones del esquema `private` no aparecen en los tipos; las de `public` sí.

## 8. Configuración del proyecto Supabase

| Dónde (panel)                                                     | Valor correcto                                        | Por qué                                                                                                                                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settings → API → Exposed schemas                                  | `public` y `graphql_public`; **`private` sin marcar** | Las funciones de autorización (`private.has_permission`, etc.) no deben poder llamarse desde la API; las Actions consultan permisos con la función puente `public.has_permission` |
| Authentication → Sign In / Providers → Allow new users to sign up | Desactivado                                           | Con el registro abierto, cualquiera crea una cuenta con perfil `active` (sin roles no tiene permisos, pero conviene cerrarlo)                                                     |

Revisar ambos en cada entorno nuevo.

## 9. Probar RLS y funciones desde el SQL Editor

Sin Docker, las pruebas de seguridad se hacen en un bloque `do $$ ... $$` que cambia de rol con `set_config`, acumula los resultados en un texto y termina con `raise exception`. El error es a propósito: Postgres deshace todo lo hecho en el bloque (incluso usuarios o filas de prueba) y el mensaje trae el resumen.

```sql
do $$
declare
  v_admin uuid := (select id from auth.users where email = 'admin@resto.test');
  v_n int;
  r text := '';
begin
  -- Actuar como un usuario autenticado
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin)::text, true);

  select count(*) into v_n from public.profiles;
  r := r || format(E'\n1. profiles visibles: %s', v_n);

  -- Actuar como anon
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '', true);
  begin
    select count(*) into v_n from public.profiles;
    r := r || E'\n2. anon lee profiles: PERMITIDO (MAL)';
  exception when others then
    r := r || format(E'\n2. anon lee profiles: rechazado %s (esperado 42501)', sqlstate);
  end;

  raise exception E'RESULTADOS:%', r;
end $$;
```

- Capturar los rechazos con `exception when others` y mostrar `sqlstate`.
- Supabase avisa "Potential issue detected" si el bloque contiene `delete`; es esperable, porque nada se guarda.
- Las funciones `private.*` se pueden llamar directamente desde el bloque (corre como `postgres`) para probar sus casos con distintos `request.jwt.claims`.
- `reset role` **no** limpia `request.jwt.claims`: al volver a `postgres` hacer también `perform set_config('request.jwt.claims', '', true);`. Si no, `auth.uid()` sigue devolviendo al último actor y los triggers anti-escalada bloquean operaciones que deberían correr sin sesión (por ejemplo, el borrado en cascada de `user_roles`).
- Dentro de una transacción `now()` no cambia: para probar `updated_at` hay que partir de un valor viejo.

## 10. Comandos de uso frecuente

| Comando                                         | Para qué                                              |
| ----------------------------------------------- | ----------------------------------------------------- |
| `pnpm exec supabase migration new <nombre>`     | Crear una migración vacía en `supabase/migrations/`   |
| `pnpm exec supabase db push --remote --dry-run` | Ver qué migraciones se aplicarían, sin aplicarlas     |
| `pnpm exec supabase db push --remote`           | Aplicar migraciones pendientes al proyecto de pruebas |
| `pnpm exec supabase db pull`                    | Traer cambios hechos en el panel como migración       |
| `pnpm exec supabase migration list`             | Comparar migraciones locales y remotas                |

## 11. Checklist de cierre

- [x] `pnpm exec supabase --version` responde
- [x] `supabase link` exitoso contra el proyecto de pruebas
- [x] Usuario de pruebas creado en Auth, con perfil y rol `admin`
- [x] `database.types.ts` regenerado y sin errores de `pnpm run typecheck`
- [x] `supabase/.temp/` ignorado por Git
- [x] `private` no está en Exposed schemas
- [ ] Registro público de Auth desactivado en cada entorno

## Permisos de tabla (GRANT) en tablas nuevas

En este proyecto las tablas creadas por migración **no reciben permisos automáticos** para los roles de la Data API (`anon`, `authenticated`, `service_role`): solo quedan con `MAINTAIN`, `REFERENCES`, `TRIGGER` y `TRUNCATE` (`TRUNCATE` se salta RLS). RLS por sí solo no alcanza: Postgres comprueba primero los permisos de tabla y recién después las políticas. Sin `GRANT`, toda consulta falla con `permission denied for table <tabla>` (código `42501`), que los Servicios reportan como `INTERNAL_ERROR`.

**Regla:** toda migración que crea una tabla incluye, en el mismo archivo, RLS, políticas, un `REVOKE ALL` y el `GRANT` mínimo. Excepción vigente: las tablas de acceso de la Fase 2 (`roles`, `permissions`, `role_permissions`, `user_roles`) se crearon con RLS y `GRANT select` y sus políticas de lectura llegaron en una migración posterior; en el intervalo nadie podía leerlas desde la API.

```sql
alter table public.<tabla> enable row level security;
-- políticas...
revoke all on public.<tabla> from public, anon, authenticated, service_role;
grant select, insert, update on public.<tabla> to authenticated;
```

- Conceder solo lo que el flujo necesita. Sin `DELETE` en tablas con baja lógica.
- El `REVOKE ALL` va antes del `GRANT`: quita los privilegios por defecto sobrantes (`TRUNCATE`, `MAINTAIN`, `TRIGGER`, `REFERENCES`). Una función nueva en `public` también recibe `EXECUTE` para todos: las de trigger y las `SECURITY DEFINER` necesitan `REVOKE EXECUTE ... FROM public, anon, authenticated, service_role` (Postgres solo exige `EXECUTE` al crear el trigger, no al dispararlo).
- No conceder nada a `anon` salvo que la tabla deba ser pública.
- `service_role` hoy no tiene permisos; concedérselos solo cuando exista un cliente que lo use.
- Las funciones `SECURITY DEFINER` necesitan además `REVOKE EXECUTE ... FROM public, anon` (el `EXECUTE` por defecto es de `public`) y, si las llaman políticas, `GRANT USAGE` sobre el esquema y `GRANT EXECUTE` para `authenticated`.

**Cómo diagnosticarlo:**

```sql
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = '<tabla>'
  and grantee in ('anon', 'authenticated', 'service_role');
```

Caso real: `categories` se creó sin `GRANT` y `createCategory` devolvía `INTERNAL_ERROR`. Se corrigió con la migración `grant_categories_privileges`.
