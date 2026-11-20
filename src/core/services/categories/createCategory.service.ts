import type { SupabaseClient } from "@supabase/supabase-js"

import type { Category, CreateCategoryDto } from "@/core/types/categories/category.types"
import type { Database } from "@/core/types/database.types"
import { ServiceError } from "@/lib/errors"

import { resolveCategorySlug } from "./resolveCategorySlug.service"

const MAX_INSERT_ATTEMPTS = 3

export async function createCategory(
  supabase: SupabaseClient<Database>,
  dto: CreateCategoryDto,
  userId: string,
): Promise<Category> {
  // Reintenta solo si otra petición ocupó el mismo slug entre la consulta y el insert
  for (let attempt = 1; attempt <= MAX_INSERT_ATTEMPTS; attempt++) {
    const slug = await resolveCategorySlug(supabase, dto.name)

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: dto.name,
        slug,
        icon_name: dto.icon_name ?? null,
        display_order: dto.display_order,
        active: dto.active,
        deleted_at: null,
        updated_by: userId,
      })
      .select()
      .single()

    if (!error) return data

    // 23505 = unique_violation. `error.message` trae el nombre de la constraint
    // (p. ej. categories_slug_key / categories_name_key), no el valor duplicado.
    if (error.code === "23505") {
      if (error.message.includes("slug")) continue
      throw new ServiceError("CONFLICT", "Ya existe una categoría con ese nombre")
    }

    // 42501 = insufficient_privilege (RLS rechazó la escritura)
    if (error.code === "42501") {
      throw new ServiceError("FORBIDDEN", "No tenés permiso para crear categorías")
    }

    console.error("createCategory: falló el insert", error)
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }

  console.error("createCategory: no se pudo reservar un slug único")
  throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
}
