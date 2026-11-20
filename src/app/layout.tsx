import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Outfit } from "next/font/google"
import "./globals.css"

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
      <body>{children}</body>
    </html>
  )
}
