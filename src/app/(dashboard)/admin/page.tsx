import Link from "next/link"

export default function AdminPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bienvenido a RestoDev</h1>
        <p className="text-sm text-(--texto-secundario)">
          Gestioná tu restaurante desde un solo lugar.
        </p>
      </div>
    </section>
  )
}
