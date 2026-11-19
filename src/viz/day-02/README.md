# Day 2: How Old Cassie Ventura Was When It Began, and How Long It Lasted

**Owner:** Builder 1 (the first week: one woman's account). You own every file in this folder (`src/viz/day-02/`) and `tests/e2e/day-02.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day02.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 2 (Tuesday, May 13): How Old Cassie Ventura Was When It Began, and How Long It Lasted

- **Question:** How old was she when they met, and how much of her life did the relationship span?
- **Form:** a dual lifeline. Two parallel age lines (hers and his) run along a calendar axis from 2005 to 2018, with the 18-year gap visible as the distance between them, and labelled marks for "met", "signed to Bad Boy", "relationship begins", "she says the encounters began", "last". An inset of 10 small squares, one filled, shows the record deal.
- **Data:** D2 `numbers`: met 2005 at 19, he was 37 (high: AP, NPR); signed early 2006 to a 10-album deal (high: NPR, D11 NBC); released one mixtape in 2013 (NPR) vs one album in 2006 (D11 NBC) (conflict, both shown); relationship "just over 10 years" (AP) vs 11 years, 2007 to 2018 (D4, D5) (conflict, drawn as a range); first encounter about 2008 at 22 (low, AP); last in 2017 or 2018 (approximate). D11 Nash's "about 10% of her music released" (low) appears as a note on the inset.
- **Interaction:** drag along the years to read both ages at that point; each mark opens its source.
- **Caption:** "Ages and dates as Ventura testified. The defense agreed on cross-examination that the relationship lasted about 11 years (Day 4)."
- **Text alternative:** "Timeline from 2005 to 2018 showing Ventura's age (19 to about 32) and Combs's age (37 to about 50), with the dates she gave for each stage of the relationship."
- **Why this form:** her first day on the stand set out a life in years; age and duration are the frame for the expert testimony on power and control (Day 8).
- **Content level:** 2.
