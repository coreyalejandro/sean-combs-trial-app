# Day 8: Why Many Survivors Wait to Tell

**Owner:** Builder 2 (the witnesses around her). You own every file in this folder (`src/viz/day-08/`) and `tests/e2e/day-08.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day08.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 8 (Wednesday, May 21): Why Many Survivors Wait to Tell

- **Question:** An expert testified that delay in telling is common. In this trial, how long were the gaps between what people described and when they went to police, a lawyer or prosecutors?
- **Form:** a dumbbell chart. One row per account; the left dot is the year of the earliest event described, the right dot the year of the first report, lawsuit or meeting with prosecutors, and the line between is the gap in years. Rows with a missing date say "not stated in coverage". Dr. Dawn Hughes's four general concepts (delayed disclosure, fragmented memory, trauma bonds, financial and psychological control) frame the chart as a short legend.
- **Data:** D8 Hughes `testimony_points` (high: Fox, AP, NBC); her fee ($6,000 vs $600 an hour, conflict). Rows from the shared `events` table: Ventura, 2007 to the November 2023 lawsuit (high); Mia, 2009 to her first meetings with prosecutors in January 2024 (low, D14 Fox) and the 2017 mediation (high); Kid Cudi, December 2011, reported to police the same month (high; a gap of zero, shown on purpose); Jane, 2021 to contact after the March 2024 raids (high); Bryana Bongolan, 2016 to her civil suit (year of filing not in coverage, shown as missing).
- **Interaction:** select a row for both dates and their sources; toggle "first legal step" vs "first time told anyone" where both are reported.
- **Caption:** "Hughes did not evaluate anyone in this case; she described patterns researchers see. The chart shows only dates reported in coverage. One witness reported within weeks; others waited years."
- **Text alternative:** "Chart of five accounts showing the years between the events described and the first report or legal step, from zero years to about 16."
- **Why this form:** expert testimony is abstract; tying it to the trial's own dates makes it concrete without diagnosing anyone, and the zero-gap row keeps it honest.
- **Content level:** 2.
