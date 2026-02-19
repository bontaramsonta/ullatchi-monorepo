# AGENTS.md

Ullatchi — Chennai-focused community news platform.

## Structure

Turborepo + Bun workspaces (`bun@1.3.9`)

| Workspace | Stack | Port |
|-----------|-------|------|
| `apps/web` | React 19, Vite, Tailwind v4, TanStack Query | 3000 |
| `apps/api` | Elysia (Bun runtime) | 3001 |
| `apps/cms` | Sanity Studio v5 | — |
| `packages/types` | Zod schemas + TS types (`@ullatchi/types`) | — |

## Rules

- **Bun only** — never npm/pnpm
- **Shared types** — `@ullatchi/types` workspace package; pattern: `export const fooSchema = z.object({...})` + `export type Foo = z.infer<typeof fooSchema>`
- **Naming** — files: `kebab-case`; components: `PascalCase`; functions: `camelCase`
- **Imports** — web uses `@/*` path alias; use `import type` for type-only imports (`verbatimModuleSyntax: true`)
- **API routes** — each in `src/routes/*.ts`, exported as Elysia instance with `/api` prefix
- **Validation** — Elysia `t` for runtime + Zod for business logic
- **Errors** — `{ error: string }` with appropriate status codes
- **Data flow** — frontend reads Sanity CDN directly; writes go through API
- **Location** — Chennai bounds validation on all location endpoints
- **Styling** — Tailwind v4; `cn()` from clsx + tailwind-merge; UI components in `src/components/ui/` (shadcn/base-ui + CVA)
- **Env** — `.env` gitignored; no `.env.example` committed
- **Turbo** — `build`: cached, `dependsOn: [^build]`; `dev`: no cache, persistent
- **CMS custom components** — add to `apps/cms/components/`
- **CMS schemas** — add to `schemaTypes/index.ts` AND to `sanity.config.ts` structure to appear in sidebar
