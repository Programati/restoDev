-- F5.3: protege los roles del sistema (is_system = true). Vale para todos, incluidas las
-- migraciones y el SQL Editor: no depende de auth.uid(). Va en trigger y no solo en RPC para que
-- no se pueda saltear por la Data API.

create or replace function private.protect_system_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Solo se protegen las filas que ya eran del sistema
  if not old.is_system then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    raise exception 'No se puede borrar un rol del sistema'
      using errcode = '23514';
  end if;

  if new.code is distinct from old.code then
    raise exception 'No se puede cambiar el code de un rol del sistema'
      using errcode = '23514';
  end if;

  if not new.is_active then
    raise exception 'No se puede desactivar un rol del sistema'
      using errcode = '23514';
  end if;

  -- Sin esto, bastaría pasar is_system a false para luego borrar o desactivar el rol
  if new.is_system is distinct from old.is_system then
    raise exception 'No se puede cambiar el flag is_system de un rol del sistema'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

-- Nadie debe poder invocarla desde la API; solo la dispara el trigger
revoke execute on function private.protect_system_roles()
  from public, anon, authenticated, service_role;

create trigger roles_protect_system
  before update or delete on public.roles
  for each row execute function private.protect_system_roles();