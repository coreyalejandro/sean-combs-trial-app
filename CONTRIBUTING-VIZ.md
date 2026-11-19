# Contributing a day's visualization

This app tells the 2025 federal trial of Sean Combs in 29 pictures: one per testimony day (Days 1 to 28), then the verdict, then the finale march. The design is `DESIGN_29.md` (kept outside the repo, at `/mnt/user-data/outputs/combs-trial/DESIGN_29.md`); each day's part of it is copied into `src/viz/day-NN/README.md`.

Builders: read `BUILDER_BRIEF.md` first. This file is the short rulebook.

## What you own, and nothing else

| Builder | Days | Folders |
|---|---|---|
| Builder 1 | 1 to 7 | `src/viz/day-01/` to `src/viz/day-07/` |
| Builder 2 | 8 to 14 | `src/viz/day-08/` to `src/viz/day-14/` |
| Builder 3 | 15 to 21 | `src/viz/day-15/` to `src/viz/day-21/` |
| Builder 4 | 22 to 28 | `src/viz/day-22/` to `src/viz/day-28/` |
| Finale porter | verdict, 29 | `src/app/verdict/`, `src/app/finale/`, `src/viz/finale/`, `public/finale-data/`, `tests/e2e/finale.spec.ts` |

You may also add `tests/e2e/day-NN.spec.ts` for your days.

**Shared kits.** Each builder's helpers now live in `src/viz/kits/` (`days-01-07/`, `days-08-14/`, `days-15-21/`, `days-22-28/`), imported as `@/viz/kits/<folder>/...`. They are held to the same lint and literal rules as the day folders. Changes there affect seven days at once: run every day's tests.

**Never edit:** `package.json`, `package-lock.json`, `next.config.js`, `tsconfig.json`, `.eslintrc.json`, `src/app/**` (except the finale porter's two folders), `src/components/shell/**`, `src/viz/registry.ts`, `src/viz/types.ts`, `src/lib/**`, `src/styles/**`, `src/data/**`, `scripts/**`, `tests/unit/**`, `tests/e2e/pages.spec.ts`. Need a change there (a helper, a shared fact, a package)? Ask the scaffold owner.

## Allowed libraries (already installed, versions pinned)

| Package | Version | Use |
|---|---|---|
| react, react-dom | 18.3.1 | UI |
| next | 14.2.35 | Framework (static export) |
| d3 | 7.9.0 | Scales, shapes, hierarchy (treemap), force, geo |
| d3-sankey | 0.12.3 | Day 15 |
| @observablehq/plot | 0.6.17 | Simpler charts (Days 8, 13, 18, 21, 22), with `ariaLabel` / `ariaDescription` |
| topojson-client | 3.1.0 | Map shapes |
| us-atlas | 3.0.1 | U.S. outlines (Days 6, 17, 27) |
| world-atlas | 2.0.2 | Insets (Jamaica, London) |
| scrollama | 3.2.0 | Scroll steps, only where a day uses them |
| deck.gl, @deck.gl/react | 9.1.14 | Finale only |
| zod | 3.25.76 | Validation |

Test tools: vitest 3.2.4, @testing-library/react 16.3.0, jsdom 26.1.0, @playwright/test 1.63.0, @axe-core/playwright 4.11.0. No other packages. Fonts (Libre Franklin, IBM Plex Mono) are self-hosted and already loaded.

## The contract

`src/viz/day-NN/index.tsx` exports:

- `default`: the picture, `({ n, day }: DayVizProps) => JSX`. A server component: draw the SVG from data so it is in the static HTML. Put interaction in a `'use client'` child in the same folder.
- `TextVersion`: the long description and data table, built from the same selection as the picture.
- `meta` (re-exported from `meta.ts`): title, question, form, content level, caption, how-to-read line, short text alternative, `status`.
- `extraSources(day)` (optional): every source the page cites that is not in the day's own list (another day's record, the verdict record, `additions.json`), in the order the picture numbers them. The shell's Sources panel lists them after the day's own, numbered on from them, with `id="source-<id>"`; repeats (same id, or the same article under another id) are listed once and still resolve. Do not list sources inside the picture.

The shell (`DayShell`) places them in this order: cover band, charge ribbon, content note, figure (question, picture, caption, how to read, short description), "Text version", "Also in court today", sources, trial rail. You do not render any of that yourself.

## Rules that tests enforce

1. **No hand-typed numbers.** `npm run check:literals` fails on numeric literals other than -1, 0, 1, 2 in your code (day folders and `src/viz/kits/`), and on any string that contains a value from `trial_days.json` (`"$100,000"`, `"2016-03-05"`). Layout constants come from `src/lib/viz/layout.ts`. "Day 15" style references are fine. Numbers in `meta.ts` copy must exist in the data. The finale (`src/viz/finale/`, plus the verdict and finale pages) is a map engine, so engine constants are allowed there, but text it prints must not contain a value from its data (`summary.json`, `public/finale-data/meta.json`).
2. **Facts come from the data.** Read them with `getDay`, `getDays`, `getWitnesses`, `getCharges`, `getVerdict` from `@/lib/data`. Facts the data lacks go in your `additions.json` with sources (validated by `tests/unit/additions.test.ts`; "high" needs two outlet families).
3. **Sources and confidence are shown.** Tag every number you print with `Cite` or `SourceRef` (`data-source-ids`; every id must resolve on the page, checked for all 28 days by `tests/unit/registry.test.tsx` and the page tests), and show `ConfidenceMark` (solid = two or more outlets; hollow = one outlet; dashed = one outlet, unconfirmed; split = outlets disagree).
4. **Renders from data.** Your render test must show the output changes when the record changes (remove a figure, double an amount).
5. **Accessible and safe.** axe finds no serious or critical issues; no sideways scroll at 390 px; works without JavaScript (picture or table in the HTML); quiet mode shows still frames; no third-party names; no "accuser" label.

## Commands

**RUN IN THE REPO FOLDER**

```bash
npm ci                 # once
npm run dev            # http://localhost:3000/day/1/
npm run typecheck
npm test               # literal scan + unit tests
npm run lint
npm run build          # static export to out/
npm run test:e2e       # page tests at 1280 px and 390 px against out/
```

Page tests need a Chromium for Playwright: run `npx playwright install chromium` once (CI must do this too). The finale map draws WebGL in software in the test browser, so its tests run one at a time on the desktop project with longer timeouts.

## Definition of done (per day)

Renders only from `trial_days.json` (plus your sourced `additions.json`); question is the heading; caption, how-to-read line, short and long descriptions and table present; confidence marks shown; passes keyboard, screen reader (axe), colour-blind (no red/green pairs, lightness differs, words not colour alone), 390 px, quiet mode and no-JavaScript checks; render and data-change tests pass; `meta.status` set to `'done'`; follows every care rule in `BUILDER_BRIEF.md`.
