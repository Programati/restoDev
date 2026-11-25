"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useState, type ReactNode } from "react"

import { LogoutButton } from "@/features/auth/components/logout-button"

type AdminShellProps = {
  children: ReactNode
}

type SidebarContentProps = {
  onNavigate?: () => void
}

function CategoriesIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname()
  const isCategoriesActive = pathname.startsWith("/categories")

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-18 shrink-0 items-center px-6">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--foco)"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-(--marca-principal) text-base font-semibold text-(--texto-sobre-marca)">
            R
          </span>
          <span className="text-lg font-semibold tracking-tight text-(--blanco)">RestoDev</span>
        </Link>
      </div>

      <div className="mx-5 border-t border-(--tinta)" />

      <nav aria-label="Navegación del panel" className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-3 px-3 text-[11px] font-medium tracking-wider text-(--humo) uppercase">
          Gestión
        </p>

        <Link
          href="/categories/new"
          onClick={onNavigate}
          aria-current={isCategoriesActive ? "page" : undefined}
          className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--foco) motion-reduce:transition-none ${
            isCategoriesActive
              ? "bg-(--tinta) text-(--blanco)"
              : "text-(--humo) hover:bg-(--tinta) hover:text-(--blanco)"
          }`}
        >
          <span className={isCategoriesActive ? "text-(--marca-principal)" : ""}>
            <CategoriesIcon />
          </span>
          <span>Categorías</span>
        </Link>
      </nav>

      <div className="mx-5 border-t border-(--tinta)" />

      <div className="px-6 py-5">
        <p className="text-xs text-(--humo)">RestoDev</p>
      </div>
    </div>
  )
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const pageTitle = pathname.startsWith("/categories") ? "Categorías" : "Administración"

  function openMenu() {
    if (!dialogRef.current || dialogRef.current.open) return

    dialogRef.current.showModal()
    setMenuOpen(true)
  }

  function closeMenu() {
    dialogRef.current?.close()
    setMenuOpen(false)
  }

  return (
    <div className="flex min-h-dvh bg-(--fondo-pagina) font-sans text-(--texto-principal)">
      {/* Sidebar de escritorio */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-(--carbon) lg:flex">
        <SidebarContent />
      </aside>

      {/* Área principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-17 shrink-0 items-center justify-between gap-4 border-b border-(--borde-sutil) bg-(--fondo-superficie) px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menú de navegación"
              aria-controls="admin-mobile-menu"
              aria-expanded={menuOpen}
              onClick={openMenu}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-(--texto-principal) transition-colors duration-200 hover:bg-(--fondo-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--foco) motion-reduce:transition-none lg:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>

            <span className="truncate text-base font-semibold tracking-tight">{pageTitle}</span>
          </div>

          <LogoutButton />
        </header>

        <main
          id="contenido-principal"
          className="w-full min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>

      {/* Menú móvil con diálogo nativo */}
      <dialog
        id="admin-mobile-menu"
        ref={dialogRef}
        aria-label="Menú de navegación"
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeMenu()
          }
        }}
        className="fixed inset-0 m-0 h-dvh max-h-dvh w-[min(20rem,88vw)] max-w-none border-0 bg-(--carbon) p-0 text-(--blanco) shadow-(--sombra-elevada) backdrop:bg-(--superposicion) open:flex open:flex-col lg:hidden"
      >
        <div className="absolute top-4 right-3 z-10">
          <button
            type="button"
            autoFocus
            aria-label="Cerrar menú"
            onClick={closeMenu}
            className="flex size-10 items-center justify-center rounded-xl text-(--blanco) transition-colors duration-200 hover:bg-(--tinta) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--foco) motion-reduce:transition-none"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <SidebarContent onNavigate={closeMenu} />
      </dialog>
    </div>
  )
}
