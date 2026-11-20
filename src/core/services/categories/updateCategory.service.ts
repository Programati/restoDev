import type { SupabaseClient } from "@supabase/supabase-js"

import type { CategoryDetail, UpdateCategoryDto } from "@/core/types/categories/category.types"
import type { Database } from "@/core/types/database.types"
import { ServiceError } from "@/lib/errors"

import { resolveCategorySlug } from "./resolveCategorySlug.service"

const DETAIL_COLUMNS = "id, name, slug, icon_name, display_order, active, deleted_at"
const MAX_UPDATE_ATTEMPTS = 3

export async function updateCategory(
  supabase: SupabaseClient<Database>,
  dto: UpdateCategoryDto,
  userId: string,
): Promise<CategoryDetail> {
  const { id, ...changes } = dto

  // Reintenta solo si otra petición ocupó el mismo slug entre la consulta y el update
  for (let attempt = 1; attempt <= MAX_UPDATE_ATTEMPTS; attempt++) {
    // Si cambia el name, el slug se regenera excluyendo a esta misma categoría (su slug actual no
    // cuenta como ocupado). Si no cambia el name, el slug no se toca.
    const slug =
      dto.name !== undefined ? await resolveCategorySlug(supabase, dto.name, id) : undefined

    // Los campos omitidos llegan como `undefined` y no viajan en el JSON: no se modifican.
    // Sin filtro por `deleted_at`: también se modifican las categorías dadas de baja, para poder
    // liberar su name y su slug. `deleted_at` no es editable desde esta operación.
    const { data, error } = await supabase
      .from("categories")
      .update({ ...changes, ...(slug !== undefined && { slug }), updated_by: userId })
      .eq("id", id)
      .select(DETAIL_COLUMNS)
      .maybeSingle()

    if (!error) {
      // Sin filas afectadas: no existe o RLS la oculta
      if (!data) throw new ServiceError("NOT_FOUND", "Categoría no encontrada")
      return data
    }

    // 23505 = unique_violation. `error.message` trae el nombre de la constraint
    // (categories_slug_key / categories_name_key). La base nunca compara una fila contra sí misma.
    if (error.code === "23505") {
      if (error.message.includes("slug")) continue
      throw new ServiceError("CONFLICT", "Ya existe una categoría con ese nombre")
    }

    // 42501 = insufficient_privilege (RLS rechazó la escritura)
    if (error.code === "42501") {
      throw new ServiceError("FORBIDDEN", "No tenés permiso para modificar categorías")
    }

    console.error("updateCategory: falló el update", error)
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }

  console.error("updateCategory: no se pudo reservar un slug único")
  throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
}
