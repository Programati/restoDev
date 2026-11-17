import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { env } from "@/lib/env"

// Rutas públicas con prefijo. "/" se compara aparte, de forma exacta.
const PUBLIC_PATHS = ["/login"]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // No poner código entre createServerClient y getUser(): refresca la sesión.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = pathname === "/" || PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  // Redirige conservando las cookies de sesión que Supabase pudo haber refrescado.
  function redirectTo(path: string) {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = ""
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  // Sin sesión en una ruta privada → login
  if (!user && !isPublic) {
    return redirectTo("/login")
  }

  // Con sesión, la home pública y el login no tienen sentido → /admin
  if (user && (pathname === "/" || pathname === "/login")) {
    return redirectTo("/admin")
  }

  return supabaseResponse
}
