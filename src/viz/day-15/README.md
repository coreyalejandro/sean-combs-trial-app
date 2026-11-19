# Day 15: Where the $100,000 for the Hotel Video Went

**Owner:** Builder 3 (the money and the second account). You own every file in this folder (`src/viz/day-15/`) and `tests/e2e/day-15.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day15.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 15 (Tuesday, June 3): Where the $100,000 for the Hotel Video Went

- **Question:** How was the cash paid for the 2016 hotel video divided, according to the security supervisor?
- **Form:** a Sankey diagram. One $100,000 band splits into the parts the witness described; a thin band leads to the NDA he signed. A "Show only amounts reported by two or more outlets" switch collapses the diagram to the single $100,000 band, so the viewer sees how much detail rests on one outlet. A pay ruler underneath compares his $30,000 share with his $10.50 hourly wage (about 2,857 hours, tagged "calculated").
- **Data:** D15 `numbers`: $100,000 counted in $10,000 stacks (high: NBC, ABC); $30,000 Garcia's share (low, NBC); $50,000 his boss's first price and the remainder for two other guards (low, NBC; ABC frames it differently, conflict, so the remainder's split is drawn as "not clearly reported"); $1 million NDA penalty (low, NBC); $10.50 an hour (low, NBC). `testimony_points`: the chief of staff's first call, Combs's call, the FaceTime, the brown paper bag, the money counter, the NDA unread.
- **Interaction:** select a band for the witness's words and the source; the confidence switch.
- **Caption:** "Prosecutors called the payment a bribe and part of the racketeering case. The defense said it was meant to keep a damaging video out of the news (Day 1)."
- **Text alternative:** "Flow diagram of $100,000 in cash: $30,000 to the security supervisor, the rest to his boss and two other guards in amounts not clearly reported, with an NDA carrying a $1 million penalty."
- **Why this form:** dividing one sum into parts is what a Sankey is for; the confidence switch turns sourcing into something the viewer can see.
- **Content level:** 1.
