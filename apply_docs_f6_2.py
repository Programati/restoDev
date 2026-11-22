#!/usr/bin/env python3
"""Aplica los cambios de documentación de F6.2 sobre el repo.
Uso (desde la raíz del repo): python3 apply_docs_f6_2.py
Cada reemplazo debe coincidir exactamente 1 vez; si un archivo no cumple, NO se toca y se informa.
PROGRESO.md va aparte (archivo completo). Después: pnpm format"""
import glob, sys

RPC_ERR = "`42501` sin permiso, `P0002` inexistente, `23505`/`23514`/`23503` conflictos (el Servicio los traduce)"

EDITS = {
"Plan_identidad_y_permisos.md": [
 ("Completada (migraciones aplicadas al proyecto de pruebas y documentación sincronizada; PR pendiente); casos restantes resueltos en F5.8",
  "Completada (PR mergeado); casos restantes resueltos en F5.8"),
 ("Completada (F5.6 reducida a `get_current_access_context()`, ver D13; PR pendiente)",
  "Completada (F5.6 reducida a `get_current_access_context()`, ver D13; PR mergeado)"),
 ("Aplicadas al proyecto de pruebas con `db push --remote`; el PR hacia `develop` está pendiente.",
  "Aplicadas al proyecto de pruebas con `db push --remote`. Mergeada en `develop`."),
 ("En curso (F6.1 documentación hecha; sigue F6.2)",
  "En curso (F6.1 y F6.2 hechas y mergeadas; sigue F6.3)"),
 ("- [ ] **D16. RPC adicionales (propuesta, a confirmar).**",
  "- [x] **D16. RPC adicionales (confirmada el 2026-11-22).**"),
 ("D16 sigue como propuesta a confirmar; las decisiones abiertas de las HU de roles (borrado físico, permisos del rol `admin`, Action `listPermissions`) se resuelven en F6.2 o F6.3.",
  "D16 confirmada el 2026-11-22. Las decisiones abiertas de las HU de roles (borrado físico, permisos del rol `admin`, Action `listPermissions`) se resuelven en F6.3: la RPC ya implementa el borrado físico según el contrato y no impide editar los permisos del rol `admin`, salvo a quien lo tiene asignado."),
 ("- [ ] F6.2 **Base de datos**", "- [x] F6.2 **Base de datos**"),
 ("regenerar tipos; actualizar los `Model_*` y probar cada RPC con el patrón `do $$` de `supabase-cli.md`.",
  "regenerar tipos; actualizar los `Model_*` y probar cada RPC con el patrón `do $$` de `supabase-cli.md`. **Hecho el 2026-11-22 (PR mergeado en `develop`):** migraciones `create_admin_roles_rpc` (`admin_create_role`, `admin_update_role`, `admin_delete_role`, `admin_set_role_permissions` y el helper `private.has_active_admin()`) y `create_admin_users_rpc` (`admin_list_users`, `admin_get_user`, `admin_update_profile`, `admin_update_profile_status`, `admin_assign_role`, `admin_remove_role`); `listRoles` y `getRole` no necesitan RPC (lectura directa con RLS). Todas `SECURITY DEFINER`, `search_path` vacío, `REVOKE` a `public` y `anon`, `GRANT` a `authenticated`, y cada una exige su permiso (`roles.manage` o `users.manage`). **Códigos de error que el Servicio debe traducir:** `42501` → `FORBIDDEN` (permiso o anti-escalada), `P0002` → `NOT_FOUND` (usuario, rol o permiso inexistente), `23505` → `CONFLICT` (`code` o `name` repetido), `23514` → `CONFLICT` (rol del sistema, último administrador o `CHECK`), `23503` → `CONFLICT` (rol asignado), `22023` → parámetro inválido. Los parámetros opcionales se distinguen de `null` con `p_set_description` y `p_set_phone`. **Límite de F5.5 cubierto:** `admin_update_role` y `admin_set_role_permissions` rechazan con `23514` si tras el cambio no queda ningún administrador. **Verificación (2026-11-22, proyecto de pruebas):** script `do $$` con 81 comprobaciones (permisos, `anon`, alta, duplicados, formato, actualización parcial, idempotencia sin eventos de auditoría, anti-escalada, borrado, filtros y forma de `admin_list_users` y `admin_get_user`, y único administrador): 81 pasaron y 0 fallaron."),
 ("- [ ] F6.3 **Servicios y Actions**", "- [ ] F6.3 **Servicios y Actions (siguiente tarea)**"),
],
"Contract_createRole.md": [("- **Pendiente:** RPC `admin_create_role`, schema,",
  "- **Implementado (F6.2, 2026-11-22):** RPC `admin_create_role` (devuelve el `id`; " + RPC_ERR + ").\n- **Pendiente:** schema,")],
"Contract_updateRole.md": [("- **Pendiente:** RPC `admin_update_role` (con la comprobación del último administrador), schema,",
  "- **Implementado (F6.2, 2026-11-22):** RPC `admin_update_role` (parcial; `p_set_description` distingue omitido de `null`; incluye la comprobación del último administrador, `23514`; " + RPC_ERR + ").\n- **Pendiente:** schema,")],
"Contract_deleteRole.md": [("- **Pendiente:** RPC `admin_delete_role`, schema,",
  "- **Implementado (F6.2, 2026-11-22):** RPC `admin_delete_role` (si es del sistema y además está asignado prevalece `23514`; asignado: `23503`; " + RPC_ERR + ").\n- **Pendiente:** schema,")],
"Contract_setRolePermissions.md": [("- **Pendiente:** RPC `admin_set_role_permissions` (con la comprobación del último administrador), schema,",
  "- **Implementado (F6.2, 2026-11-22):** RPC `admin_set_role_permissions` (aplica solo la diferencia, idempotente, incluye la comprobación del último administrador, `23514`; código inexistente: `P0002`; `permission_codes` nulo: `22023`; " + RPC_ERR + ").\n- **Pendiente:** schema,")],
"Contract_listUsers.md": [("- **Pendiente:** RPC `admin_list_users`, schema,",
  "- **Implementado (F6.2, 2026-11-22):** RPC `admin_list_users` (devuelve un arreglo `jsonb` con la forma de `UserListItem`; `42501` sin permiso).\n- **Pendiente:** schema,")],
"Contract_getUser.md": [("- **Pendiente:** RPC `admin_get_user`, schema,",
  "- **Implementado (F6.2, 2026-11-22):** RPC `admin_get_user` (devuelve `jsonb` con la forma de `UserDetail`; usuario inexistente: error `P0002`, no fila vacía; `42501` sin permiso).\n- **Pendiente:** schema,")],
"Contract_updateUser.md": [("- **Pendiente:** RPC `admin_update_profile`, schema,",
  "- **Implementado (F6.2, 2026-11-22):** RPC `admin_update_profile` (parcial; `p_set_phone` distingue omitido de `null`; `CHECK` de longitud: `23514`; " + RPC_ERR + ").\n- **Pendiente:** schema,")],
"Contract_setUserStatus.md": [("- **Pendiente:** RPC `admin_update_profile_status`, schema,",
  "- **Implementado (F6.2, 2026-11-22):** RPC `admin_update_profile_status` (solo `active` o `inactive`, `pending`: `22023`; idempotente, sin evento de auditoría si no cambia; último administrador: `23514`; no toca `banned_until`; " + RPC_ERR + ").\n- **Pendiente:** schema,")],
"Contract_assignUserRole.md": [("- **Pendiente:** RPC `admin_assign_role`, schema,",
  "- **Implementado (F6.2, 2026-11-22):** RPC `admin_assign_role` (idempotente; usuario o rol inexistente: `P0002`; autoasignación: `42501`).\n- **Pendiente:** schema,")],
"Contract_removeUserRole.md": [("- **Pendiente:** RPC `admin_remove_role`, schema,",
  "- **Implementado (F6.2, 2026-11-22):** RPC `admin_remove_role` (idempotente; usuario o rol inexistente: `P0002`; propio rol: `42501`; último administrador: `23514`).\n- **Pendiente:** schema,")],
"Contract_createUser.md": [("- **Pendiente:** schema, Servicio, Action, tipos, RPC `admin_assign_role` y `admin_get_user`, y el formulario.",
  "- **Pendiente:** schema, Servicio, Action, tipos y el formulario. Las RPC `admin_assign_role` y `admin_get_user` ya están implementadas (F6.2, 2026-11-22).")],
"Model_role.md": [
 ("Las RPC de escritura quedan pendientes hasta la pantalla de gestión (D13).",
  "Las RPC de escritura (`admin_create_role`, `admin_update_role`, `admin_delete_role`) están implementadas desde F6.2 (migración `create_admin_roles_rpc`, 2026-11-22)."),
 ("Las RPC (`admin_create_role`, `admin_update_role`, `admin_delete_role`, con `roles.manage`) están **pendientes** hasta que exista la pantalla de gestión (D13); mientras tanto, solo migración o SQL Editor.",
  "Las RPC (`admin_create_role`, `admin_update_role`, `admin_delete_role`, con `roles.manage`) están implementadas desde F6.2 y son la vía de la app; además, migración o SQL Editor."),
],
"Model_user_role.md": [
 ("Las RPC de escritura quedan pendientes hasta la pantalla de gestión (D13).",
  "Las RPC de escritura (`admin_assign_role`, `admin_remove_role`) están implementadas desde F6.2 (migración `create_admin_users_rpc`, 2026-11-22)."),
 ("Las RPC (`admin_assign_role`, `admin_remove_role`, con `users.manage`) están **pendientes** hasta la pantalla de gestión (D13); mientras tanto, solo migración o SQL Editor.",
  "Las RPC (`admin_assign_role`, `admin_remove_role`, con `users.manage`) están implementadas desde F6.2 y son la vía de la app; además, migración o SQL Editor."),
 ("Límite conocido: no cubre borrar `admin.access` de `role_permissions` ni desactivar un rol no sistema que lo tenga.",
  "Límite conocido: no cubre borrar `admin.access` de `role_permissions` ni desactivar un rol no sistema que lo tenga; lo cubren las RPC `admin_set_role_permissions` y `admin_update_role` (F6.2)."),
],
"Model_role_permission.md": [
 ("Las RPC de escritura quedan pendientes hasta la pantalla de gestión (D13).",
  "La RPC de escritura `admin_set_role_permissions` está implementada desde F6.2 (migración `create_admin_roles_rpc`, 2026-11-22)."),
 ("la RPC `admin_set_role_permissions` (con `roles.manage`) está **pendiente** hasta la pantalla de gestión (D13); mientras tanto, solo migración o SQL Editor.",
  "la RPC `admin_set_role_permissions` (con `roles.manage`) está implementada desde F6.2 y es la vía de la app; además, migración o SQL Editor."),
 ("**Límite conocido (F5.5):** quitar `admin.access` de un rol no está cubierto por la guardia del último administrador.",
  "**Límite conocido (F5.5):** quitar `admin.access` de un rol no está cubierto por la guardia del último administrador; lo cubre `admin_set_role_permissions` (F6.2)."),
],
"Model_profile.md": [
 ("**Pendiente:** conectarla con el cambio de `status`, que llegará con la RPC `admin_update_profile_status` (D13). Hasta entonces,",
  "**Pendiente:** conectarla con el cambio de `status` (la RPC `admin_update_profile_status` existe desde F6.2; la conexión se hace en F6.3). Hasta entonces,"),
 ("Edición de `full_name`, `phone` y `avatar_path` y cambio de `status` por RPC (D4), pendientes hasta que exista la pantalla de gestión (D13).",
  "Edición de `full_name` y `phone` (`admin_update_profile`) y cambio de `status` (`admin_update_profile_status`) por RPC (D4), implementadas en F6.2; `avatar_path` no tiene RPC todavía."),
],
}

