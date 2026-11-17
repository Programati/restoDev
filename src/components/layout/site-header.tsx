import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          restoDev
        </Link>
        <nav aria-label="Principal">
          <Link href="/categories/new" className="text-sm font-medium hover:underline">
            Crear categoría
          </Link>
        </nav>
      </div>
    </header>
  )
}
