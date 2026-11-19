import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/core/types/database.types"
import type { CategoryListItem, ListCategoriesDto } from "@/core/types/categories/category.types"
import { ServiceError } from "@/lib/errors"

// % y _ son comodines de LIKE: se escapan para buscarlos como texto literal
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&")

const LIST_COLUMNS = "id, name, slug, icon_name, display_order, active, deleted_at"

export async function listCategories(
  supabase: SupabaseClient<Database>,
  dto: ListCategoriesDto,
): Promise<CategoryListItem[]> {
  let query = supabase.from("categories").select(LIST_COLUMNS)

  // Por defecto solo categorías vigentes; las dadas de baja se incluyen solo si se pide
  if (!dto.include_deleted) query = query.is("deleted_at", null)
  if (dto.active !== undefined) query = query.eq("active", dto.active)
  if (dto.search) query = query.ilike("name", `%${escapeLike(dto.search)}%`)

  const { data, error } = await query
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    if (error.code === "42501") {
      throw new ServiceError("FORBIDDEN", "No tenés permiso para ver categorías")
    }
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }

  return data
}
