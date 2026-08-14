# WYD Arena Tracker

PvP arena tracker for the game **WYD Global** — records results, winners and player statistics across the Champion and Aspirant divisions.

## The idea

WYD Global runs 4 arenas per day (1:00 PM, 7:00 PM, 8:30 PM and 11:00 PM) across two separate divisions. The game's public API only exposes cumulative season totals — there is no endpoint that returns per-arena results.

Arena Tracker works around this with a **snapshot diff** approach: after each arena, a cron job collects the current state of every player and compares it against the previous snapshot. Whoever's win counter went up won that arena. The kills, deaths and points for that arena are derived from the delta between the two snapshots.

At the month rollover the season resets, and the system detects this automatically by comparing the month of the previous snapshot against the current one — using the absolute values as the delta for the first arena of the new month.

## Features

- Arena listing with filters by date, time, division and winner
- Player rankings per division (Champion / Aspirant)
- Full per-player history with a month filter
- Player search by name, linking straight to their history
- Admin panel to trigger a manual sync
- Automatic cron runs 35 minutes after each arena

## Stack

### Monorepo

- **pnpm workspaces** with 4 packages: `apps/api`, `apps/web`, `packages/db`, `packages/shared`

### Backend (`apps/api`)

- **Hono** — lightweight HTTP framework for Node.js
- **Drizzle ORM** — type-safe queries with `postgres-js`
- **node-cron** — schedules the 4 daily syncs
- **PostgreSQL** — primary database
- HMAC-SHA256 auth, no JWT library

### Frontend (`apps/web`)

- **React 18** + **Vite**
- **TanStack Router** — file-based routing with search param support
- **TanStack Query** — data fetching and caching
- **TailwindCSS** — dark mode by default
- UI components built on **Radix UI** (Tabs, Popover, Calendar)
- **react-day-picker** + **date-fns** for the date picker

### Database (`packages/db`)

- Drizzle schema: `player`, `arena`, `arena_player_result`, `snapshot`, `player_snapshot`, `raw_snapshot`, `sync_execution`
- Versioned migrations

### Tests

- **Vitest** with 24 unit tests covering the delta logic, season reset detection and arena scheduling

## Environment variables

### API

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URL |
| `ADMIN_PASSWORD` | Admin panel password |
| `WEB_URL` | Frontend URL in production (CORS) |
| `TZ` | Server timezone — use `America/Sao_Paulo` |

### Web

| Variable | Description |
|---|---|
| `VITE_API_URL` | API URL in production |

## Running locally

```bash
# install dependencies
pnpm install

# start the database
docker compose up -d

# run migrations
pnpm db:migrate

# start api + web in parallel
pnpm dev
```

## Tests

```bash
pnpm test
```

## Deploy

Hosted on **Railway** as two services:

- **API** — Node.js, command `pnpm db:migrate && pnpm --filter @wyd/api start`
- **Web** — static Vite build via `RAILPACK_SPA_OUTPUT_DIR=apps/web/dist`
