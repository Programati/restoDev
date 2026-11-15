"use client"

import { useState, useTransition, type SubmitEvent } from "react"

import { createCategoryAction } from "@/actions/categories/createCategory.action"
import type { ActionResult } from "@/core/types/action-result"
import type { Category } from "@/core/types/categories/category.types"

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages || messages.length === 0) return null

  return (
    <p id={id} className="text-sm text-red-600">
      {messages[0]}
    </p>
  )
}

export function CategoryForm() {
  const [name, setName] = useState("")
  const [iconName, setIconName] = useState("")
  const [displayOrder, setDisplayOrder] = useState("")
  const [active, setActive] = useState(true)
  const [result, setResult] = useState<ActionResult<Category> | null>(null)
  const [pending, startTransition] = useTransition()

  const fieldErrors = result && !result.ok ? result.error.fieldErrors : undefined

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(null)

    // Campo vacío = "no enviado": icon_name -> null, display_order -> se omite (default 0)
    const input = {
      name,
      icon_name: iconName === "" ? null : iconName,
      display_order: displayOrder === "" ? undefined : Number(displayOrder),
      active,
    }

    startTransition(async () => {
      const res = await createCategoryAction(input)
      setResult(res)

      if (res.ok) {
        setName("")
        setIconName("")
        setDisplayOrder("")
        setActive(true)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.name)}
          aria-describedby="name-error"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <FieldError id="name-error" messages={fieldErrors?.name} />
      </div>

      <div className="space-y-1">
        <label htmlFor="icon_name" className="text-sm font-medium">
          Ícono (opcional)
        </label>
        <input
          id="icon_name"
          name="icon_name"
          type="text"
          value={iconName}
          onChange={(event) => setIconName(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.icon_name)}
          aria-describedby="icon_name-error"
          placeholder="cup-soda"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <FieldError id="icon_name-error" messages={fieldErrors?.icon_name} />
      </div>

      <div className="space-y-1">
        <label htmlFor="display_order" className="text-sm font-medium">
          Orden (opcional, por defecto 0)
        </label>
        <input
          id="display_order"
          name="display_order"
          type="number"
          step="any"
          value={displayOrder}
          onChange={(event) => setDisplayOrder(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.display_order)}
          aria-describedby="display_order-error"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <FieldError id="display_order-error" messages={fieldErrors?.display_order} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="active"
          name="active"
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
        />
        <label htmlFor="active" className="text-sm font-medium">
          Activa
        </label>
      </div>

      {result && !result.ok && (
        <p role="alert" className="rounded-md border border-red-600 p-3 text-sm text-red-600">
          {result.error.code}: {result.error.message}
        </p>
      )}

      {result?.ok && (
        <p role="status" className="rounded-md border border-green-600 p-3 text-sm text-green-600">
          {result.message}: &quot;{result.data.name}&quot; (slug: {result.data.slug})
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Creando..." : "Crear categoría"}
      </button>
    </form>
  )
}
