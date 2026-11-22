-- F5.7 (parte 2): quitar EXECUTE de las funciones de trigger que aún lo tenían.
-- Postgres solo exige EXECUTE al crear el trigger, no al dispararlo, así que los
-- triggers existentes siguen funcionando.

revoke execute on function public.set_updated_at()
  from public, anon, authenticated, service_role;

-- Event trigger SECURITY DEFINER ajeno a nuestras migraciones (RLS automático).
revoke execute on function public.rls_auto_enable()
  from public, anon, authenticated, service_role;
