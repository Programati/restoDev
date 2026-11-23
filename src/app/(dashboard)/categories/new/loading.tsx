import { Skeleton } from "@/components/ui/skeleton"

export default function NewCategoryLoading() {
  return (
    <section
      role="status"
      aria-label="Cargando formulario de categoría"
      className="mx-auto w-full max-w-xl space-y-6"
    >
      <Skeleton className="h-8 w-48" />

      <div className="space-y-4">
        {[1, 2, 3].map((field) => (
          <div key={field} className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}

        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-5 w-14" />
        </div>

        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      <span className="sr-only">Cargando formulario...</span>
    </section>
  )
}
