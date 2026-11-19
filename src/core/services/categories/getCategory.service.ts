import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/core/types/database.types"
import type { CategoryDetail, GetCategoryDto } from "@/core/types/categories/category.types"
import { ServiceError } from "@/lib/errors"

const DETAIL_COLUMNS = "id, name, slug, icon_name, display_order, active, deleted_at"

export async function getCategory(
  supabase: SupabaseClient<Database>,
  dto: GetCategoryDto,
): Promise<CategoryDetail> {
  let query = supabase.from("categories").select(DETAIL_COLUMNS).eq("id", dto.id)

  // Una categoría dada de baja se comporta como inexistente salvo que se pida include_deleted
  if (!dto.include_deleted) query = query.is("deleted_at", null)

  const { data, error } = await query.maybeSingle()

  if (error) {
    if (error.code === "42501") {
      throw new ServiceError("FORBIDDEN", "No tenés permiso para ver categorías")
    }
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }

  if (!data) {
    throw new ServiceError("NOT_FOUND", "Categoría no encontrada")
  }

  return data
}
