# Day 7: The $20,000 That Went to Combs and Came Back

**Owner:** Builder 1 (the first week: one woman's account). You own every file in this folder (`src/viz/day-07/`) and `tests/e2e/day-07.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day07.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 7 (Tuesday, May 20): The $20,000 That Went to Combs and Came Back

- **Question:** What happened to the $20,000 Combs demanded from Ventura's parents in December 2011?
- **Form:** a money path on a calendar. One token moves along a December 2011 day strip between four stations (the family's home-equity loan, the wire, the receiving account, the return), and on the dates where bank records match, a "matched by bank records, Day 15" stamp appears.
- **Data:** D7 `numbers`: $20,000 demanded, home-equity loan, wired, later returned (high: Global News, D9 Fox, D9 Fox 5); December 23, 2011 email from Ventura to her mother and an assistant (high); bruise photos December 24 (low; shown only as a date, no image). D15 bank records from Derek Ferguson: December 14 transfer of $20,000 to Ventura (NBC), December 23 $20,000 wire from her father and December 27 $20,000 out marked "return of funds" (ABC) (low each; dates differ by outlet, conflict shown). D7 legal event: the judge admitted the testimony as possible extortion evidence (low, Global News).
- **Interaction:** play or step day by day; quiet mode shows the finished strip with all stations labelled.
- **Caption:** "Regina Ventura testified the money was demanded under a threat to release private videos. Bank records shown on Day 15 match the dates."
- **Text alternative:** "Calendar of December 2011 tracing $20,000 from the Ventura family's home-equity loan to a Combs-related account and back, with dates confirmed by bank records."
- **Why this form:** one sum moving through dates is a single path in time; a moving token on a calendar is clearer than a flow diagram for one path.
- **Content level:** 2.
