import { CategoryForm } from "@/features/categories/components/category-form"

export default function NewCategoryPage() {
  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Nueva categoría</h1>
      <CategoryForm />
    </main>
  )
}
