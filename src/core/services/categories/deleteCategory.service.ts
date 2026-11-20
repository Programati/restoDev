import type { SupabaseClient } from "@supabase/supabase-js"

import type { CategoryDetail, DeleteCategoryDto } from "@/core/types/categories/category.types"
import type { Database } from "@/core/types/database.types"
import { ServiceError } from "@/lib/errors"

const DETAIL_COLUMNS = "id, name, slug, icon_name, display_order, active, deleted_at"

// Baja lógica: completa `deleted_at` y `updated_by`. Nunca borra la fila (la tabla ni siquiera
// tiene GRANT de DELETE) y no toca ningún otro campo. Solo se puede dar de baja una categoría
// vigente que ya esté inactiva (`active = false`): una categoría activa hay que desactivarla antes
// con updateCategory.
export async function deleteCategory(
  supabase: SupabaseClient<Database>,
  dto: DeleteCategoryDto,
  userId: string,
): Promise<CategoryDetail> {
  // Las condiciones (vigente e inactiva) van dentro del mismo UPDATE, no en una consulta previa:
  // así la baja es atómica. Si dos peticiones simultáneas intentan dar de baja la misma categoría,
  // solo una encuentra la fila vigente; la otra no afecta ninguna fila.
  const { data, error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), updated_by: userId })
    .eq("id", dto.id)
    .is("deleted_at", null)
    .eq("active", false)
    .select(DETAIL_COLUMNS)
    .maybeSingle()

  if (error) {
    // 42501 = insufficient_privilege (RLS o GRANT rechazaron la escritura)
    if (error.code === "42501") {
      throw new ServiceError("FORBIDDEN", "No tenés permiso para dar de baja categorías")
    }

    // TODO(products): cuando exista `products`, la base rechazará la baja si la categoría tiene
    // productos activos (trigger o función). Traducir ese error acá a CONFLICT con un mensaje que
    // indique el motivo.

    console.error("deleteCategory: falló la baja", error)
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }

  if (data) return data

  // Ninguna fila afectada: no existe (o RLS la oculta), ya estaba dada de baja o sigue activa.
  // Se consulta sin filtros para distinguir los casos.
  const { data: existing, error: lookupError } = await supabase
    .from("categories")
    .select("id, active, deleted_at")
    .eq("id", dto.id)
    .maybeSingle()

  if (lookupError) {
    if (lookupError.code === "42501") {
      throw new ServiceError("FORBIDDEN", "No tenés permiso para dar de baja categorías")
    }
    console.error("deleteCategory: falló la consulta de existencia", lookupError)
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }

  if (!existing) throw new ServiceError("NOT_FOUND", "Categoría no encontrada")

  // Se revisa primero la baja previa: una categoría ya dada de baja se informa como tal aunque
  // además esté activa.
  if (existing.deleted_at !== null) {
    throw new ServiceError("CONFLICT", "La categoría ya está dada de baja")
  }

  throw new ServiceError("CONFLICT", "Desactivá la categoría antes de darla de baja")
}
