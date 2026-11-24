-- F4.4 (parte 2): auditoría de categories. La baja lógica es un UPDATE (deleted_at),
-- así que se registra como action 'update'. Sin columnas excluidas (D9).

create trigger audit_categories
  after insert or update or delete on public.categories
  for each row execute function private.audit_log_change('id');