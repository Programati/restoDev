import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <section role="status" aria-label="Cargando panel de administración" className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>

      <div className="max-w-md rounded-2xl border border-(--borde-sutil) bg-(--fondo-superficie) p-5">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <Skeleton className="mt-5 h-10 w-36 rounded-xl" />
      </div>

      <span className="sr-only">Cargando contenido...</span>
    </section>
  )
}
