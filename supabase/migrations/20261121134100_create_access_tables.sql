-- F2.2: tablas de roles y permisos. RLS activo y GRANT select desde la creación.
-- Las políticas de lectura se agregan en una migración posterior (F2.6): hasta entonces,
-- con RLS activo y sin políticas, nadie lee nada desde la API.

-- roles ---------------------------------------------------------------------------------------
create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  description text,
  is_system   boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint roles_code_format check (code ~ '^[a-z][a-z0-9_.-]{1,49}$'),
  constraint roles_name_length check (length(btrim(name)) between 2 and 60),
  constraint roles_description_length check (description is null or length(description) <= 250)
);

create unique index roles_name_lower_key on public.roles (lower(name));

create trigger roles_set_updated_at
  before update on public.roles
  for each row execute function public.set_updated_at();

alter table public.roles enable row level security;
grant select on public.roles to authenticated;

-- permissions (catálogo fijo, sembrado por migraciones) ---------------------------------------
create table public.permissions (
  code        text primary key,
  module      text not null,
  name        text not null,
  description text,

  constraint permissions_code_format check (code ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  constraint permissions_code_module check (starts_with(code, module || '.')),
  constraint permissions_name_length check (length(btrim(name)) between 2 and 80),
  constraint permissions_description_length check (description is null or length(description) <= 250)
);

create index permissions_module_name_idx on public.permissions (module, name);

alter table public.permissions enable row level security;
grant select on public.permissions to authenticated;

-- role_permissions (N:M) ----------------------------------------------------------------------
create table public.role_permissions (
  role_id         uuid not null references public.roles (id) on delete cascade,
  permission_code text not null references public.permissions (code)
                    on update cascade on delete restrict,

  primary key (role_id, permission_code)
);

create index role_permissions_permission_code_role_id_idx
  on public.role_permissions (permission_code, role_id);

alter table public.role_permissions enable row level security;
grant select on public.role_permissions to authenticated;

-- user_roles (N:M) ----------------------------------------------------------------------------
create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,

  primary key (user_id, role_id)
);

create index user_roles_role_id_user_id_idx on public.user_roles (role_id, user_id);

alter table public.user_roles enable row level security;
grant select on public.user_roles to authenticated;