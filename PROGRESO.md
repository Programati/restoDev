# PROGRESO

> Leer al inicio de cada chat. Las tecnologías y reglas generales están en `Stack_restoDev.md` y `AGENTS.md`; el detalle técnico está en `docs/`.
> Última actualización: 2026-11-22

## 1. Proyecto

- **Nombre:** `resto-app` (`restoDev`).
- **Rama actual:** `develop` (actualizada; sin cambios locales pendientes). La próxima tarea (F6.3) se hace en una rama nueva desde `develop`: `feature/admin-users-roles-api`.
- **Estado:** fases 0–5 completadas, con `check:full` en verde y todos los PR integrados en `develop`. La Fase 6 (usuarios y roles) está en curso: F6.1 (documentación: HU y contratos) y F6.2 (10 RPC `admin_*` en la base) hechas y mergeadas; sigue F6.3 (Servicios y Actions). Todavía no hay Servicios, Actions ni pantallas de usuarios y roles.
- **Entorno:** Node `24.22.1` · pnpm `12.11.2`.
- **Stack:** consultar `Stack_restoDev.md`; las versiones exactas de dependencias están en `package.json` y `pnpm-lock.yaml`.

## 2. Hitos completados

- **Setup (10–16/11):** Next.js, TypeScript, pnpm, Supabase CLI, variables de entorno, clientes Supabase, validación, ESLint, Prettier, Husky, lint-staged y scripts de comprobación. PRs correspondientes integrados en `develop`.
- **Autenticación y categorías (14–20/11):** login, logout y operaciones `create/get/list/update/deleteCategory`; Route Handler `GET /api/categories`; contratos y documentación. PRs integrados en `develop`.
- **Fase 0 (21/11):** decisiones de identidad y permisos, modelos, DER y reglas de negocio; PR integrado en `develop`.
- **Fase 1 (21/11):** `profiles`, migraciones y backfill; PR integrado en `develop`.
- **Fase 2 (21/11):** `roles`, `permissions`, asignaciones, funciones de autorización y políticas de lectura; PR integrado en `develop`.
- **Fase 3 (21/11):** autorización por permisos en Actions y páginas, políticas de `categories` y función puente `has_permission`; PR integrado en `develop`.
- **Fase 4 (21/11):** `audit_logs`, función genérica de auditoría y triggers en tablas de acceso y `categories`; PR integrado en `develop`.
- **Fase 5 (22/11):** protecciones de roles del sistema, anti-escalada, último administrador, contexto de acceso, bloqueo de usuarios en Supabase Auth, revisión de `REVOKE`/`GRANT` y matriz de base de datos (8 actores × 31 pruebas, sin fallos). Documentación sincronizada; `check:full` en verde; PR integrado en `develop`.
- **F6.1, documentación de usuarios y roles (22/11), solo documentos, sin código:**
  - Usuarios: 7 HU (`docs/historias_de_usuario/users/`) y 9 contratos (`docs/contracts/users/`: resumen del módulo, `createUser`, `listUsers`, `getUser`, `updateUser`, `setUserStatus`, `assignUserRole`, `removeUserRole`, `resetUserPassword`).
  - Roles: 6 HU (`docs/historias_de_usuario/roles/`) y 7 contratos (`docs/contracts/roles/`: resumen del módulo, `createRole`, `listRoles`, `getRole`, `updateRole`, `deleteRole`, `setRolePermissions`).
  - Todas las HU están en estado Borrador y los contratos figuran como "Documentada; sin código".
  - La Fase 6 (D14–D16 y tareas F6.1–F6.6) está en `docs/Plan_identidad_y_permisos.md`.
- **F6.2, RPC administrativas (22/11):** migraciones `create_admin_roles_rpc` (`admin_create_role`, `admin_update_role`, `admin_delete_role`, `admin_set_role_permissions`, helper `private.has_active_admin()`) y `create_admin_users_rpc` (`admin_list_users`, `admin_get_user`, `admin_update_profile`, `admin_update_profile_status`, `admin_assign_role`, `admin_remove_role`). D16 confirmada. Cubre el límite de la guardia de F5.5 (rechazo `23514` si no queda administrador). Verificadas con 81 comprobaciones sin fallos; tipos y documentación sincronizados; PR integrado en `develop`.

## 3. Estado actual

- `develop` contiene todo lo de las fases 0–5, la documentación de F6.1 y las RPC de F6.2. No hay PR abiertos.
- F5.2: `setUserBanned` usa `createAdminClient()` y la API de administración de Auth. Bloqueo, desbloqueo y `NOT_FOUND` fueron probados el 22/11. La clave `SUPABASE_SERVICE_ROLE_KEY` se valida al solicitarla mediante `getServiceRoleKey()` y se utiliza solo en servidor para Auth Admin.
- F5.3–F5.5: triggers de protección de roles del sistema, asignaciones y último administrador aplicados y verificados.
- F5.6: `public.get_current_access_context()` aplicada y verificada; devuelve el contexto de acceso del usuario autenticado.
- F5.7: privilegios de tablas y ejecución de funciones de trigger revisados; `set_updated_at` comprobado después del `REVOKE`.
- F5.8–F5.9: matriz de acceso a nivel de base de datos y cierre documental completados. Las pruebas vía Actions siguen diferidas hasta disponer del Front (F6.5).
- **Siguiente tarea: F6.3** (rama `feature/admin-users-roles-api`): Servicios y Actions de usuarios y roles sobre las RPC ya disponibles.

## 4. Funcionalidades implementadas

