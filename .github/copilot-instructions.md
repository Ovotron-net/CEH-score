# Copilot Instructions

## Commands

```bash
npm run dev          # Vite dev server (SPA mode)
npm run dev:ssr      # SSR dev server via Express (port 3000)
npm run generate     # Regenerate API clients from openapi.yaml (Orval)
npm run db:generate  # Generate a new Drizzle migration from schema changes
npm run db:migrate   # Apply pending migrations to the PostgreSQL database
npm run db:studio    # Open Drizzle Studio (visual DB browser)
npm run build        # tsc type-check + Vite build → dist/client/
npm run build:ssr    # Also builds SSR bundle → dist/server/
npm run lint         # ESLint
npm run preview      # Preview production build locally
```

No test runner is configured.

## Architecture

**CEH Score Tracker** is a React 19 + TypeScript SPA (with optional SSR) for tracking CEH v13 exam practice scores.

### Data flow

```
PostgreSQL (via Drizzle + pg)
    └── src/db/schema.ts              table definitions
        src/db/index.ts               db singleton (pg.Pool)
         └── src/server/routes/       Express routers — assessments, settings
              └── server.ts           mounts /api/assessments and /api/settings
               └── src/api/{assessments,settings}.ts   HTTP client wrappers
                    └── src/hooks/{useAssessments,useSettings}.ts   TanStack Query
                         └── src/pages/*.tsx
```

### Routing & layout

All routes are nested under a single `<Layout>` (`<Sidebar>` + `<Outlet>`). Pages are lazy-loaded via `React.lazy` in `AppRoutes.tsx`. `App.tsx` wraps everything in `<BrowserRouter basename={import.meta.env.BASE_URL}>` for GitHub Pages compatibility.

### SSR

`src/entry-server.tsx` renders via `renderToString` using `StaticRouter`. `server.ts` (Express) injects the result into `<!--app-html-->` in `index.html`. In dev it proxies through Vite middleware; in production it reads `dist/client/` and imports `dist/server/entry-server.js`.

### Deployment

Pushes to `master` trigger GitHub Actions: `npm run build` → deploys `dist/client/` to GitHub Pages.

## Drizzle ORM

**Dialect:** PostgreSQL via `pg` (node-postgres). Migrations are committed in `drizzle/`.

| File | Purpose |
|------|---------|
| `src/db/schema.ts` | Table definitions — `assessments` and `settings` |
| `src/db/index.ts` | `db` singleton (`drizzle(pool, { schema })`) |
| `drizzle.config.ts` | Drizzle Kit config (schema path, dialect, db credentials) |

**Connection** resolves in priority order: `DATABASE_PUBLIC_URL` → `DATABASE_URL` → assembled from `PGHOST`/`PGPORT`/`PGDATABASE`/`PGUSER`/`PGPASSWORD`.

**Schema mirrors the existing types** in `src/types/index.ts` — `Assessment` → `assessments` table, `UserSettings` → `settings` table (single-row, `id = 1`).

**Workflow for schema changes:**
1. Edit `src/db/schema.ts`
2. `npm run db:generate` — creates a new SQL file in `drizzle/`
3. `npm run db:migrate` — applies it to the local database
4. Commit both `src/db/schema.ts` and the new `drizzle/*.sql` file

**`src/db/` is server-only** — it is excluded from `tsconfig.app.json` and included in `tsconfig.node.json` (which has Node.js types). Never import from `src/db/` in browser code (`src/pages/`, `src/components/`, `src/hooks/`).

## Orval — API Code Generation

The OpenAPI spec lives at `openapi.yaml` (repo root). Orval is configured in `orval.config.ts` to generate TanStack Query hooks into `src/api/generated/`, split by tag:

```
src/api/generated/
├── assessments/assessments.ts   # useGetAssessments, useCreateAssessment, …
├── settings/settings.ts         # useGetSettings, useUpdateSettings
└── model/                       # Generated TypeScript interfaces (Assessment, UserSettings, …)
    ├── index.ts                 # barrel
    └── *.ts
```

**Do not edit files inside `src/api/generated/`** — they are overwritten by `npm run generate`.

The mutator (`src/api/mutator.ts`) bridges Orval's `customFetch(url, RequestInit)` call signature to the shared `API_BASE_URL` and `ApiError` from `src/api/client.ts`.

