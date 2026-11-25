-- F3.5 (D3): borrar un usuario ya no queda bloqueado por categories.updated_by.
alter table public.categories
  drop constraint categories_updated_by_fkey,
  add constraint categories_updated_by_fkey
    foreign key (updated_by) references auth.users (id)
    on delete set null;