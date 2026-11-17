import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Outfit } from "next/font/google"
import "../app/globals.css"

// export const metadata: Metadata = {
//   title: "restoDev",
//   description: "Sistema de gestión para restaurantes",

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "RestoDev | Gestión gastronómica",
  description:
    "Gestioná pedidos, productos, ventas y operaciones de tu restaurante desde una sola plataforma.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // TODO(front): agregar suppressHydrationWarning cuando se instale next-themes.
    <html lang="es" className={`${outfit.variable} h-full antialiased`}>
      {/* TODO(front): fuente de la marca con next/font, asignada como clase en <body> */}
      <body>
        {/* TODO(front): envolver {children} con ThemeProvider y QueryProvider (src/components/providers/). */}
        {children}
        {/* </body> TODO(front): montar <Toaster /> de Sonner una sola vez acá.  */}
      </body>
    </html>
  )
}