LAST_ROW = ("| 2026-11-22 | F6.2 completada y mergeada: migraciones `create_admin_roles_rpc` y `create_admin_users_rpc` "
            "(10 RPC `admin_*`, D16 confirmada), helper `private.has_active_admin()` y cobertura del límite de la guardia de F5.5; "
            "81 comprobaciones sin fallos en el proyecto de pruebas. F4 y F5 ya figuran como mergeadas. Sigue F6.3 (Servicios y Actions) |")

ok = fail = 0
for name, reps in EDITS.items():
    paths = glob.glob(f"**/{name}", recursive=True)
    paths = [p for p in paths if "node_modules" not in p]
    if len(paths) != 1:
        print(f"[FALTA/AMBIGUO] {name}: {paths}"); fail += 1; continue
    p = paths[0]
    s = open(p, encoding="utf-8").read()
    bad = [o[:60] for o, _ in reps if s.count(o) != 1]
    if bad:
        print(f"[NO TOCADO] {p}: no coincide 1 vez -> {bad}"); fail += 1; continue
    for o, n in reps:
        s = s.replace(o, n)
    if name == "Plan_identidad_y_permisos.md":
        s = s.rstrip("\n") + "\n" + LAST_ROW + "\n"
    open(p, "w", encoding="utf-8").write(s)
    print(f"[OK] {p} ({len(reps)} cambios)"); ok += 1
print(f"\n{ok} archivos actualizados, {fail} con problemas")
sys.exit(1 if fail else 0)
