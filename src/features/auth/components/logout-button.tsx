"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { logoutAction } from "@/actions/auth/logout.action"

export function LogoutButton() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleClick() {
    setError(null)

    startTransition(async () => {
      const result = await logoutAction()

      if (!result.ok) {
        setError(result.error.message)
        return
      }

      router.replace("/")
      router.refresh()
    })
  }

  return (
    <div className="flex min-w-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--boton-secundario-borde) bg-(--boton-secundario-fondo) px-3 py-2 text-sm font-medium text-(--boton-secundario-texto) transition-colors duration-200 hover:bg-(--fondo-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--foco) disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:px-4"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5M21 12H9" />
        </svg>

        <span>{pending ? "Saliendo..." : "Cerrar sesión"}</span>
      </button>

      {error && (
        <p role="alert" className="max-w-56 text-right text-xs text-(--error)">
          {error}
        </p>
      )}
    </div>
  )
}
