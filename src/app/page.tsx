import Image from "next/image" // logo
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col bg-(--fondo-pagina) font-sans text-(--texto-principal)">
      {/* Encabezado */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-12">
        <Link
          href="/"
          aria-label="RestoDev - Inicio"
          className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--foco)"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-(--marca-principal) text-base font-semibold text-(--texto-sobre-marca)">
            R
          </span>

          <span className="text-lg font-semibold tracking-tight">RestoDev</span>
        </Link>

        <Link
          href="/login"
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-(--texto-secundario) transition-colors duration-200 hover:bg-(--fondo-hover) hover:text-(--texto-principal) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--foco) motion-reduce:transition-none"
        >
          Acceder
        </Link>
      </header>

      {/* Contenido principal */}
      <section className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-16">
        {/* Hero */}
        <div className="flex flex-col items-start">
          <h1 className="max-w-xl text-4xl leading-[1.12] font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-[3.75rem]">
            Todo tu restaurante,
            <span className="block text-(--marca-principal)">en un solo lugar.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 font-normal text-(--texto-secundario) sm:text-lg sm:leading-8">
            Simplificá la gestión de pedidos, productos, ventas y operaciones diarias desde una
            plataforma diseñada para hacer crecer tu negocio.
          </p>

          <Link
            href="/login"
            className="mt-9 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-(--boton-primario-fondo) px-6 py-3 text-sm font-medium text-(--boton-primario-texto) transition-all duration-200 hover:bg-(--boton-primario-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--foco) active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
          >
            Iniciar sesión
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </Link>
        </div>

        {/* Espacio para imagen del software */}
        <div className="relative flex w-full items-center justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-8 rounded-full bg-(--marca-clara) blur-3xl"
          />

          <div className="relative flex aspect-5/4 w-full max-w-xl flex-col overflow-hidden rounded-[22px] border border-(--borde-sutil) bg-(--fondo-superficie) shadow-(--sombra-elevada)">
            <div className="relative aspect-5/4 w-full max-w-xl overflow-hidden rounded-[22px] border border-(--borde-sutil) bg-(--fondo-superficie) shadow-(--sombra-elevada)">
              <Image
                src="/hero-restodev.webp"
                alt="Vista general del software de gestión RestoDev"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-(--texto-terciario)">
        RestoDev · Gestión simple, negocios inteligentes.
      </footer>
    </main>
  )
}
