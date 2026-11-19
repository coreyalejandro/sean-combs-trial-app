# Day 4: Her Old Messages, Read Two Ways

**Owner:** Builder 1 (the first week: one woman's account). You own every file in this folder (`src/viz/day-04/`) and `tests/e2e/day-04.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day04.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 4 (Thursday, May 15): Her Old Messages, Read Two Ways

- **Question:** How did the defense use years-old messages, and how did Ventura explain them?
- **Form:** a message-thread timeline. A phone-style column of message bubbles placed on a 2007 to 2017 time axis, each paraphrased, with two annotation lanes beside it: "The defense said this shows…" and "Ventura answered…".
- **Data:** D4 `exhibits` (2007 to 2009 emails and texts; a 2009 text; a 2013 message; a 2017 message she said reflected "when we both want it"); D4 `testimony_points` ("just words at that point"; jealousy; the 2015 South Africa shoot); D26 (June 20) reintroduction of the March 18, 2017 text by the defense (high: NBC) as a linked "seen again on Day 26" badge. `numbers`: 11 years agreed (high: Global, CNN); about four occasions (low); the judge's noon-Friday deadline (low). Dates are given to the year by outlets (medium).
- **Interaction:** "Next message" and "Previous message" buttons (and arrow keys) step through the thread; each step reveals both readings.
- **Caption:** "Both readings are shown because the jury heard both. Messages are paraphrased; this page reproduces no sexual content."
- **Text alternative:** "Five messages from 2007 to 2017, each shown with the defense's reading and Ventura's answer."
- **Why this form:** cross-examination on Day 4 was a contest over what messages meant; a thread with two readings is the honest shape of that contest.
- **Thin data:** about four datable messages; the thread is short on purpose.
- **Content level:** 2.
