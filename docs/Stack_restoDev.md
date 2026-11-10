# Stack

Respetar cada ítem. No sustituir tecnologías ni agregar alternativas.

## 1. Entorno y Core

- [ ] Gestor de paquetes: `pnpm`
- [ ] Lenguaje: TypeScript con `"erasableSyntaxOnly": true` en `tsconfig.json` (sin `enum` ni `namespace`)
- [ ] Framework: Next.js (App Router)
- [ ] UI: React
- [ ] Calidad: ESLint + Prettier + Husky + lint-staged (pre-commit: `lint-staged` sobre archivos en staging y luego `typecheck`)
- [ ] Verificación local: `pnpm check` (format:check, lint, typecheck) y `pnpm check:full` (suma `build`)

## 2. Enrutamiento y Comunicación

- [ ] Flujo web interno: Server Actions → Servicios en `src/core/services/`
- [ ] Flujo externo y webhooks: Route Handlers en `app/api/` → mismos Servicios

## 3. Supabase

- [ ] Base de datos: PostgreSQL
- [ ] Seguridad: RLS en todas las tablas
- [ ] Auth: Supabase Auth con `@supabase/ssr` (cookies, Middleware)
- [ ] Archivos: Supabase Storage
- [ ] Tiempo real: Supabase Realtime
- [ ] Lógica remota: RPC para funciones SQL complejas; Edge Functions para tareas aisladas

## 4. Estado y Validación

- [ ] Validación y DTOs: Zod, esquemas compartidos entre cliente, Server Actions y BD
- [ ] Fetch inicial: Server Components
- [ ] Fetch cliente: TanStack Query, solo en Client Components con re-fetching continuo o paginación interactiva

## 5. Diseño y Estilos

- [ ] CSS: Tailwind CSS
- [ ] Componentes base: shadcn/ui
- [ ] Accesibilidad: Radix UI (vía shadcn/ui)
- [ ] Temas: `next-themes` (claro/oscuro)

## 6. Componentes UI

- [ ] Iconos: Lucide React
- [ ] Paleta de comandos: `cmdk`
- [ ] Notificaciones: shadcn/ui + Sonner
- [ ] Carga: shadcn/ui `<Skeleton>`
- [ ] Carruseles: Swiper

## 7. Dominio

- [ ] Gráficos y dashboards: Recharts
- [ ] Reportes Excel: `exceljs` o `xlsx`, generados en Route Handler (`.xlsx`)
- [ ] Geolocalización: `navigator.geolocation`
- [ ] Cotización de rutas: SerpApi (direcciones y distancias de Google Maps)
- [ ] Mensajería: WhatsApp Cloud API (Meta) para mensajes automatizados; enlaces `wa.me` para redirección

## 8. Testing

- [ ] Unitarias y lógica: Vitest
- [ ] Integración y E2E: Playwright

## 9. Infraestructura

- [ ] Hosting: Vercel
- [ ] `vercel.json` (Free Tier):
  - [ ] `maxDuration` de Serverless Functions: 10 s
  - [ ] Comando `build` ajustado a límites de memoria
  - [ ] Headers de caché Stale-While-Revalidate
