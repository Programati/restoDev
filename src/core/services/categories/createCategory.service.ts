import type { SupabaseClient } from "@supabase/supabase-js"

import type { Category, CreateCategoryDto } from "@/core/types/categories/category.types"
import type { Database } from "@/core/types/database.types"
import { ServiceError } from "@/lib/errors"

const FALLBACK_SLUG = "categoria"
const MAX_INSERT_ATTEMPTS = 3

// "Bebidas sin Alcohol!" -> "bebidas-sin-alcohol"
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Busca slugs ocupados (incluidos los de categorías dadas de baja: no se filtra por
// `deleted_at`) y devuelve `base`, o `base-2`, `base-3`... el primero libre.
async function resolveUniqueSlug(
  supabase: SupabaseClient<Database>,
  base: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("categories")
    .select("slug")
    .or(`slug.eq.${base},slug.like.${base}-*`)

  if (error) {
    console.error("createCategory: no se pudo consultar los slugs existentes", error)
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }

  const taken = new Set(data.map((row) => row.slug))
  if (!taken.has(base)) return base

  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix++
  return `${base}-${suffix}`
}

export async function createCategory(
  supabase: SupabaseClient<Database>,
  dto: CreateCategoryDto,
  userId: string,
): Promise<Category> {
  const baseSlug = slugify(dto.name) || FALLBACK_SLUG

  // Reintenta solo si otra petición ocupó el mismo slug entre la consulta y el insert
  for (let attempt = 1; attempt <= MAX_INSERT_ATTEMPTS; attempt++) {
    const slug = await resolveUniqueSlug(supabase, baseSlug)

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
