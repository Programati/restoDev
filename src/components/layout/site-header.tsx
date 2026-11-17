import { LogoutButton } from "@/features/auth/components/logout-button"
import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/admin" className="text-lg font-bold">
          restoDev
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-4">
          <Link href="/categories/new" className="text-sm font-medium hover:underline">
            Crear categoría
          </Link>
          <LogoutButton />
        </nav>
      </div>
    </header>
  )
}
