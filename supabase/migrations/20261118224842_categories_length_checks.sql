-- Límites de longitud alineados con createCategory.schema.ts (Zod).
-- name::text porque la columna es citext.
alter table public.categories
  add constraint categories_name_length
    check (char_length(btrim(name::text)) between 2 and 80),
  add constraint categories_icon_name_length
    check (icon_name is null or char_length(btrim(icon_name)) between 1 and 50),
  add constraint categories_slug_length
    check (char_length(slug) <= 100);