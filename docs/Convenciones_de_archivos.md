# Convenciones de Archivos

- [ ] Un archivo = una responsabilidad = un caso de uso
- [ ] Nombres en camelCase con sufijo: `createUser.service.ts`, `createUser.schema.ts`, `createUser.action.ts`
- [ ] Sin capa de repositorio: cada Servicio consulta Supabase directamente
- [ ] Servicio: una función exportada que recibe `supabase: SupabaseClient<Database>` y el DTO ya validado
- [ ] Action: `"use server"`, valida con su schema Zod, crea el cliente de `lib/supabase/server.ts`, llama al Servicio, devuelve `ActionResult`
- [ ] Route Handler: valida con el mismo schema Zod, llama al mismo Servicio, responde con `lib/api/response.ts`
- [ ] Schema: un schema Zod por archivo
- [ ] Tipos: agrupados por módulo en `<modulo>.types.ts` (`z.infer` de los schemas)
- [ ] `index.ts` solo en `services/<modulo>/` y `schemas/<modulo>/`
- [ ] Lecturas y escrituras simples: el Servicio consulta Supabase directamente y RLS protege la tabla
- [ ] Operaciones sensibles (asignar roles y permisos, cambiar `status` de un perfil): función SQL `SECURITY DEFINER` invocada con `supabase.rpc()` desde el Servicio; la validación vive dentro de la función
- [ ] Autorización: cada Action comprueba el permiso con el helper único (`src/lib/auth/requirePermission.ts`) antes de validar con Zod y devuelve `FORBIDDEN` si falta; RLS es la red de seguridad, no la única barrera
- [ ] Autorización en páginas: toda página protegida (Server Component) usa `requirePagePermission` (`src/lib/auth/requirePagePermission.ts`) y muestra `<AccessDenied />` si no hay permiso; no se verifica en el proxy ni en el layout. Debe llamarse dentro de un `<Suspense>` (lee cookies, `cacheComponents`). En páginas de formularios es ayuda de experiencia: la barrera real es la Action
