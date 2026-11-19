# Day 12: Workdays Without an End: What Former Assistants Described

**Owner:** Builder 2 (the witnesses around her). You own every file in this folder (`src/viz/day-12/`) and `tests/e2e/day-12.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day12.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 12 (Thursday, May 29): Workdays Without an End: What Former Assistants Described

- **Question:** How long did people who worked for Combs say their workdays were?
- **Form:** 24-hour clocks as small multiples. One clock face per former employee, with the testified working hours filled as an arc and a faint 9-to-5 arc for comparison; beside each, a bar for the longest stretch without sleep where one was described.
- **Data:** D6 David James, 20-hour days (low, Complex); D8 George Kaplan, 80 to 100 hours a week (low: Fox and Fox 5 count as one outlet family); D10 Capricorn Clark, 7 a.m. to 4 a.m. (low, NBC); D12 Mia, a 24/7 job (high: NBC, Fox) and five days without sleep (high: NBC, Fox); D14 Mia, about 22 hours a day (low, NPR); D26 Brendan Paul, three days without sleep (low, ABC). Pay where reported (Clark $55,000; Mia $55,000 promised, $50,000 paid; Kaplan about $125,000), all low.
- **Interaction:** select a clock for the person's own words and the source.
- **Caption:** "Hours are each person's own account in testimony, not payroll records."
- **Text alternative:** "Five 24-hour clocks showing workdays of 20 to 24 hours described by former assistants, against a standard 8-hour day."
- **Why this form:** Mia's first day centred on a job with no off hours; clocks make time use comparable at a glance, and small multiples compare people without ranking them.
- **Content level:** 3. The chart shows only hours, but the page's "Also in court today" notes, without detail, that Mia testified Combs sexually assaulted her.
