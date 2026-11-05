# Deploying to Vercel

The app is a static-first Next.js 16 app with no server-side state, no database and no environment variables.

## Steps

1. Push the repository to GitHub.
2. In Vercel: **Add New → Project →** import the repo.
3. Settings:
   - **Root Directory:** `apps/web`
   - **Framework preset:** Next.js (auto-detected)
   - **Install Command:** `cd ../.. && pnpm install --frozen-lockfile`
   - **Build Command:** `pnpm build` (default) — Vercel runs it in `apps/web`
   - Enable **"Include files outside the root directory in the Build Step"** (needed for `packages/*` and `content/*`; `next.config.ts` already sets `outputFileTracingRoot` to the repo root).
   - Node.js version: 20 or 22.
4. Deploy. No environment variables are required.

## Launch checks

- `pnpm check` passes locally (typecheck, unit tests, validators, build).
- `pnpm build && CHROME_PATH=$(which google-chrome) pnpm test:e2e` passes.
- Response headers on the deployed site include `Content-Security-Policy` and `X-Content-Type-Options: nosniff`.
- Open `/coverage` and confirm the numbers match `content/curriculum/coverage-report.md`.

## When accounts are added (backlog)

Use a managed Postgres (Vercel Postgres/Neon/Supabase). Never store learner data in serverless memory. Lecture PDFs must remain private: serve them only to their owner through authenticated, non-guessable URLs, or keep them on the learner's device as today.
