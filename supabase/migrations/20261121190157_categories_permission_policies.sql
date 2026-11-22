-- F3.2: políticas de categories basadas en permisos (la provisoria sigue activa).

-- Lectura: categories.manage ve todo; categories.read ve solo las activas.
create policy categories_select_by_permission
on public.categories
for select
to authenticated
using (
  (select private.has_permission('categories.manage'))
  or (
    deleted_at is null
    and (select private.has_permission('categories.read'))
  )
);

-- Alta
create policy categories_insert_by_permission
on public.categories
for insert
to authenticated
with check (
  (select private.has_permission('categories.manage'))
);

-- Modificación (incluye la baja lógica)
create policy categories_update_by_permission
on public.categories
for update
to authenticated
using (
  (select private.has_permission('categories.manage'))
)
with check (
  (select private.has_permission('categories.manage'))
);

-- Sin política de DELETE.

