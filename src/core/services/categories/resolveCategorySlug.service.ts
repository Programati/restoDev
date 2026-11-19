import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/core/types/database.types"
import { ServiceError } from "@/lib/errors"

const FALLBACK_SLUG = "categoria"

// "Bebidas sin Alcohol!" -> "bebidas-sin-alcohol"
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Genera el slug de una categoría a partir de su nombre y resuelve colisiones: devuelve `base`,
// o `base-2`, `base-3`... el primero libre.
//
// Revisa todas las filas, incluidas las de categorías dadas de baja (no se filtra por
// `deleted_at`), porque `slug` es único entre todos los registros.
//
// `excludeId`: al modificar una categoría se pasa su `id` para que su propio slug no cuente como
// ocupado. Al crear no se pasa.
//
// Es un chequeo previo, no una reserva: el UNIQUE de la base es la garantía real. Quien llama
// debe reintentar si el INSERT/UPDATE falla por `categories_slug_key`.
export async function resolveCategorySlug(
  supabase: SupabaseClient<Database>,
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name) || FALLBACK_SLUG

  // `base` solo contiene [a-z0-9-], por lo que es seguro dentro del filtro `or`
  let query = supabase.from("categories").select("slug").or(`slug.eq.${base},slug.like.${base}-*`)
  if (excludeId) query = query.neq("id", excludeId)

  const { data, error } = await query

  if (error) {
    console.error("resolveCategorySlug: no se pudo consultar los slugs existentes", error)
    throw new ServiceError("INTERNAL_ERROR", "Error inesperado. Intentá de nuevo")
  }

  const taken = new Set(data.map((row) => row.slug))
  if (!taken.has(base)) return base

  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix++
  return `${base}-${suffix}`
}
