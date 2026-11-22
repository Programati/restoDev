# PROGRESO

> Leer al inicio de cada chat. Las tecnologías y reglas generales están en `Stack_restoDev.md` y `AGENTS.md`; el detalle técnico está en `docs/`.
> Última actualización: 2026-11-22

## 1. Proyecto

- **Nombre:** `resto-app` (`restoDev`).
- **Rama actual:** `feature/access-hardening`.
- **Estado:** implementación de las fases 0–5 completada; la Fase 5 todavía necesita `check:full`, commit y PR hacia `develop`. La documentación de usuarios y roles (HU y contratos) está redactada, sin código.
- **Cambios locales:** Fase 5 (F5.2–F5.9), incluidas migraciones, `setUserBanned` y documentación; todavía sin commit ni PR.
- **Entorno:** Node `24.22.1` · pnpm `12.11.2`.
- **Stack:** consultar `Stack_restoDev.md`; las versiones exactas de dependencias están en `package.json` y `pnpm-lock.yaml`.

## 2. Hitos completados

- **Setup (10–16/11):** Next.js, TypeScript, pnpm, Supabase CLI, variables de entorno, clientes Supabase, validación, ESLint, Prettier, Husky, lint-staged y scripts de comprobación. PRs correspondientes integrados en `develop`.
- **Autenticación y categorías (14–20/11):** login, logout y operaciones `create/get/list/update/deleteCategory`; Route Handler `GET /api/categories`; contratos y documentación. Los PRs indicados en el resumen original están integrados en `develop`.
- **Fase 0 (21/11):** decisiones de identidad y permisos, modelos, DER y reglas de negocio; PR integrado en `develop`.
- **Fase 1 (21/11):** `profiles`, migraciones y backfill; PR integrado en `develop`.
- **Fase 2 (21/11):** `roles`, `permissions`, asignaciones, funciones de autorización y políticas de lectura; PR integrado en `develop`.
- **Fase 3 (21/11):** autorización por permisos en Actions y páginas, políticas de `categories` y función puente `has_permission`; PR integrado en `develop`.
- **Fase 4 (21/11):** `audit_logs`, función genérica de auditoría y triggers en tablas de acceso y `categories`; implementación y pruebas documentadas.
- **Fase 5 (22/11):** protecciones de roles del sistema, anti-escalada, último administrador, contexto de acceso, bloqueo de usuarios en Supabase Auth, revisión de `REVOKE`/`GRANT` y matriz de base de datos (8 actores × 31 pruebas, sin fallos). Documentación sincronizada.
- **Documentación de usuarios y roles (22/11), solo documentos, sin código:**
  - Usuarios: 7 HU (`docs/historias_de_usuario/users/`) y 9 contratos (`docs/contracts/users/`: resumen del módulo, `createUser`, `listUsers`, `getUser`, `updateUser`, `setUserStatus`, `assignUserRole`, `removeUserRole`, `resetUserPassword`).
  - Roles: 6 HU (`docs/historias_de_usuario/roles/`) y 7 contratos (`docs/contracts/roles/`: resumen del módulo, `createRole`, `listRoles`, `getRole`, `updateRole`, `deleteRole`, `setRolePermissions`).
  - Todas las HU están en estado Borrador y los contratos figuran como "Documentada; sin código".

## 3. Estado actual

- La rama `feature/access-hardening` contiene los cambios locales de la Fase 5.
- F5.2: `setUserBanned` usa `createAdminClient()` y la API de administración de Auth. Bloqueo, desbloqueo y `NOT_FOUND` fueron probados el 22/11. La clave `SUPABASE_SERVICE_ROLE_KEY` se valida al solicitarla mediante `getServiceRoleKey()` y se utiliza solo en servidor para Auth Admin.
- F5.3–F5.5: triggers de protección de roles del sistema, asignaciones y último administrador aplicados y verificados.
- F5.6: `public.get_current_access_context()` aplicada y verificada; devuelve el contexto de acceso del usuario autenticado.
- F5.7: privilegios de tablas y ejecución de funciones de trigger revisados; `set_updated_at` comprobado después del `REVOKE`.
- F5.8–F5.9: matriz de acceso a nivel de base de datos y cierre documental completados. Las pruebas vía Actions siguen diferidas hasta disponer del Front.
- `pnpm run check:full` pasó el 20/11, antes de los cambios actuales de la Fase 5. Debe volver a ejecutarse antes del PR.
- **Verificar el PR de la Fase 4:** el resumen inicial no lo incluye entre los PRs mergeados, pero el checklist anterior lo marcaba pendiente. Confirmar su estado real en GitHub antes de cerrar la Fase 5.
- **Plan desactualizado:** las HU y contratos de usuarios y roles citan las decisiones D14–D16 y las tareas F6.x, pero `docs/Plan_identidad_y_permisos.md` todavía no tiene la Fase 6. F6.1 no está marcada.

## 4. Funcionalidades implementadas

