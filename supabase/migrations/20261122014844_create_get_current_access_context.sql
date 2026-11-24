-- F5.6 (D13): contexto de acceso del usuario actual en una sola llamada.
-- Vive en public porque se llama con supabase.rpc(). Sin parámetros: solo expone lo del propio
-- usuario (auth.uid()). SECURITY DEFINER porque lee auth.users.
-- Roles y permisos solo cuentan con perfil 'active' y roles is_active (igual que has_permission).

create or replace function public.get_current_access_context()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'user_id',   u.id,
    'email',     u.email,
    'full_name', p.full_name,
    'status',    p.status,
    'roles', coalesce((
      select jsonb_agg(r.code order by r.code)
      from public.user_roles ur
      join public.roles r on r.id = ur.role_id and r.is_active
      where ur.user_id = u.id and p.status = 'active'
    ), '[]'::jsonb),
    'permissions', coalesce((
      select jsonb_agg(x.code order by x.code)
      from (
        select distinct rp.permission_code as code
        from public.user_roles ur
        join public.roles r on r.id = ur.role_id and r.is_active
        join public.role_permissions rp on rp.role_id = r.id
        where ur.user_id = u.id and p.status = 'active'
      ) x
    ), '[]'::jsonb)
  )
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = (select auth.uid());
$$;

revoke execute on function public.get_current_access_context() from public, anon;
grant execute on function public.get_current_access_context() to authenticated;