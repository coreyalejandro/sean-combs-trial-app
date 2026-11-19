# Day 21: Every Payment Named in Jane's Testimony

**Owner:** Builder 3 (the money and the second account). You own every file in this folder (`src/viz/day-21/`) and `tests/e2e/day-21.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day21.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 21 (Wednesday, June 11): Every Payment Named in Jane's Testimony

- **Question:** What money moved between Combs and Jane, and when?
- **Form:** a payment beeswarm from 2021 to 2024. Each payment is a dot sized by amount, recurring rent is a band ($10,000 a month from March 2023), and a faint baseline band shows her income before the relationship (about $50,000 a year).
- **Data:** D17 $5,000 to $10,000 a month by 2021 and a $10,000-a-month lease (low, ABC); D18 $15,000 a month asked and $10,000 offered in March 2023 (asked: low, NBC; $10,000: high with GMA), three credit cards (low); D20 about $150,000 wired in total (high: NBC, D22 GMA), $20,000 sent after an argument (NBC) and $20,000 invested in her dress line (ABC) (two separate items, low each), about $50,000 prior income (low); D21 at least $13,000 for a February 2023 birthday (low), $15,000 asked; D19 about $12,000 cash in June 2024 (low); D22 child support about $5,000 a month and later income about $10,000 a month (low, GMA).
- **Interaction:** select a dot for what it was and who reported it; "Show only amounts reported by two or more outlets".
- **Caption:** "Prosecutors said the rent was leverage. The defense said the gifts showed a loving relationship. Jane's answer comes on Day 22."
- **Text alternative:** "Timeline of payments from 2021 to 2024, including about $150,000 wired in total and $10,000 a month in rent from March 2023."
- **Why this form:** payments are separate events of very different sizes; a dot timeline shows their rhythm and their scale together.
- **Content level:** 2.
