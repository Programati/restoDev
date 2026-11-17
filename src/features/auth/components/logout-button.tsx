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
      router.push("/")
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
      >
        {pending ? "Saliendo..." : "Salir"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
