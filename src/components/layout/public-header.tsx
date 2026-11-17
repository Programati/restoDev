import Link from "next/link"

export function PublicHeader() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          restoDev
        </Link>
        <nav aria-label="Principal">
          <Link
            href="/login"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
