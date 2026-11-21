# Reglas de Negocio

> Última actualización: 2026-11-20. Detalle técnico en `docs/Plan_identidad_y_permisos.md` y en `docs/database/model/Model_*.md`.

## 1. Identidad, roles y permisos

### Principios

- Cada persona que usa el sistema tiene una cuenta en Supabase Auth y exactamente un perfil (`profiles`).
- Lo que una persona puede hacer lo definen sus **permisos**, que le llegan por los **roles** asignados. Las reglas y el código verifican permisos, nunca nombres de rol.
- Un usuario puede tener varios roles, o ninguno. Sin roles no tiene permisos.
- Un permiso solo se aplica si el perfil está `active` y el rol está activo (`is_active = true`).
- Un usuario sin sesión (`anon`) no tiene ningún permiso.

### Estados del perfil

| Estado     | Significado                                 | ¿Puede operar? |
| ---------- | ------------------------------------------- | -------------- |
| `pending`  | Invitado que no completó el alta            | No             |
| `active`   | Usuario habilitado                          | Sí             |
| `inactive` | Bloqueado y archivado (la baja del usuario) | No             |

Dar de baja a un usuario es pasar su perfil a `inactive`; no se borra. Eso también bloquea su cuenta de Auth (`banned_until`).

### Catálogo de permisos vigente

| Permiso             | Qué habilita                                                              |
| ------------------- | ------------------------------------------------------------------------- |
| `categories.read`   | Leer categorías no dadas de baja                                          |
| `categories.manage` | Crear, modificar y dar de baja categorías; leer también las dadas de baja |
| `users.manage`      | Ver usuarios, asignarles roles y cambiar el estado de su perfil           |
| `roles.manage`      | Crear y editar roles y sus permisos                                       |
| `audit.read`        | Consultar el registro de auditoría                                        |
| `admin.access`      | Entrar al panel `/admin`                                                  |

Los permisos de módulos nuevos (productos, pedidos, etc.) se agregan al catálogo junto con el módulo.

### Roles vigentes

| Rol     | Tipo    | Permisos               | Quién lo recibe                                                      |
| ------- | ------- | ---------------------- | -------------------------------------------------------------------- |
| `admin` | Sistema | Todos los del catálogo | El primer administrador, asignado una vez por entorno por SQL manual |

- `admin` es un rol del sistema: no se borra, no cambia de código y no se desactiva.
- Los usuarios no se siembran en las migraciones (cada entorno tiene los suyos).

### Reglas que protegen el acceso

1. Nadie puede asignarse roles ni permisos a sí mismo.
2. Solo quien tiene `users.manage` asigna roles a usuarios; solo quien tiene `roles.manage` modifica los permisos de un rol.
3. No se puede quitar el rol `admin`, inactivar ni borrar al último usuario con `admin.access`.
4. Un rol asignado a algún usuario no se puede borrar: hay que desasignarlo o desactivarlo.
5. Todo cambio de usuarios, roles y permisos queda registrado en el historial de auditoría, con su autor.

## 2. Alta de roles operativos

Pendiente. Cada rol operativo se define aquí **antes** de sembrarse, junto con el módulo que lo necesita. Por cada uno hay que dejar escrito: qué permisos recibe, quién puede crear usuarios con ese rol y qué se valida al hacerlo.

- [ ] Crear un delivery
- [ ] Crear un cajero
- [ ] Crear un mesero
- [ ] Validar un pedido
