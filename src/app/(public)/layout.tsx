import type { ReactNode } from "react"
import { PublicHeader } from "@/components/layout/public-header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <SiteFooter />
    </div>
  )
}
