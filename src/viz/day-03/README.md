# Day 3: What Backs Each Part of Her Account

**Owner:** Builder 1 (the first week: one woman's account). You own every file in this folder (`src/viz/day-03/`) and `tests/e2e/day-03.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day03.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 3 (Wednesday, May 14): What Backs Each Part of Her Account

- **Question:** For each event Ventura described, what kind of evidence did the jury see?
- **Form:** an evidence matrix that fills over the trial. Rows are the dated events she testified about (December 2011; 2013 injury; 2013 Cannes; March 5, 2016 hotel; August 2018). Columns are kinds of evidence (her testimony, photograph, text or email, video, another witness, records). A day slider runs from 3 to 28; cells fill on the day that evidence arrived (the 2016 row fills from video on D1, Florez on D1, Morgan on D6, Garcia on D15, Piazza on D16, Khorram texts on D25).
- **Data:** D3 `testimony_points` and `exhibits` (two Uber selfies; premiere photo; photos taken by her mother; texts dated 2013, March 9, 2014, 2016 and 2017), all high where two outlets agree; D3 `numbers`: lawsuit filed November 16, 2023, settled the next day for $20 million (high: CNN, NPR); "13 male sex workers" recruited (low, Fox 5); hotel video viewed 6 or more times by this day (low, CNN); about 9 hours of direct (low, CNN). The shared `events` table supplies later days' cells with their own sources. "Hundreds?" is shown as her words, not as a number.
- **Interaction:** move the slider or press play to watch the matrix fill; select a cell to see which day, witness or exhibit filled it, with sources. The grid is an ARIA grid navigable by arrow keys.
- **Caption:** "A filled square means the jury saw that kind of evidence, not that it believed it. No photograph or video is shown here."
- **Text alternative:** "Grid of five events from Ventura's testimony against six kinds of evidence, showing which kinds the jury saw for each and on which trial day."
- **Why this form:** the central question of any trial is corroboration. Visual investigators layer independent pieces of evidence before saying anything with confidence; a matrix that fills over time shows the case being built that way.
- **Content level:** 3.
