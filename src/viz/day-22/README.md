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
