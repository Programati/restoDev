-- F4.2: tabla audit_logs (solo inserción). RLS activo y GRANT select desde la creación.
-- Los eventos los inserta únicamente el trigger genérico SECURITY DEFINER (F4.3); hasta
-- entonces la tabla queda vacía. Nadie edita ni borra eventos: sin GRANT de escritura.

create table public.audit_logs (
  id         bigint generated always as identity primary key,
  actor_id   uuid references auth.users (id) on delete set null,
  action     text not null,
  table_name text not null,
  record_id  text,
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamptz not null default now(),

  constraint audit_logs_action_check check (action in ('insert', 'update', 'delete'))
);

-- Listado cronológico, historial de un registro y soporte del SET NULL de actor_id
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_table_record_idx on public.audit_logs (table_name, record_id);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id);

alter table public.audit_logs enable row level security;

-- Las tablas nuevas reciben TRUNCATE (y otros) por defecto: se revoca todo y se concede
-- solo la lectura a authenticated. anon y service_role quedan sin permisos.
revoke all on public.audit_logs from public, anon, authenticated, service_role;
grant select on public.audit_logs to authenticated;

-- Lectura: solo quien tiene audit.read. Sin políticas de INSERT/UPDATE/DELETE.
create policy "audit_logs_select_audit_read"
  on public.audit_logs
  for select
  to authenticated
  using ((select private.has_permission('audit.read')));