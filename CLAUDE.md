# Claude Instructions for Sean Combs Trial App

## Project overview
A static Next.js 14 site (exported to `out/`, hosted on Cloudflare Pages from `main`) telling the 2025 Combs trial in 29 visualizations. Design: `DESIGN_29.md` (outside the repo); per-day design in `src/viz/day-NN/README.md`. Rules for builders: `CONTRIBUTING-VIZ.md`.

## Commands
- Install: `npm ci`
- Dev server: `npm run dev`
- Typecheck: `npm run typecheck`
- Unit tests and the no-hand-typed-numbers scan: `npm test`
- Lint: `npm run lint`
- Build (static export): `npm run build`
- Page tests (after a build): `npm run test:e2e`
- Rebuild the witness table after the data changes: `npm run build:witnesses`

## Data
- One source of facts: `src/data/trial_days.json` (copied unchanged from the research file). Never type a fact into a component.
- Read data only through `@/lib/data`.

## Key guidelines
- `main` deploys publicly. Work on branches; never push to `main` without Corey's go-ahead.
- Run typecheck, `npm test`, lint, build and e2e before considering work complete.
- Follow the care rules in `CONTRIBUTING-VIZ.md` (no graphic detail, pseudonyms only, no third-party names, sources on every number).
- Never commit changes unless explicitly asked.
