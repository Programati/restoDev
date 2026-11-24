-- F1: base de identidad. Tabla profiles (1 a 1 con auth.users), RLS, GRANT y trigger de alta.

create type public.profile_status as enum ('pending', 'active', 'inactive');

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null,
  phone       text,
  avatar_path text,
  status      public.profile_status not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint profiles_full_name_length check (length(btrim(full_name)) between 2 and 120),
  constraint profiles_phone_length check (phone is null or length(phone) <= 30)
);

create index profiles_status_idx on public.profiles (status);

-- Reutiliza public.set_updated_at() (creada en la migración de categories)
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS activo desde la creación
alter table public.profiles enable row level security;

-- Cada usuario lee solo su propio perfil. Quien tenga users.manage leerá todos (se agrega en F2).
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- Solo lectura desde la API. Sin INSERT/UPDATE/DELETE: el alta la hace el trigger y las
-- ediciones llegarán por RPC (D4). RLS filtra filas, no columnas, por eso no se da UPDATE.
grant select on public.profiles to authenticated;

-- Alta automática del perfil al crearse un usuario en Auth (D7).
-- Nace 'pending' solo si el alta viene marcada como invitación en raw_app_meta_data
-- (el usuario no puede editar ese campo); en cualquier otro caso nace 'active'.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  v_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );
  v_name := btrim(left(v_name, 120));

  -- El CHECK exige 2 a 120 caracteres: este respaldo evita que el alta falle en Auth
  if length(v_name) < 2 then
    v_name := 'Usuario';
  end if;

  insert into public.profiles (id, full_name, status)
  values (
    new.id,
    v_name,
    case
      when coalesce(new.raw_app_meta_data ->> 'invited', '') = 'true'
        then 'pending'::public.profile_status
      else 'active'::public.profile_status
    end
  );

  return new;
end;
$$;

-- Por defecto EXECUTE es de public: sin esto cualquiera podría invocarla desde la API
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();