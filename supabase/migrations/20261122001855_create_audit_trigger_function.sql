-- F4.3: función genérica de auditoría. Vive en private (no expuesta en la API).
-- Uso: create trigger ... after insert or update or delete on <tabla>
--        for each row execute function private.audit_log_change('<claves>'[, '<excluidas>']);
--   arg 0: columnas de la clave, separadas por coma. Se unen con ':' para armar record_id
--          (por defecto 'id'; en tablas compuestas, 'user_id,role_id').
--   arg 1: columnas a excluir de old_data/new_data (D9; hoy ninguna).
-- SECURITY DEFINER para poder insertar en audit_logs, que no tiene GRANT de escritura.
-- AFTER, así no interfiere con set_updated_at. actor_id queda NULL si no hay auth.uid()
-- (migraciones, SQL Editor, servidor).

create or replace function private.audit_log_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_keys      text[] := string_to_array(coalesce(tg_argv[0], 'id'), ',');
  v_excluded  text[] := coalesce(string_to_array(tg_argv[1], ','), array[]::text[]);
  v_row       jsonb;
  v_old       jsonb;
  v_new       jsonb;
  v_record_id text;
begin
  if tg_op = 'DELETE' then
    v_row := to_jsonb(old);
  else
    v_row := to_jsonb(new);
  end if;

  -- record_id sobre la fila completa (la clave no se excluye aunque figure en v_excluded)
  select string_agg(v_row ->> k, ':' order by n)
    into v_record_id
    from unnest(v_keys) with ordinality as t(k, n);

  if tg_op in ('UPDATE', 'DELETE') then
    v_old := to_jsonb(old) - v_excluded;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    v_new := to_jsonb(new) - v_excluded;
  end if;

  insert into public.audit_logs (actor_id, action, table_name, record_id, old_data, new_data)
  values (auth.uid(), lower(tg_op), tg_table_name, v_record_id, v_old, v_new);

  return null; -- trigger AFTER: el valor de retorno se ignora
end;
$$;

-- Nadie debe poder invocarla desde la API (T5); solo la dispara el trigger.
revoke execute on function private.audit_log_change() from public, anon, authenticated, service_role;