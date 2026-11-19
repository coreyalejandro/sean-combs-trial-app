# Integration notes: all 29 visualizations on one branch

The five builder branches were merged into `v2-29-visualizations` and the shared requests they filed (`SHARED_REQUEST.md` in `src/viz/day-01`, `day-08`, `day-15`, `day-22` and `finale`) were worked through. Those files are removed; this file records what was done with each request.

## Merges

| Branch | Commit | Days | Conflicts |
|---|---|---|---|
| `viz-days-01-07` | `bc94d13` | 1 to 7 | none |
| `viz-days-08-14` | `797a4f6` | 8 to 14 | none |
| `viz-days-15-21` | `c7942bd` | 15 to 21 | none |
| `viz-days-22-28` | `41675ec` | 22 to 28 | none |
| `viz-finale` | `a42d96a` | verdict and 29 | none |

Each builder owned separate folders, so every merge applied cleanly.

## Shared requests and what was done

### Quiet mode hook crashed in unit tests (Builders 1 and 4)
`useQuietMotion()` and `useMediaQuery()` in `src/lib/viz/motion.ts` now check that `window.matchMedia` exists. The two stand-in copies (`day-01/kit/useQuiet.ts`, `day-22/useQuiet.ts`) were deleted and Days 3, 6, 7, 23, 24 and 27 now use the shared hook.

### Sources from other days had nowhere to be listed (Builders 1 to 4)
- A day module may now export `extraSources(day)`: the other days' records, verdict sources and `additions.json` sources its page cites, in footnote order (`src/viz/types.ts`, `ExtraSource`; wired through `src/viz/registry.ts`).
- `DayShell` passes them to `SourcesPanel`, which lists them under "Also used on this page: other days' records and added facts", numbered on from the day's own list, each marked with where it came from.
- Repeats are removed: an extra source with the same id as one already listed is skipped; one with the same web address under another id is not listed twice, but its id still gets an anchor inside the matching list item, so every link resolves.
- The four in-picture lists (Builder 1 `ExtraSources`, Builder 2 `ExtraSources`, Builder 3 `ExtraSources`, Builder 4 `CrossDaySources`) were removed; each kit now hands its list to the shell (`toExtraSources`, `bookExtras`, `extrasFrom`, `crossDayExtras`).
- Days 1 to 7 used letters (a, b, c) for these sources; they now use the panel's numbers. Days 22 to 28 printed raw source ids (`[d24s1]`) as link text; they now print the outlet's name. The shared `Cite` component numbered sources by their place in another day's list, which did not match the page; it now takes `numbered={false}` for other days' figures (used on Days 23 and 24) and shows the outlet's name.
- New check: `tests/unit/registry.test.tsx` renders every day with its Sources panel and requires each `data-source-ids` id to resolve to exactly one anchor, and no anchor id to repeat.

### Source ids were not unique across days (Builder 2)
Day 2's `nbc13` and `fox13` and Day 3's `fox14` named different articles from Days 13 and 14's ids. They were renamed in `src/data/trial_days.json` to `nbc02`, `fox02` and `fox03` (and in `src/viz/day-27/additions.json`, which cites the Day 2 pair). `allSources()` now de-duplicates by web address and `sourceById()` searches every day; a new data test fails if any id names two articles. New helper `sourceHome(id)` says which day lists a source.

### `formatValue` rounded cents away (Builder 3)
`formatUSD` keeps cents when an amount has them ($10.50, $795.63) and `formatValue` writes rate units in words ("$10.50 per hour"). Tested in `tests/unit/format.test.ts`.

### Names the redactor did not cover (Builders 2 and 4)
`src/lib/data/redact.ts` now also hides: Jules Theodore (Day 24 exhibits, key points, people); the escort pseudonyms 'Paul', 'Anton' and 'Cabrel' (Days 19, 20, 22); and Mia's later employer, which the Day 14 discrepancy line and key points named (privacy: it could identify her). The Day 14 Sources panel now reads "Her later job: 6 months (Fox) vs 8 months (NBC)". Builder 4's extra redaction list in its kit was removed (the shared redactor covers it). `REDACTED_NAMES_FOR_TESTS` lists all of these; `tests/unit/redact.test.ts` runs the redactor over every string in the data file, and the page tests use the shared list.

### Day 11 mistrial motion sourcing (Builder 2)
The Day 11 record said the mistrial motion was reported only by NBC, but its own notes for Global News and ABC News 4 say the motion was denied. The discrepancy line and legal event now say so; the struck fingerprint testimony stays single-sourced (NBC).

### Registry test allowed only one table (Builders 1 and 4)
`tests/unit/registry.test.tsx` uses the first table (`getAllByRole('table')[0]`), so a text version may carry more than one.

### Shared helpers lived in day folders (Builders 1, 2 and 3)
The four builder kits moved to `src/viz/kits/` (`days-01-07`, `days-08-14`, `days-15-21`, `days-22-28`), imported as `@/viz/kits/...`. The two identical `OpenOnHash` helpers became unused once the in-picture source lists were gone and were deleted. The kits are held to the same lint (`no-magic-numbers`) and literal-scan rules as the day folders. The four kits keep their own APIs; merging them into one is left for later.

### Finale requests
- **Folder names:** `BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` now list `src/viz/finale/` and `public/finale-data/`.
- **Literal scan scope:** `scripts/check-viz-literals.mjs` now scans `src/viz/kits/`, `src/viz/finale/` and the verdict and finale pages. The finale is a map engine, so its engine and layout constants are allowed; instead, text it prints must not contain a value from its data (`summary.json`, `public/finale-data/meta.json`). This found two hand-typed "1,000 people" per dot (map label, verdict turn), now read from the data.
- **WebGL test timing:** the shared page tests that open `/finale/` (render, axe, screenshot) get 180 seconds.

### Not done, with reasons
- **Per-item source ids on key points, exhibits and legal events (Builder 1)** and **immunity day per witness (Builder 3):** these are data additions that need a research pass; nothing in the app is wrong without them, and the builders' fallbacks mark the weaker confidence.
- **Named layout constants (Builders 2 and 3):** the builders already derive sizes from `layout`; adding unused names would not change anything.
- **Strict additions schema (Builder 2):** the schema is not strict, so the extra fields are accepted; no change needed.
- **Playwright browsers (Builder 4):** documented in `CONTRIBUTING-VIZ.md`; CI must run `npx playwright install chromium`.

## Consistency pass across all 29
- Navigation runs Day 1 to Day 28, then the verdict, then the finale: every day page's "Next day" link, the trial rail (its last two marks now have full accessible names: "Verdict and sentence", "March: if every survivor walked to Washington"), the all-days index and the verdict page's "Begin the march" link.
- Every day page has a self-explanatory title (no internal codes), a content note, its question as the heading, a short text alternative, a "Text version" with a data table, confidence marks in words and its sources (checked by the page tests on all 28 days at both widths).
- One reader-facing internal code was found and reworded: the finale's uncertainty note named a design file ("DESIGN_V2"). It now says a planned set of 200 runs is not built yet. The sentence lives in `src/viz/finale/summary.json`; the prep script copies it from the migration build, so make the same edit there before regenerating.
- Literal scan: clean across 28 day folders, the kits, the finale and the verdict and finale pages.

## Also see
`/mnt/user-data/outputs/combs-trial/ADDITIONS_AUDIT.md`: the 47 added facts whose citations were carried over from the day records without being reopened, to be checked against their articles.
