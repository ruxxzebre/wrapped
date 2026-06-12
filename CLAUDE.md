# Frontend

React 19 + Vite + TypeScript SPA. Styling via vanilla-extract, data via TanStack Query/Table/Virtual, charts via Recharts.

## Tooling

- Package manager: **pnpm** (pinned via `packageManager` in package.json). Never use npm/yarn; never create package-lock.json.
- Lint/format: **Biome** (biome.json). React rules enabled via `domains.react: recommended`. Tabs, double quotes.

## Commands

- `pnpm dev` — dev server
- `pnpm build` — tsc + vite build
- `pnpm lint` / `pnpm lint:fix` — lint check / autofix
- `pnpm format` / `pnpm format:check` — format write / check-only
- `pnpm check` — combined lint + format + import sort, with `--write`

After editing code, run `pnpm check` and fix remaining diagnostics.

## Docker

Dockerfile builds with pnpm (corepack) and serves `dist/` via Caddy, proxying `/api` to the backend container.
