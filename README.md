# Wrapped

Wrapped is a private, browser-based analyzer for your Spotify Extended
Streaming History. Import your Spotify data export to explore long-term
listening habits, favorite tracks and artists, yearly trends, and detailed
play history.

All processing happens locally in your browser. DuckDB-WASM runs the analytics
queries and stores the imported history as a parquet snapshot in OPFS, so your
listening data never leaves your device.

**Live app:** [ruxxzebre.github.io/wrapped](https://ruxxzebre.github.io/wrapped)

## Features

- Listening summaries and year-in-review reports
- Top tracks and artists with detailed breakdowns
- Listening calendar, play log, and library views
- Time-of-day and weekday listening patterns
- Year-over-year comparisons
- Local, private data processing with no backend

## Usage

1. Request your **Extended Streaming History** at
   [spotify.com/account/privacy](https://www.spotify.com/account/privacy/)
   (takes a few days; the regular "account data" export is not enough).
2. Open the app and drop the `my_spotify_data.zip` onto the import screen.
3. Explore: summary, top tracks/artists, per-track and per-artist detail,
   play log, listening calendar, time-of-day/weekday patterns, year review,
   library, and year-over-year comparison.

Re-importing replaces the existing database. Timezone for hour/weekday views
is configurable in Settings.

## Stack

React 19 + Vite + TypeScript. Styling via vanilla-extract, data via TanStack
Query/Router/Virtual, charts via Recharts. DuckDB-WASM (with Apache Arrow)
for queries, fflate for unpacking the export zip in the browser. The WASM and
worker bundles are vite-bundled, so the deployed app is fully static and
same-origin — no CDN fetches, no COOP/COEP headers required.

## Development

Package manager is **pnpm** (pinned via `packageManager`).

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

- `pnpm build` — typecheck + production build into `dist/`
- `pnpm preview` — serve the production build locally
- `pnpm check` — Biome lint + format + import sort, with `--write`

## Data notes

- `ts` in the Spotify export is playback **stop** time, UTC. Hour/weekday
  views use start time converted to the configured timezone.
- Skip analytics use `skipped OR reason_end = 'fwdbtn'` — the raw `skipped`
  column is false/null before ~2022 and silently undercounts.
- Video and podcast history files in the export are ignored; only audio
  streams are imported.
