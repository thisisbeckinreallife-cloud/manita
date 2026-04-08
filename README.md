# Vibe Workspace

A Manus-inspired operator workspace for building and shipping software from
task-scoped conversations. The product spine is:

> Project -> Folder -> Task -> Task Chat -> Attachments -> Model Selection ->
> GitHub Repo Bootstrap -> Railway Deploy -> Right-Hand Preview/Deploy Truth

See `CLAUDE.md` for the full project constitution, domain model, and
non-negotiable product rules. See `HANDOFF.md` for the current phase state,
approved decisions, and sandbox gotchas.

## Current posture

This is a **single-user** workspace. There is no login surface. `src/server/users.ts`
exports `getOrCreateDefaultUser`, which every request hits. The deploy path
that matches this posture is Path B: ship SQLite on a persistent volume, keep
the URL **private** (Railway private networking, a VPN, or a basic-auth proxy
in front). Multi-user Postgres + real session auth are deferred — the
rationale lives in Claude Code's auto-memory for this project, not in the
repo tree.

## Prerequisites

- Node.js 20+
- npm (this repo does not use pnpm; see `HANDOFF.md` §6)
- An Anthropic API key for the task runner (optional — the product renders
  honest `FAILED` rows with `PROVIDER_TOKEN_NOT_CONFIGURED` when missing)

## Environment variables

The app reads these at runtime. None of them are committed.

| Variable                  | Required             | Purpose |
|---------------------------|----------------------|---------|
| `DATABASE_URL`            | always               | Prisma datasource. Local: `file:./dev.db`. Railway: point at a persistent-volume path, e.g. `file:/data/dev.db`. |
| `ANTHROPIC_API_KEY`       | for real runs        | Anthropic Messages API key. Either this OR `ANTHROPIC_API_KEY_FILE`. |
| `ANTHROPIC_API_KEY_FILE`  | alternative          | Path to a file containing the key (preferred for local dev — see `scripts/set-anthropic-key.py`). |
| `GITHUB_TOKEN`            | for repo bootstrap   | GitHub PAT for repository-link bootstrap. Missing -> honest `GITHUB_TOKEN_NOT_CONFIGURED` on the repo card. |
| `RAILWAY_TOKEN`           | for deploy trigger   | Railway API token for deploy-run trigger. Missing -> honest `RAILWAY_TOKEN_NOT_CONFIGURED` on the deploy card. |
| `BASIC_AUTH_USER`         | when running the built app | Username for the HTTP basic-auth gate in `src/middleware.ts`. The middleware runs in every build — dev and prod. Missing -> every request returns 503 (fail-closed). |
| `BASIC_AUTH_PASS`         | when running the built app | Password for the basic-auth gate. Same fail-closed behavior as `BASIC_AUTH_USER`. |

For local dev, create a `.env` file at the project root — Prisma reads it
automatically at runtime, and so does Next.js. At minimum it must contain:

```sh
DATABASE_URL="file:./dev.db"
```

Add the other variables as needed. Inside the Claude Code sandbox the harness
blocks writes to `.env` files, so `.claude/launch.json` injects `DATABASE_URL`
and `ANTHROPIC_API_KEY_FILE` into the dev-server process env directly instead.

## Install and migrate

After creating `.env`:

```sh
npm install
npm run db:generate
npm run db:migrate
```

## Run the dev server

```sh
npm run dev
```

Inside the Claude Code sandbox, use `preview_start` (name: `next-dev`) instead
of `npm run dev` directly.

## Validation gate

Run this before declaring any slice done:

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

All four must be clean. `build` reads `DATABASE_URL` from `.env`; if you do
not have a `.env`, prefix the command with `DATABASE_URL="file:./dev.db"`
inline.

## Deploy notes (Railway, Path B)

This is the minimum posture. Do not skip the "must be private" caveat.

1. **Create a Railway service** pointing at this repo. Autodetect emits a
   Next.js build. `railway.json` overrides the start command so every
   deploy runs `npx prisma migrate deploy && npm start` — new migrations
   apply automatically on boot.
2. **Attach a persistent volume** and mount it at `/data` (or wherever you
   prefer). SQLite files do not survive container restarts without a volume.
3. **Set environment variables** in the Railway UI:
   - `DATABASE_URL=file:/data/dev.db` (or your mount path)
   - `ANTHROPIC_API_KEY=...`
   - `GITHUB_TOKEN=...`
   - `RAILWAY_TOKEN=...`
   - `BASIC_AUTH_USER=...`
   - `BASIC_AUTH_PASS=...`
4. **The basic-auth gate is fail-closed.** `src/middleware.ts` denies every
   request with 503 if `BASIC_AUTH_USER` or `BASIC_AUTH_PASS` is unset. This
   is the Path B enforcement of "must be private" — the moment you delete
   those env vars, the deploy bricks instead of silently exposing the app.
   Treat it as the only gate and pick a strong password. If Railway has a
   healthcheck configured against `/`, the 503 will trigger the restart
   policy (`restartPolicyMaxRetries: 3` in `railway.json`) and the service
   will go hard-down within seconds — which is intentional, but do not
   rotate `BASIC_AUTH_PASS` casually.
5. **Backups are manual.** SQLite on a volume means you are responsible for
   snapshotting the volume. There is no `pg_dump` equivalent built in.

When the day comes that you need a second user, lift the auth + Postgres
deferral tracked in Claude Code's auto-memory for this project and ship the
Postgres + session auth slice. Path B does not lock that out — it just does
not pay for it today.