- **Auth:** login y logout implementados mediante Server Actions y Servicios. `src/proxy.ts` refresca la sesión y gestiona redirecciones; cada Action comprueba sesión y permisos por sí misma.
- **Categorías:** servicios y Actions para crear, obtener, listar, actualizar y eliminar (baja lógica). Existe `GET /api/categories`; todavía no existen la pantalla de listado `/categories` ni los Route Handlers `POST`, `GET /:id` y `PATCH /:id`.
- **Panel:** `/admin` requiere `admin.access`; existe el formulario `/categories/new`.
- **Auditoría y acceso:** los detalles de tablas, funciones, políticas, triggers y migraciones están en `docs/Plan_identidad_y_permisos.md` y `docs/database/`.
- **Usuarios y roles:** solo documentados (HU y contratos); no hay Actions, Servicios, schemas ni RPC `admin_*` implementados.

## 5. Próximos pasos y pendientes

### Inmediatos

1. Ejecutar `pnpm run check:full` en `feature/access-hardening`.
2. Revisar `git status` y el diff; confirmar qué cambios deben incluirse en el commit.
3. Verificar el estado del PR de la Fase 4 en GitHub, por la inconsistencia indicada arriba.
4. Commitear los cambios de la Fase 5 y abrir el PR hacia `develop` una vez superadas las comprobaciones.
5. Añadir la Fase 6 al plan (D14–D16 y tareas F6.1–F6.5, que las HU y contratos ya referencian) y marcar F6.1.

### Diferidos / dependientes del Front

- Implementar las 7 RPC `admin_*` cuando se construya la pantalla de usuarios y roles (D13).
- Implementar Actions, Servicios y schemas de usuarios y roles según los contratos redactados.
- Conectar `setUserBanned` al cambio de `profiles.status` mediante `admin_update_profile_status` y mapear `user_banned` en `login.service` para mostrar correctamente el bloqueo al iniciar sesión.
- Ejecutar la matriz de permisos vía Actions y completar las tablas de verificación de las 5 HU de `categories` cuando exista el Front.
- Completar el listado, detalle y edición de categorías cuando se defina su alcance.
- Crear `docs/Guia_front.md` si continúa siendo un entregable.

### Dependientes de funcionalidades futuras

- Diseñar `products` y proteger en la base de datos la baja de categorías que tengan productos activos.
- Al implementar usuarios y roles, cubrir el límite actual de la protección del último administrador: no contempla retirar `admin.access` de `role_permissions` ni desactivar un rol no sistema que tenga ese permiso. `admin_set_role_permissions` debe comprobarlo (ver `Contract_setRolePermissions.md`).

## 6. Decisiones y revisiones abiertas

- Evaluar ESLint 10 cuando `eslint-config-next` lo soporte.
- Evaluar un `CHECK` en la base para garantizar `deleted_at IS NULL OR active = false`; confirmar también los criterios 8 y 10 de HU-CAT-005 y si se necesita una HU de restauración.
- Antes de auditar tablas de mayor movimiento (por ejemplo, `orders`), revisar retención y exclusión de columnas sensibles. No hay política de purga definida.
- Completar pruebas aún no realizadas sobre invitaciones `pending`, CHECK de formato/longitud, duplicados y reglas `CASCADE`/`RESTRICT` en perfiles y tablas de acceso.
- Alinear los nombres de Actions en contratos y diagramas con los exports reales (`createCategoryAction`, `deleteCategoryAction`, `logoutAction`).
- Revisar observaciones de F5.8 si se decide endurecer políticas: perfiles `pending`/`inactive` pueden leer su propia fila de `user_roles`; usuarios activos sin rol pueden leer todas las filas de `roles`, incluidas las inactivas. No se identificó exposición de datos ajenos.
- Verificar en cada entorno nuevo que el registro público de Supabase Auth esté desactivado; está desactivado en el proyecto de pruebas.
- Decisiones abiertas de las HU de roles: borrado físico de roles (HU-ROL-005), si se pueden modificar los permisos del rol de sistema `admin` y si hace falta una Action `listPermissions` para el selector (HU-ROL-006).

## 7. Documentación de referencia

- `Stack_restoDev.md`: tecnologías, versiones/criterios y reglas del stack.
- `AGENTS.md`: instrucciones y convenciones para trabajar en el repositorio.
- `docs/Plan_identidad_y_permisos.md`: fases, decisiones D1–D13, identidad, autorización, auditoría y matriz de pruebas.
- `docs/database/supabase-cli.md`: CLI, migraciones, tipos, permisos, Auth y operaciones con Supabase.
- `docs/database/model/`: modelos de datos y relaciones.
- `docs/contracts/`: contratos de Actions, errores y funcionalidades (`auth/`, `categories/`, `users/`, `roles/`).
- `docs/historias_de_usuario/`: historias y criterios de aceptación (`categories/`, `users/`, `roles/`).
- `docs/Estructura_de_carpetas.md`, `docs/Convenciones_de_archivos.md`, `docs/Reglas_de_negocio.md` y `docs/Guia_de_desarrollo_de_funcionalidades.md`: estructura y convenciones del proyecto.
