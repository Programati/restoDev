import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "restoDev",
  description: "Sistema de gestión para restaurantes",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // TODO(front): agregar suppressHydrationWarning cuando se instale next-themes.
    <html lang="es">
      {/* TODO(front): fuente de la marca con next/font, asignada como clase en <body>. */}
      <body>
        {/* TODO(front): envolver {children} con ThemeProvider y QueryProvider
            (src/components/providers/). */}
        {children}
        {/* TODO(front): montar <Toaster /> de Sonner una sola vez acá. */}
      </body>
    </html>
  )
}
