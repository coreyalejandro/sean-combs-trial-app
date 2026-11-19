# Day 18: How Long the Nights Lasted, in Two Women's Testimony

**Owner:** Builder 3 (the money and the second account). You own every file in this folder (`src/viz/day-18/`) and `tests/e2e/day-18.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day18.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 18 (Friday, June 6): How Long the Nights Lasted, in Two Women's Testimony

- **Question:** How long did the encounters both women described last, and how long did recovery take?
- **Form:** a duration range plot on one hours axis (0 to 100 hours). One row per described duration, grouped by witness, with each group's years (about 2008 to 2018, and 2021 to 2023). A separate row shows recovery time.
- **Data:** D2 Ventura: typically 36 to 48 hours (high: AP, Fox), 72 hours (low, NBC), longest four days (high). D17 Jane: 24 to 30 hours (low, NBC). D18 Jane: shortest 12 hours, longest 3 to 3.5 days (low, NBC); recovery 1.5 to 2 weeks (low, NBC). D19 and D21 Jane: an October 2023 night of 12 to 18 hours (high: NPR, NBC). The terms "freak-offs" (Ventura's word in court) and "hotel nights" (Jane's) appear once, in quotation marks, in the caption.
- **Interaction:** focus a range for the witness's words and source; switch the axis between hours and days.
- **Caption:** "Durations as each woman testified. Two accounts, more than a decade apart, describe encounters of similar length, which prosecutors called 'freak-offs' and Jane called 'hotel nights'."
- **Text alternative:** "Range chart comparing durations Ventura described (36 hours to four days, about 2008 to 2018) with those Jane described (12 hours to three and a half days, 2021 to 2023)."
- **Why this form:** the point of Day 18 for the case is the repetition of a pattern across time; comparing lengths on one axis shows that with no detail of what happened.
- **Content level:** 3.
