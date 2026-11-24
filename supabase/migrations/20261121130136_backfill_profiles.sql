-- F1.6: crea el perfil de los usuarios que ya existían en auth.users antes del trigger.
-- Idempotente: no toca perfiles existentes.

insert into public.profiles (id, full_name, status)
select
  u.id,
  case when length(n.name) >= 2 then n.name else 'Usuario' end,
  'active'::public.profile_status
from auth.users u
cross join lateral (
  select btrim(left(
    coalesce(
      nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(u.email, ''), '@', 1)
    ),
    120
  )) as name
) n
on conflict (id) do nothing;


-- Este SQL crea el perfil de los usuarios que ya existían antes del trigger del alta de usuarios. El trigger solo actúa sobre usuarios nuevos, así que sin el backfill tu admin@resto.test se habría quedado sin perfil.