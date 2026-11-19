# Builder brief: the 28 day visualizations and the finale port

You are one of five builders on *The Combs Trial*, a static website that tells the 2025 federal trial of Sean Combs as 29 pictures. Like a film's pull-back shot, it starts on one courtroom (one picture per testimony day, Days 1 to 28), passes through the verdict, and ends on about 78 million survivors walking to Washington (Day 29, the finale).

The scaffold is done: every page builds, shows its question, its sources and a sourced table of the day's figures, and passes the page tests. Your job is to replace a placeholder with the picture DESIGN_29 describes, without touching anyone else's files.

---

## 1. Where everything is

**REPO WORKING COPY (cloud)**

```text
/mnt/user-data/outputs/combs-trial/app/
```

**BRANCH THE SCAFFOLD IS ON**

```text
v2-29-visualizations
```

**THE DESIGN (read your days' sections, plus "Care for survivors", "Accessibility", "On a phone")**

```text
/mnt/user-data/outputs/combs-trial/DESIGN_29.md
```

**THE RESEARCH NOTES BEHIND THE DATA (day_NN.md, COURT_CALENDAR.md, SOURCE_AUDIT.md, verdict.md)**

```text
/mnt/user-data/outputs/combs-trial/days/
```

- GitHub: `coreyalejandro/sean-combs-trial-app`. **`main` auto-deploys to the public site. Never commit to `main` and never push anything.** The scaffold branch is not pushed yet either.
- The working copy is on a slow network mount. **Copy it to local disk before installing** (the scaffold was built that way), then copy your changes back:

**RUN IN A TERMINAL (cloud container)**

```bash
mkdir -p /home/claude/work && cd /mnt/user-data/outputs/combs-trial/app
tar --exclude=./node_modules --exclude=./.next --exclude=./out -cf - . | (mkdir -p /home/claude/work/app && cd /home/claude/work/app && tar xf -)
cd /home/claude/work/app && git checkout -b viz/builder-N v2-29-visualizations   # N = your builder number
npm ci
```

- Commit on your own branch (`viz/builder-1` ... `viz/builder-4`, `viz/finale`), using the repo's git identity: `git -c user.name="$(git log -1 --format=%an)" -c user.email="$(git log -1 --format=%ae)" commit ...`. When done, copy the repo (with `.git`, without `node_modules`, `.next`, `out`) back to the working copy path above, or hand back your branch as a bundle; the coordinator merges.

## 2. Which files are yours

| Builder | Days | Forms | You own |
|---|---|---|---|
| 1: the first week (one woman's account) | 1 to 7 | claim diff, dual lifeline, filling evidence matrix, message thread, isotype, dot map with year slider, money path | `src/viz/day-01/` to `src/viz/day-07/` |
| 2: the witnesses around her | 8 to 14 | dumbbell, two-sided network, corroboration strip, broken evidence chain, 24-hour clocks, log-scale line, mirrored timeline | `src/viz/day-08/` to `src/viz/day-14/` |
| 3: the money and the second account | 15 to 21 | Sankey with confidence switch, chain-of-custody line, contradiction diff with two maps, duration ranges, swimlanes, docket tracker, payment beeswarm | `src/viz/day-15/` to `src/viz/day-21/` |
| 4: the record and the system | 22 to 28 | testimony Gantt, waffle comparison, jury-box tracker, treemap, hive-plot network, great-circle arc map, witness constellation | `src/viz/day-22/` to `src/viz/day-28/` |
| Finale porter | verdict and 29 | verdict transition, the march | `src/app/verdict/`, `src/app/finale/`, `src/viz/finale/`, `public/finale-data/`, `tests/e2e/finale.spec.ts` |

Each builder may also add `tests/e2e/day-NN.spec.ts` for their own days.

Each day folder already has:

- `README.md`: that day's full design, copied from DESIGN_29 (question, form, data with confidence, interaction, caption, text alternative, why this form, content level).
- `index.tsx`: the placeholder. Replace its body. Keep the three exports: `default` (the picture), `TextVersion`, and `meta`.
- `meta.ts`: title, question, form, content level, caption, "How to read this" line, short text alternative, `status: 'placeholder'`. Write the real "How to read this" line and set `status` to `'in-progress'`, then `'done'`.
- `additions.json`: empty; facts you need that the data lacks (section 4).

Add as you build: `select.ts` (pull exactly the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`), and `dayNN.test.tsx` (render and data-change test).

**Never edit** (ask the coordinator instead): `package.json`, `package-lock.json`, `next.config.js`, `tsconfig.json`, `.eslintrc.json`, `src/app/**` (finale porter excepted for its folders), `src/components/shell/**`, `src/viz/registry.ts`, `src/viz/types.ts`, `src/lib/**`, `src/styles/**`, `src/data/**`, `scripts/**`, `tests/unit/**`, `tests/e2e/pages.spec.ts`, another builder's day folders.

## 3. Which day is which

Day N is the Nth day the jury heard testimony. The final data file wins over DESIGN_29's file table:

- Days 1 to 25 = May 12 to June 17, 2025, as in DESIGN_29.
- **June 18 is not a day.** A juror was ill and no one testified; it is a grey gap on the rail and a note on Day 25's page (from Day 25's `calendar_note`).
- **Day 26 = Friday June 20** (DESIGN_29's old `day_27.md`), **Day 27 = Monday June 23** (old `day_28.md`), **Day 28 = Tuesday June 24** (now in the data: both sides rest, 34th witness, Rule 29 reserved, Combs declines to testify).
- Inside the README copies, "D26 file" and "D27 file" in Day 24's text mean June 18 and June 20 under the old numbering.

## 4. How to read the data

Everything comes from `src/data/trial_days.json` through `@/lib/data`. Never type a fact.

**FILE: src/viz/day-NN/select.ts (pattern)**

```ts
import { getDay, getWitnesses, resolveSources, type TrialDay } from '@/lib/data'

export function select(day: TrialDay) {
  // Pick figures by what they are, never by array position.
  const cash = day.numbers.find((n) => /fanny pack/i.test(n.what))
  return { cash, sources: day.sources }
}
```

What is in the file (full types in `src/lib/data/types.ts`):

- `days[]` (28): `day`, `date`, `weekday`, `summary`, `witnesses[] {order, name, role, exam}`, `exhibits[]` (strings), `numbers[]`, `locations[]`, `people[]`, `legal_events[]`, `sources[] {id, title, outlet, url, date, note, opened_this_pass}`, `discrepancies[]`, `single_sourced[]`, `key_points[]`, `confidence {level, summary}`, `day_label`, optional `calendar_note`, `alt_day_labels`.
- `numbers[]`: `{ value, unit, what, source, outlets[], confidence }`. **`value` is a number or text** ("8-10", "~190", "2016-03-05"); use `toNumber()` from `@/lib/viz/format` and handle `null`. **`source` is free text**; always use `resolveSources(num, day.sources)` to get the sources (every number resolves; a unit test checks it).
- `verdict`: `phases[] {date, label, facts[], confidence}`, `numbers[]`, `sources[]`, `discrepancies[]`, `confidence`.
- Confidence is `high` (two or more outlet families), `medium` (one major outlet, uncontradicted) or `low` (single source flagged unverified, contradicted, or minor outlet). Conflicts are written in each day's `discrepancies` text; show both values with the split mark and the words "outlets disagree".

Helpers in `@/lib/data`: `getDay(n)`, `getDays()`, `getDayNumbers()`, `DAY_COUNT`, `getVerdict()`, `getCharges()` (five counts, plain words, outcomes), `getWitnesses()` / `getWitnessesOnDay(n)` / `getWitnessesThrough(n)` (the 34-row table: `id`, `display_name`, `pseudonym`, `first_day`, `days[]`, `group`, `role`, `immunity`; group is provisional), `getGaps()`, `resolveSources()`, `allSources()`, `confidenceInfo()`, `lowerConfidence()`, `redactThirdParties()`, `formatDate()`.

**Cross-day facts.** DESIGN_29 mentions shared `events` and `places` tables; they are not built. If you need a fact from another day, read that day with `getDay(m)`. If you need structured facts the data does not hold (an event's exact date, a city's latitude and longitude, an exhibit's type), put them in **your own** `additions.json`:

**FILE: src/viz/day-NN/additions.json (shape; validated by tests/unit/additions.test.ts)**

```json
{
  "day": 6,
  "items": [
    {
      "id": "place-los-angeles",
      "kind": "place",
      "text": "Los Angeles, California (city centre)",
      "value": "34.0522,-118.2437",
      "from_days": [6],
      "confidence": "medium",
      "sources": [{ "outlet": "U.S. Census Bureau", "outlet_family": "Census", "title": "Gazetteer files", "url": "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html", "date": "2024" }]
    }
  ]
}
```

Every item needs at least one source with a URL; `high` needs two outlet families. You may lower a confidence, never raise it. Take facts only from the cited outlets or the day files in `/mnt/user-data/outputs/combs-trial/days/`; do not go back to the original articles for more detail.

## 5. Components and helpers to use

The shell already renders the frame: cover band, charge ribbon, content note, `<figure role="group">` with your question as its heading, your picture, the caption, "How to read this", the short description, the "Text version", "Also in court today", the sources list and the trial rail. You render only the picture and the text version.

- `@/components/shell/ConfidenceMark`: `<ConfidenceMark level="high|medium|low|conflict" />`, always with words; `ConfidenceLegend`.
- `@/components/shell/SourceRef`: `<Cite num={n} pool={day.sources} />` prints a figure with its mark and numbered source links; `<SourceRef ids={[...]}>text</SourceRef>` tags any number you print. Every printed number carries `data-source-ids` (the page test checks each id is listed on the page).
- `@/components/shell/NumbersTable`: an accessible, phone-friendly table of figures with confidence and sources; reuse it in your text version.
- `@/lib/viz/tokens`: colours (`prosecution` blue left, `defense` amber right, `neutral`, `red` = the one accent). In SVG prefer `fill="var(--prosecution)"`.
- `@/lib/viz/layout`: chart width, margins, gaps, font sizes, strokes, dash pattern for unconfirmed marks, `breakpointQuery`.
- `@/lib/viz/format`: `formatUSD`, `formatUSDShort`, `formatInt`, `formatRange` ("25 to 30"), `formatValue`, `toNumber`.
- `@/lib/viz/motion` (client): `useQuietMotion()` (quiet mode or reduced motion: show the final frame and step buttons), `useMediaQuery(breakpointQuery)`, `useViewportHeight()` (pixels, never `vh`).
- `@/lib/viz/roving` (client): `useRovingFocus(count)` for explorable marks; give each mark `data-roving-index={i}` and `tabIndex={tabIndexFor(i)}`.

Rendering rule: compute with D3 or Plot and draw the SVG in the server component, so the picture is in the static HTML; add interaction in a `'use client'` child. Charts that only work in the browser still render their table at build time.

## 6. Allowed libraries (installed and pinned; do not add any)

react and react-dom 18.3.1; next 14.2.35; d3 7.9.0; d3-sankey 0.12.3; @observablehq/plot 0.6.17; topojson-client 3.1.0; us-atlas 3.0.1; world-atlas 2.0.2; scrollama 3.2.0; deck.gl and @deck.gl/react 9.1.14 (finale only); zod 3.25.76. Tests: vitest 3.2.4, @testing-library/react 16.3.0, @testing-library/dom 10.4.0, jsdom 26.1.0, @playwright/test 1.63.0, @axe-core/playwright 4.11.0. Types for d3, d3-sankey, topojson-client and geojson are installed.

## 7. No hand-typed numbers

- `npm run check:literals` fails on any numeric literal other than -1, 0, 1, 2 in your day folder's code, and on any string, template or JSX text containing a value from the data (`"$100,000"`, `"100000"`, `"$100K"`, `"2016-03-05"`). "Day 15" references are allowed.
- In `meta.ts`, numbers inside copy must exist somewhere in the data. Two DESIGN_29 lines were changed for this reason: Day 23's text alternative no longer states the computed 1,100 (generate it in `describe.ts` with a "calculated" tag), and Day 27's caption no longer says "78 million" (that figure belongs to the finale's own data).
- Derived numbers (sums, gaps, hours) are computed in code from data and shown with a small "calculated" tag and the formula in the text version.
- `npm run lint` also applies ESLint `no-magic-numbers` to your folders.

## 8. Care for survivors (no builder may relax these)

1. **Content note.** Set `contentLevel` (1 procedure and records; 2 references to violence or coercion without detail; 3 centred on testimony about sexual coercion). The shell writes the standard sentence for the level; override it with `contentNote` only if your page needs different words.
2. **No graphic detail, ever.** No photographs of injuries, no stills or descriptions from sealed recordings, no sexual content from messages (paraphrase), no courtroom sketches of pseudonymous witnesses. Durations, dates, counts and money stand in for detail.
3. **Pseudonyms are absolute.** "Mia" and "Jane" appear only by pseudonym, with no image, silhouette, age or detail that narrows who they are. Use `display_name` from the witness table.
4. **Third parties are not named.** Sex workers and escort services appear as "a sex worker named in court records" or "Worker A". Pass every piece of day-file text you display through `redactThirdParties()`; the page test fails on known names.
5. **Allegations are allegations.** Write "testified", "said", "alleged". Show both sides' readings wherever the jury heard both.
6. **Survivor-centred words.** Call people by name or role (witness, Ventura, Jane), never "accuser" (the redactor rewrites it; the page test fails on it). "Victim" only when quoting the indictment ("Victim-2").
7. **Support is one tap away.** The shell provides it; do not hide or cover the header.
8. **Equity.** Never use "other" as a category label; say who is missing from a count.
9. **Human review.** Corey reviews all narrative copy in his voice; paid survivor readers review each day page before it goes public and can change it. Leave `status: 'in-progress'` until your tests pass, then `'done'`; publishing waits on review.

## 9. Accessibility and phones

- The text version (long description plus data table) is generated from the same selection as the picture, so it cannot drift.
- Interactive marks have ARIA labels (`ariaLabel` / `ariaDescription` in Plot, or the same attributes on SVG); decorative marks are `aria-hidden`.
- Every control is a native button or input. Explorable marks: Tab enters, arrows move, Enter opens, Escape leaves. Focus is a visible 2 px red outline (global CSS). Left and right arrow keys outside your figure move between days; inside an element with `data-viz-day` (your figure) they are yours.
- Colour: no red/green pairs; categories differ in lightness as well as hue; label directly; a second cue (pattern, dash); confidence by fill and words, never colour alone. Check in greyscale and a colour-blindness simulator.
- Contrast: text at least 4.5 to 1; large text and marks at least 3 to 1.
- Motion: every animation checks `useQuietMotion()`.
- No JavaScript: the picture or its table must be in the HTML.
- Phones (390 px first, 16 px gutter): no sideways page scroll; wide charts scroll inside their own frame with a visible "drag to see more" cue and buttons; networks (Days 9, 26) become a grid or list; maps (Days 6, 17, 27) become a simpler map plus a list; hover is never required.

## 10. Tests and commands

**RUN IN THE REPO FOLDER**

```bash
npm run typecheck
npm test                 # literal scan + unit tests (includes your dayNN.test.tsx)
npm run lint
npm run build            # must succeed: static export to out/
npm run test:e2e         # every page at 1280 px and 390 px: sources, rail, axe, no-JS, no sideways scroll
npx playwright test -g "day 7 "   # just one day's page checks
```

Your `dayNN.test.tsx` renders your picture and text version with the real record, finds the table and the source tags, then renders an altered copy (one figure removed or one amount doubled) and checks the output changes. Look at your pages at both widths (`npm run dev`, or the screenshots the e2e run saves in `tests/e2e/__screens__/`).

## 11. Definition of done, per day

- Renders only from `trial_days.json` and your sourced `additions.json`.
- The question is the figure heading; caption, real "How to read this" line, short text alternative, long description and table are present.
- Confidence marks with words; every printed number carries its sources.
- Keyboard, screen reader (axe: no serious or critical issues), colour-blind, 390 px, quiet-mode and no-JavaScript checks pass.
- Your render and data-change tests pass; `npm test`, lint, build and `npm run test:e2e` pass for the whole repo.
- Follows every rule in section 8; `meta.status` is `'done'`.

## 12. The finale porter

You bring the Sexual Assault Migration Map into the app as Day 29 and finish the verdict page's turn. Port it; do not rebuild it.

**THE MIGRATION MAP BUILD (the source you port from)**

```text
/mnt/user-data/outputs/migration-map/build/
```

**ITS DESIGN**

```text
/mnt/user-data/outputs/migration-map/final/DESIGN_V2.md
```

What is there: `viewer/app.js` (the viewer logic; it fetches `data/meta.json` and `data/march.bin`; `onWashington()` is a marked hook that must stay undefined), `viewer/page.html` and `viewer/index.html` (markup and the same LIFE tokens as this app), `viewer/data/meta.json` (about 265 KB) and `viewer/data/march.bin` (about 7.2 MB), `viewer/vendor/deckgl-9.1.14.min.js`, the still map `outputs/arc_map_state_to_dc.png`, screenshots in `screens/`, and the viewer tests `tests/test_stage6_viewer.py` (Python Playwright). Read the build's `README.md` for the numbers and their sources.

What to do:

1. **Data:** copy `meta.json` and `march.bin` into `public/finale-data/` (shipped as `march.qbin`, gzip bytes the browser inflates). Drop `march-data.js` and `meta.js` (only for opening the viewer from disk).
2. **Component:** wrap the `app.js` logic in a client-only React component in `src/viz/finale/` (load it with `next/dynamic` and `ssr: false`), using the installed `deck.gl` / `@deck.gl/react` 9.1.14 instead of the vendored script. deck.gl must load only on `/finale/`.
3. **Page:** replace the placeholder in `src/app/finale/page.tsx`. Keep the four counters, the three views ("The leaving", "The passing through", "The arriving"), Play and Pause, the speed menu, the day bar with its three marks, and "Quiet mode (no motion)" wired to the app-wide setting (`useQuietMotion()` and the header switch; do not add a second switch). Render a static summary (the still image and a text table of the counters) in the HTML for no-JavaScript readers. Keep the closing line: this is version 1, the march *to* Washington; the march *on* Washington is in development. The start date stays "Day 1", "Day 2" until Corey picks one.
4. **Verdict turn:** in `src/app/verdict/page.tsx`, replace the scaffold's static turn with the transition DESIGN_29 describes: the 34 witness stars (from `getWitnesses()`) contract into one dot, relabelled "1 dot = 1,000 people", then "Begin the march". Carry the first counter's number over to the finale. In quiet mode, each step is a still frame with a "Continue" button. The verdict page's charge ribbon, "Not guilty means..." line, record and sources stay. The lines "One trial. 34 witnesses. Two women named in its charges." and "Then the camera pulls back." are draft copy awaiting Corey's voice review. The sentence ruler (14, 50, 135 and 240 months) is yours to add from `getVerdict().numbers`.
5. **Tests:** port the viewer's checks to `tests/e2e/finale.spec.ts`: it loads, plays, jumps to any day quickly, opens at 390 px, and works in quiet mode. The shared page tests already cover `/finale/` and `/verdict/` for sources, support link, axe and sideways scroll.
6. **Budget:** finale data loads after the intro with a progress line; aim for 30 frames a second on a recent laptop.

## 13. What the scaffold did not build (ask the coordinator before relying on these)

- DESIGN_29's data merge pipeline (`scripts/build-data.ts`, `data/src/...`) and the shared `events` and `places` tables: replaced by one copied data file plus per-day `additions.json`.
- Index thumbnails, the bundle-budget check and CI.
- `/method` and `/about` pages (the about page needs Corey's own statement and his authorial position, in his words).
- The witness star counter in the page header and index filters.
- The charge ribbon outlines no counts until a day sets `meta.counts`.
- Content-note wording for levels 1 to 3, the home page sentence and the verdict turn are scaffold drafts for Corey's and the survivor readers' review.
