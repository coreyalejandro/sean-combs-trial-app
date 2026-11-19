# Day 13: Asked, Settled, Received: Money in the Record on One Scale

**Owner:** Builder 2 (the witnesses around her). You own every file in this folder (`src/viz/day-13/`) and `tests/e2e/day-13.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day13.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 13 (Friday, May 30): Asked, Settled, Received: Money in the Record on One Scale

- **Question:** How does the 2017 settlement over Mia's claims compare with the other settlements, suits and payments named at trial?
- **Form:** a log-scale dot line. One horizontal axis from $1,000 to $100 million in which each gridline is 10 times the last (said in words on the chart). Mia's step-down ($10 million asked, about $400,000 settled, about $200,000 to her) is drawn as a connected descending step; other amounts are context dots by kind (settlement, lawsuit demand, NDA or payment).
- **Data:** D13 `numbers`: $10 million demand, about $400,000 settlement, about $200,000 to Mia (high: Fox, NBC; NPR on D14); context: Ventura's $20 million settlement and $30 million manuscript ask (D3, high); Bongolan's $10 million suit (D16, high); Morgan's $30,000 NDA (D6, low); the $100,000 for the hotel video (D15, high); Garcia's $30,000 share (D15, low); Regina Ventura's $20,000 (D7, high).
- **Interaction:** toggle kinds of amount; focus a dot for its source; a "Show on an ordinary scale" switch redraws it linearly so the viewer can see why the log scale is needed.
- **Caption:** "On this scale each step to the right is ten times bigger. A settlement is not an admission by either side."
- **Text alternative:** "Log-scale line of amounts named at trial, from $20,000 to $30 million, with Mia's 2017 mediation shown falling from $10 million asked to about $200,000 received."
- **Why this form:** the amounts span four orders of magnitude; only a log axis can show all of them honestly on one line.
- **Content level:** 2.
