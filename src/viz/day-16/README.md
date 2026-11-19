# Day 16: The Life of One Video, from Hotel Camera to Jury Room

**Owner:** Builder 3 (the money and the second account). You own every file in this folder (`src/viz/day-16/`) and `tests/e2e/day-16.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day16.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 16 (Wednesday, June 4): The Life of One Video, from Hotel Camera to Jury Room

- **Question:** Where did the 2016 hotel hallway video go between March 2016 and the jury's deliberations?
- **Form:** a chain-of-custody line, drawn like a subway line with stations: recorded (March 5, 2016); a guard films it on his own phone (D1); the chief of staff asks for it and $100,000 buys "the only copy" (D15); CNN publishes it (May 2024, D19); shown on the first day of trial and at least six times by Day 3; a forensic analyst finds "no anomalies" and assembles it in time order (D16); texts from 2016 about keeping it private (D25); jurors ask to rehear testimony from Ventura and Phillip during deliberations (July 1).
- **Data:** D16 Frank Piazza `testimony_points` and `numbers` (date 2016-03-05, 10 videos enhanced; high: NBC, Yahoo); D1 Florez (high), the judge's refusal to exclude the video (D1); D15 (high for $100,000); D19 CNN release (high); D3 viewing count (low); D25 Khorram texts (low, GMA); epilogue jury note (high: NPR, PBS).
- **Interaction:** step through stations; each shows who handled the video, what was said and the source.
- **Caption:** "This page never shows the video. It shows where the video went."
- **Text alternative:** "Eight-stop line tracing the 2016 hotel video from the hallway camera through a $100,000 purchase, a 2024 news release and forensic checks to the jury's deliberations."
- **Why this form:** Piazza's job was to prove the video was what it claimed to be; a chain-of-custody line is the form that proof takes.
- **Content level:** 2.
