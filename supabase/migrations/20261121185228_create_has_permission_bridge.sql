-- D12: función puente para que las Actions consulten permisos vía supabase.rpc().
-- private no está expuesto en la API, así que se delega desde public.
create or replace function public.has_permission(p_code text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.has_permission(p_code);
$$;

revoke execute on function public.has_permission(text) from public, anon;
grant execute on function public.has_permission(text) to authenticated;