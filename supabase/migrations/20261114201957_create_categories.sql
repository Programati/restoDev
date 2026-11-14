-- Extensión para nombres sin distinción de mayúsculas/minúsculas
create extension if not exists citext with schema extensions;

create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          extensions.citext not null unique,
  slug          text not null unique,
  icon_name     text,
  display_order integer not null default 0,
  active        boolean not null default true,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users (id),

  constraint categories_name_not_blank check (btrim(name::text) <> ''),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint categories_display_order_check check (display_order >= 0)
);

-- Mantiene updated_at al día en cada UPDATE
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- RLS activo desde la creación
alter table public.categories enable row level security;

-- PROVISORIA: cualquier usuario con sesión puede leer y escribir.
-- TODO(roles): reemplazar por políticas que exijan rol admin para escribir.
create policy "categories_provisional_authenticated_all"
  on public.categories
  for all
  to authenticated
  using (true)
  with check (true);