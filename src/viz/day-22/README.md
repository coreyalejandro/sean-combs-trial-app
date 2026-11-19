# Day 22: Six Days on the Stand: Jane's Testimony, Hour by Hour

**Owner:** Builder 4 (the record and the system). You own every file in this folder (`src/viz/day-22/`) and `tests/e2e/day-22.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day22.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 22 (Thursday, June 12): Six Days on the Stand: Jane's Testimony, Hour by Hour

- **Question:** How long did Jane testify, and who was questioning her at each point?
- **Form:** a testimony Gantt chart. One row per court day (June 5, 6, 9, 10, 11, 12), with bars along clock time (8:30 a.m. to 5:30 p.m.) shaded by who was asking (prosecution direct, defense cross, redirect, re-cross) and a grey bar for the closed conference. Her final answer closes the chart as an annotation.
- **Data:** times: D17 direct begins about 2:27 p.m. (high: NBC); D18 about 9:30 a.m. to 5:03 p.m. with lunch 12:20 to 1:15 (low, NBC); D19 8:32 a.m. to 5:18 p.m. (low, NBC); D20 about 9:22 a.m. to 3:08 p.m. (low, NBC); D21 about 1:09 to 4:37 p.m. (low, NBC); D22 about two hours closed, then cross, redirect and re-cross with times not reported (drawn as approximate, low, GMA). Days on the stand: 5 by the court record vs 6 counting June 5 (conflict, both stated). The closing quote: "Is that all I'm worth in three years?" (D22, high: GMA, NBC).
- **Interaction:** select a bar for the topics covered in that session (from `testimony_points`).
- **Caption:** "Is that all I'm worth in three years?" (Jane's last answer, June 12).
- **Text alternative:** "Chart of six court days of Jane's testimony, split between prosecution and defense questioning, ending June 12." (The generated version adds the computed total hours, marked approximate.)
- **Why this form:** how long a person is questioned is itself a fact; a Gantt chart shows the endurance as clock time.
- **Content level:** 2.

---

## Build notes (Builder 4)

- **Built:** testimony Gantt (SVG, server-rendered; client adds selection). One row per court day in Jane's witness-table row (Days 17 to 22), clock time across, bars by examination: direct and redirect blue, cross and re-cross amber, redirect, re-cross and the closed conference striped, approximate or unreported parts dashed. A phone layout is drawn separately (labels above bars).
- **Data, all parsed from the records' own text (no times typed):** start and end times from Jane's witness entry each day; an end taken from the day's "Court adjourned" legal event when only a start is given (Day 17); the lunch break from "Lunch 12:20-1:15 PM" (Day 18) and a return-from-lunch tick from "due back 1:15 PM" (Day 19); who was asking from "direct by Maurene Comey" etc.; the closed conference's length from Day 22's number and its start placed at the hour jurors were told to arrive (Day 21's "due before 9 AM"), marked approximate. Topics per session come from keyword rules over that day's key points (labels only, never the testimony itself).
- **Adaptation:** DESIGN_29 rated the June 5 start "high (NBC)"; no reported number backs it, so it is shown as "one outlet, unconfirmed" (lowered, never raised). Times backed by a reported number keep that number's confidence (medium).
- **Days count:** shown as the conflict it is: 5 by the court-day record (Day 22 number) vs 6 rows counting June 5 (calculated).
- **Total hours:** calculated, approximate, with the formula in the text version; Day 22 is excluded because its questioning times were not reported.
