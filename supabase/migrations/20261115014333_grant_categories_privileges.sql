-- Permisos de tabla para la Data API. RLS decide qué filas; el GRANT decide si se puede entrar.
-- Sin DELETE a propósito: la única eliminación permitida es la baja lógica (deleted_at).
grant select, insert, update on public.categories to authenticated;