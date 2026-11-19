# Shared requests from Builder 4 (Days 22 to 28)

Nothing outside `src/viz/day-22` to `src/viz/day-28` and `tests/e2e/day-22.spec.ts` to `day-28.spec.ts` was edited. These are the shared changes the days need, for the scaffold owner.

1. **Redactor (care rule 4): add these third-party names to `THIRD_PARTY_NAMES` and `REDACTED_NAMES_FOR_TESTS` in `src/lib/data/redact.ts`.**
   - `Jules Theodore` (a sex worker named in Day 24's exhibits and key points: "Flight records for escort Jules Theodore").
   - `Escort 'Paul' and 'Anton'` (Day 22 `people`; first names of escorts).
   Until then, Builder 4's `redact()` in `src/viz/day-22/kit.tsx` covers them for Days 22 to 28. Other days that print Day 24's exhibits (the index, the sources page) are not covered.

2. **`useQuietMotion()` throws without `window.matchMedia`** (jsdom, so the shared registry test crashes for any day whose client component uses it). Please guard it: `if (typeof window.matchMedia !== 'function') return`. Days 23, 24 and 27 use an identical guarded copy, `src/viz/day-22/useQuiet.ts`, until then.

3. **Cross-day sources on day pages.** The sources panel lists only the day's own sources, but several pictures cite other days' records (Day 22 uses Days 17 to 21; Day 24 uses Days 1, 21 to 26 and the verdict record; Day 27 uses Days 2, 17, 24, 25). Builder 4 lists those once under each picture (`CrossDaySources` in `kit.tsx`, with `id="source-<id>"` so the page test's check passes). A shell-level "Sources from other days" section, fed by the day module, would be cleaner.

4. **The registry test expects exactly one `<table>`** (`getByRole('table')`). Builder 4's text versions therefore use one table (the day's figures) plus labelled lists for their other listings. Consider `getAllByRole('table')[0]` so text versions can carry more than one data table.

5. **Playwright browsers.** The container has no Playwright browser download; e2e was run by pointing Playwright's expected Chromium path at the system Chrome (`/usr/bin/google-chrome`). CI will need `npx playwright install chromium`.
