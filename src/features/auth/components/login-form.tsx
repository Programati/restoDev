"use client"

import { useRouter } from "next/navigation"
import { useState, type SubmitEvent } from "react"

import { loginAction } from "@/actions/auth/login.action"

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    const result = await loginAction({ email, password })
    if (!result.ok) {
      setError(result.error.message)
      setPending(false)
      return
    }

    // Éxito: dejar el formulario limpio para cuando se vuelva a /login.
    setPending(false)
    form.reset()
    router.replace("/admin")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  )
}
