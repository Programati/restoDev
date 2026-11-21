# Estructura de Carpetas

```
restoDev/
├── .husky/
│   └── pre-commit
├── docs/
│   ├── contracts/
│   │   ├── auth/
│   │   │   ├── Contract_auth.md
│   │   │   ├── Contract_login.md
│   │   │   └── Contract_logout.md
│   │   ├── categories/
│   │   │   ├── Contract_categories.md
│   │   │   ├── Contract_createCategory.md
│   │   │   ├── Contract_deleteCategory.md
│   │   │   ├── Contract_getCategory.md
│   │   │   ├── Contract_listCategories.md
│   │   │   └── Contract_updateCategory.md
│   │   ├── Contract_errors.md
│   │   └── Contract_template.md
│   ├── database/
│   │   ├── model/
│   │   │   ├── Model_audit_log.md
│   │   │   ├── Model_category.md
│   │   │   ├── Model_permission.md
│   │   │   ├── Model_profile.md
│   │   │   ├── Model_role.md
│   │   │   ├── Model_role_permission.md
│   │   │   ├── Model_template.md
│   │   │   └── Model_user_role.md
│   │   ├── DER_identidad_acceso_auditoria.html
│   │   └── supabase-cli.md
│   ├── historias_de_usuario/
│   │   ├── categories/
│   │   │   ├── HU_actualizar_categoria.md
│   │   │   ├── HU_crear_categoria.md
│   │   │   ├── HU_eliminar_categoria.md
│   │   │   ├── HU_listar_categoria.md
│   │   │   └── HU_obtener_categoria.md
│   │   └── HU_template.md
│   ├── Contratos_de_actions.md
│   ├── Convenciones_de_archivos.md
│   ├── Estructura_de_carpetas.md
│   ├── Git_workflow.md
│   ├── Guia_de_desarrollo_de_funcionalidades.md
│   ├── Plan_identidad_y_permisos.md
│   ├── Reglas_de_negocio.md
│   └── Stack_restoDev.md
├── src/
│   ├── actions/
│   │   ├── auth/
│   │   │   ├── login.action.ts
│   │   │   └── logout.action.ts
│   │   └── categories/
│   │       ├── createCategory.action.ts
│   │       ├── deleteCategory.action.ts
│   │       ├── getCategory.action.ts
│   │       ├── listCategories.action.ts
│   │       └── updateCategory.action.ts
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   │   └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── categories/
│   │   │       └── route.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── layout/
│   │       ├── public-header.tsx
│   │       ├── site-footer.tsx
│   │       └── site-header.tsx
│   ├── core/
│   │   ├── schemas/
│   │   │   ├── auth/
│   │   │   │   ├── index.ts
│   │   │   │   └── login.schema.ts
│   │   │   └── categories/
│   │   │       ├── createCategory.schema.ts
│   │   │       ├── deleteCategory.schema.ts
│   │   │       ├── getCategory.schema.ts
│   │   │       ├── index.ts
│   │   │       ├── listCategories.schema.ts
│   │   │       └── updateCategory.schema.ts
│   │   ├── services/
│   │   │   ├── auth/
│   │   │   │   ├── index.ts
│   │   │   │   ├── login.service.ts
│   │   │   │   └── logout.service.ts
│   │   │   └── categories/
│   │   │       ├── createCategory.service.ts
│   │   │       ├── deleteCategory.service.ts
│   │   │       ├── getCategory.service.ts
│   │   │       ├── index.ts
│   │   │       ├── listCategories.service.ts
│   │   │       ├── resolveCategorySlug.service.ts
│   │   │       └── updateCategory.service.ts
│   │   └── types/
│   │       ├── auth/
│   │       │   └── auth.types.ts
│   │       ├── categories/
│   │       │   └── category.types.ts
│   │       ├── action-result.ts
│   │       └── database.types.ts
│   ├── features/
│   │   ├── auth/
│   │   │   └── components/
│   │   │       ├── login-form.tsx
│   │   │       └── logout-button.tsx
│   │   └── categories/
│   │       └── components/
│   │           └── category-form.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── middleware.ts
│   │   │   └── server.ts
│   │   ├── env.ts
│   │   └── errors.ts
│   └── proxy.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20261114201957_create_categories.sql
│   │   ├── 20261115014333_grant_categories_privileges.sql
│   │   ├── 20261118224842_categories_length_checks.sql
│   │   ├── 20261121130112_create_profiles.sql
│   │   └── 20261121130136_backfill_profiles.sql
│   ├── .gitignore
│   └── config.toml
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── AGENTS.md
├── eslint.config.mjs
├── lint-staged.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── PROGRESO.md
├── README.md
└── tsconfig.json
```
