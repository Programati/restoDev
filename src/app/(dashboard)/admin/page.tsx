import { Suspense } from "react"

import { AccessDenied } from "@/components/layout/access-denied"
import { requirePagePermission } from "@/lib/auth/requirePagePermission"

// El contenido que lee cookies va dentro de <Suspense> por `cacheComponents`.
export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Cargando…</p>}>
      <AdminContent />
    </Suspense>
  )
}

async function AdminContent() {
  const access = await requirePagePermission(
    ["admin.access"],
    "No tenés permiso para entrar al panel de administración",
  )
  if (!access.ok) return <AccessDenied message={access.message} />

  const { supabase, user } = access

  // Nombre del perfil (la política `profiles_select_own` permite leer el propio)
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("AdminPage: no se pudo leer el perfil", error)
  }

  const name = profile?.full_name ?? user.email ?? "administrador"

  return (
    <section className="p-6">
      <h1 className="text-xl font-semibold">Hola {name}</h1>
    </section>
  )
}
