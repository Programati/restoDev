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