- **Auth:** login y logout implementados mediante Server Actions y Servicios. `src/proxy.ts` refresca la sesión y gestiona redirecciones; cada Action comprueba sesión y permisos por sí misma.
- **Categorías:** servicios y Actions para crear, obtener, listar, actualizar y eliminar (baja lógica). Existe `GET /api/categories`; todavía no existen la pantalla de listado `/categories` ni los Route Handlers `POST`, `GET /:id` y `PATCH /:id`.
- **Panel:** `/admin` requiere `admin.access`; existe el formulario `/categories/new`.
- **Auditoría y acceso:** los detalles de tablas, funciones, políticas, triggers y migraciones están en `docs/Plan_identidad_y_permisos.md` y `docs/database/`.
- **Usuarios y roles:** documentados (HU y contratos) y con las 10 RPC `admin_*` implementadas en la base (F6.2); no hay Actions, Servicios, schemas ni pantallas todavía.

## 5. Próximos pasos y pendientes

### Inmediatos (Fase 6)

1. Crear `feature/admin-users-roles-api` desde `develop`.
2. **F6.3, Servicios y Actions:** 8 Actions de usuarios (`createUserAction`, `listUsersAction`, `getUserAction`, `updateUserAction`, `setUserStatusAction`, `assignUserRoleAction`, `removeUserRoleAction`, `resetUserPasswordAction`) y 6 de roles (`createRoleAction`, `listRolesAction`, `getRoleAction`, `updateRoleAction`, `deleteRoleAction`, `setRolePermissionsAction`), con sus schemas Zod, Servicios y tipos (`user.types.ts`, `role.types.ts`), todas con `requirePermission` antes de validar. Los Servicios traducen los códigos de las RPC: `42501` → `FORBIDDEN`, `P0002` → `NOT_FOUND`, `23505`/`23514`/`23503` → `CONFLICT`, `22023` → `VALIDATION_ERROR`.
3. En F6.3 también: conectar `setUserBanned` al cambio de `status` (después de que `admin_update_profile_status` aceptó el cambio) y mapear `user_banned` en `login.service` y en `Contract_login.md`.
4. Resolver al empezar F6.3 las decisiones abiertas de las HU de roles (ver sección 6) y revisar que `Reglas_de_negocio.md` cubra usuarios y roles.
5. Luego F6.4 (Front), F6.5 (pruebas de la matriz vía Actions) y F6.6 (cierre documental).

### Diferidos / dependientes del Front

- Ejecutar la matriz de permisos vía Actions y completar las tablas de verificación de las 5 HU de `categories` cuando exista el Front (F6.5).
- Completar el listado, detalle y edición de categorías cuando se defina su alcance.
- Crear `docs/Guia_front.md` (mínima, en F6.4) si continúa siendo un entregable.
- Invitación por email (opción B de D14): pendiente documentado, fuera de la Fase 6.

### Dependientes de funcionalidades futuras

- Diseñar `products` y proteger en la base de datos la baja de categorías que tengan productos activos.

## 6. Decisiones y revisiones abiertas

- Evaluar ESLint 10 cuando `eslint-config-next` lo soporte.
- Evaluar un `CHECK` en la base para garantizar `deleted_at IS NULL OR active = false`; confirmar también los criterios 8 y 10 de HU-CAT-005 y si se necesita una HU de restauración.
- Antes de auditar tablas de mayor movimiento (por ejemplo, `orders`), revisar retención y exclusión de columnas sensibles. No hay política de purga definida.
- Completar pruebas aún no realizadas sobre invitaciones `pending`, CHECK de formato/longitud, duplicados y reglas `CASCADE`/`RESTRICT` en perfiles y tablas de acceso.
- Alinear los nombres de Actions en contratos y diagramas con los exports reales (`createCategoryAction`, `deleteCategoryAction`, `logoutAction`).
- Revisar observaciones de F5.8 si se decide endurecer políticas: perfiles `pending`/`inactive` pueden leer su propia fila de `user_roles`; usuarios activos sin rol pueden leer todas las filas de `roles`, incluidas las inactivas. No se identificó exposición de datos ajenos.
- Verificar en cada entorno nuevo que el registro público de Supabase Auth esté desactivado; está desactivado en el proyecto de pruebas.
- Decisiones abiertas de las HU de roles: borrado físico de roles (HU-ROL-005), si se pueden modificar los permisos del rol de sistema `admin` y si hace falta una Action `listPermissions` para el selector (HU-ROL-006).
- Límite de la guardia del último administrador: cubierto en F6.2 dentro de `admin_set_role_permissions` y `admin_update_role`; el trigger de F5.5 sigue sin cubrirlo cuando se escribe por SQL directo.

## 7. Documentación de referencia

- `Stack_restoDev.md`: tecnologías, versiones/criterios y reglas del stack.
- `AGENTS.md`: instrucciones y convenciones para trabajar en el repositorio.
- `docs/Plan_identidad_y_permisos.md`: fases, decisiones D1–D16, identidad, autorización, auditoría y matriz de pruebas.
- `docs/database/supabase-cli.md`: CLI, migraciones, tipos, permisos, Auth y operaciones con Supabase.
- `docs/database/model/`: modelos de datos y relaciones.
- `docs/contracts/`: contratos de Actions, errores y funcionalidades (`auth/`, `categories/`, `users/`, `roles/`).
- `docs/historias_de_usuario/`: historias y criterios de aceptación (`categories/`, `users/`, `roles/`).
- `docs/Estructura_de_carpetas.md`, `docs/Convenciones_de_archivos.md`, `docs/Reglas_de_negocio.md` y `docs/Guia_de_desarrollo_de_funcionalidades.md`: estructura y convenciones del proyecto.
