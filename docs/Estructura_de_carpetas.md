# Estructura de Carpetas

```
mi-proyecto/
├── .husky/pre-commit
├── docs/
│   ├── contracts/
│   │   ├── users/
│   │   │   ├── createUser.md
│   │   │   ├── deleteUser.md
│   │   │   ├── getUser.md
│   │   │   ├── listUsers.md
│   │   │   ├── updateUser.md
│   │   │   └── users.md
│   │   ├── _template.md
│   │   └── errors.md
│   │
│   ├── Contratos_de_actions.md
│   ├── Convenciones_de_archivos.md
│   ├── Estructura_de_carpetas.md
│   └── Stack_restoDev.md
├── eslint.config.mjs · .prettierrc · tsconfig.json · vercel.json · vitest.config.ts · playwright.config.ts
├── supabase/
│   ├── migrations/20261108_users_profiles.sql
│   └── functions/
├── tests/
│   ├── unit/users/
│   │   ├── createUser.service.test.ts
│   │   ├── getUser.service.test.ts
│   │   ├── listUsers.service.test.ts
│   │   ├── updateUser.service.test.ts
│   │   ├── deleteUser.service.test.ts
│   │   └── createUser.schema.test.ts
│   └── e2e/users.spec.ts
└── src/
    ├── middleware.ts
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── (auth)/login/page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx
    │   │   └── users/
    │   │       ├── page.tsx
    │   │       ├── loading.tsx
    │   │       ├── error.tsx
    │   │       ├── new/page.tsx
    │   │       └── [id]/
    │   │           ├── page.tsx
    │   │           └── edit/page.tsx
    │   └── api/
    │       ├── users/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       └── webhooks/whatsapp/route.ts
    ├── actions/
    │   └── users/
    │       ├── createUser.action.ts
    │       ├── getUser.action.ts
    │       ├── listUsers.action.ts
    │       ├── updateUser.action.ts
    │       └── deleteUser.action.ts
    ├── core/
    │   ├── services/
    │   │   └── users/
    │   │       ├── createUser.service.ts
    │   │       ├── getUser.service.ts
    │   │       ├── listUsers.service.ts
    │   │       ├── updateUser.service.ts
    │   │       ├── deleteUser.service.ts
    │   │       └── index.ts
    │   ├── schemas/
    │   │   └── users/
    │   │       ├── userId.schema.ts
    │   │       ├── createUser.schema.ts
    │   │       ├── updateUser.schema.ts
    │   │       ├── listUsers.schema.ts
    │   │       └── index.ts
    │   └── types/
    │       ├── users/user.types.ts
    │       ├── action-result.ts
    │       └── database.types.ts
    ├── features/
    │   └── users/
    │       ├── components/
    │       │   ├── users-table.tsx
    │       │   ├── users-table-skeleton.tsx
    │       │   ├── user-form.tsx
    │       │   ├── user-card.tsx
    │       │   ├── user-delete-dialog.tsx
    │       │   ├── user-avatar-upload.tsx
    │       │   └── users-command-menu.tsx
    │       ├── hooks/
    │       │   ├── useUsers.ts
    │       │   └── useUserMutations.ts
    │       └── query-keys.ts
    ├── components/
    │   ├── ui/
    │   ├── layout/ (sidebar.tsx, topbar.tsx, theme-toggle.tsx)
    │   └── providers/ (query-provider.tsx, theme-provider.tsx)
    └── lib/
        ├── supabase/ (client.ts, server.ts, middleware.ts)
        ├── api/ (response.ts, handle-error.ts)
        ├── errors.ts
        └── utils.ts
```