When the generated hooks are ready to use with the real backend, they can replace the hand-written hooks in `src/hooks/` — the pages need no changes.

## Key Conventions

### Adding a new page

1. Create `src/pages/MyPage.tsx`
2. Add a lazy import + `<Route>` in `AppRoutes.tsx` (inside the root `<Layout>` route)
3. Add a nav link in `src/components/Sidebar.tsx`

### Data hooks

Both hooks expose plain async wrappers over TanStack Query mutations — never return raw mutation objects:

```ts
// useAssessments returns:
{ assessments, isLoading, addAssessment, deleteAssessment, clearAll }

// useSettings returns:
{ settings, isLoading, updateSettings }
```

Cache is updated optimistically with `qc.setQueryData` — mutations do **not** trigger a server refetch.

`updateSettings` accepts a partial `UserSettings` and merges it: `mutation.mutate({ ...settings, ...updates })`.

### API modules

Exported as namespaces from `src/api/index.ts`:

```ts
export * as assessmentsApi from './assessments';
export * as settingsApi from './settings';
```

API modules (`src/api/*.ts`) are HTTP client wrappers — they call `request()` from `src/api/client.ts`. The actual DB logic lives in `src/server/routes/`. API modules guard SSR with `if (typeof window === 'undefined') return ...`.

### Adding a new API resource

1. Add the new paths and schemas to `openapi.yaml` and run `npm run generate`
2. Create `src/server/routes/myResource.ts` — Express router using `db` from `src/db/`
3. Mount it in `server.ts`: `app.use('/api/my-resource', myResourceRouter)`
4. Update `src/api/myResource.ts` to call `request()` for each operation
5. Re-export as namespace in `src/api/index.ts`

### Score & calculation logic

CEH pass threshold is **70%**. All score math is in `src/utils/calculations.ts` — use these helpers rather than inline logic:

| Helper | Purpose |
|--------|---------|
| `calculatePercentage(score, max)` | Returns rounded `%` |
| `isPassed(percentage)` | `>= 70` |
| `getScoreColor(percentage)` | Returns hex color |
| `getReadinessLevel(avgScore)` | Returns label string |
| `getAverageScore / getBestScore / getPassRate / getDaysToExam` | Aggregate stats |

Score color thresholds: ≥85% → `#00ff88`, ≥70% → `#00d4ff`, ≥60% → `#ffd700`, <60% → `#ff4444`.

### Assessment IDs

Generated as `` `assessment-${Date.now()}` `` at creation time.

### Design tokens

No CSS variables — values are used directly in Tailwind arbitrary classes and inline styles:

| Role | Value |
|------|-------|
| Page background | `#0a0e1a` |
| Card / surface | `#111827` |
| Border | `#1f2d40` |
| Primary — cyber green | `#00ff88` |
| Secondary — cyber blue | `#00d4ff` |
| Warning / pass line | `#ffd700` |
| Muted text | `#64748b` |

**Interactive element pattern** (buttons, links with accent color):
```
bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88]
```

**Card pattern**: `bg-[#111827] border border-[#1f2d40] rounded-xl p-6`

**Form input pattern**: `bg-[#0a0e1a] border border-[#1f2d40] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ff88]/50 outline-none transition-colors`

**Form label pattern**: `text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2`

### StatCard component

`StatCard` accepts a `color` prop (`'green' | 'blue' | 'yellow' | 'red' | 'purple'`) — use these named colors rather than raw hex in `StatCard` usages. It also accepts an optional `trend?: number` for showing ↑/↓ delta.

### Chart components

All charts in `src/components/charts/` accept `assessments: Assessment[]` as their primary prop and are self-contained (sort, filter, and map data internally). They use `ResponsiveContainer` from Recharts and custom tooltip components with the card/border design tokens.

### Domain data

`src/data/cehDomains.ts` exports `CEH_DOMAINS` (20 static `CEHDomain[]`) and the `FULL_EXAM` string constant used as the "all domains" option. Domain data is never mutated.

### Types

All shared types are in `src/types/index.ts`: `Assessment`, `CEHDomain`, `UserSettings`, `LeaderboardEntry`. Import from `'../types'` (the barrel), not individual files.
