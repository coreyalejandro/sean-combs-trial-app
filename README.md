# The Combs Trial: An Interactive Timeline

A day-by-day data-story site for the 28 days of the 2025 federal trial of Sean Combs (May 12 to June 30, 2025). Each day has a summary, one interactive chart, and a short analysis.

Live site: https://sean-combs-trial-app.pages.dev (Cloudflare Pages, deployed from the `main` branch)

## How it is built

- Next.js 14 (App Router) with `output: 'export'`: `npm run build` writes a fully static site to `out/`.
- The day text lives in the committed SQLite file `prisma/dev.db`. Prisma reads it at build time only; the live site has no server and no database.
- The search box reads `/trial-days.json`, which is generated at build time.

## Run it locally

```bash
npm ci --legacy-peer-deps   # also runs `prisma generate`
npm run dev                 # http://localhost:3000
```

Build and preview the static site:

```bash
npm run build               # writes out/
npm start                   # serves out/ at http://localhost:3000
```

No secrets or environment variables are needed. `.env.example` shows the only setting (`DATABASE_URL="file:./dev.db"`).

## Cloudflare Pages settings

- Build command: `npm ci --legacy-peer-deps && npm run build`
- Build output directory: `out`
- Environment variable: `NODE_VERSION=22`

## Data note

The day summaries are text records. Several charts use values typed into their components as illustrative placeholders (for example the Day 2 incident list, Day 11 percentages and Day 28 session dates); they are not yet sourced from court records.
