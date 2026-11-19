# Day 19: After the Lawsuit: November 2023 to September 2024, Person by Person

**Owner:** Builder 3 (the money and the second account). You own every file in this folder (`src/viz/day-19/`) and `tests/e2e/day-19.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day19.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 19 (Monday, June 9): After the Lawsuit: November 2023 to September 2024, Person by Person

- **Question:** What happened, and to whom, between Ventura's lawsuit and Combs's arrest?
- **Form:** a swimlane timeline. One lane each for Ventura, Jane, Mia, Combs's staff, federal agents and Combs, from November 2023 to September 2024.
- **Data:** shared `events`: lawsuit November 16, 2023, settled next day for $20 million (high); a security staffer calls Mia November 30 (low, D13 Fox); recorded calls to Jane three days after the filing and 22 minutes apart (low, D19 ABC); Jane's December 2023 text to the chief of staff about threats to release tapes (high: D19, D24 NBC); Mia's first meetings with prosecutors January 5 and 8, 2024 (low, D14); messages to Mia February 4 and 7 (high) and at least six calls in one day in February (low, D24 NBC); searches of the Miami and Los Angeles homes on March 24 or 25 (conflict); an agent's card left with Jane and Combs paying her lawyer (high: NBC, ABC); CNN publishes the hotel video in May (high); June 18, 2024, Jane testified to a violent incident at her home, and photos of four damaged doors were shown (high: NBC, ABC; no further detail); about $12,000 cash the next day (low, ABC); June 2024 $3,500 payment arranged (low, D23); arrest September 16 (D5).
- **Interaction:** brush to zoom into a month; filter lanes; each event links to its day and sources.
- **Caption:** "Order is not cause. The chart shows what happened when, not why."
- **Text alternative:** "Timeline of events across six people and groups between Ventura's November 2023 lawsuit and Combs's September 2024 arrest."
- **Why this form:** Jane's last day of direct covered ten months and many actors; lanes keep who did what readable.
- **Content level:** 3.
