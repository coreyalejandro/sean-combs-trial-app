# Day 24: The Jury Box, Seat by Seat, Across the Trial

**Owner:** Builder 4 (the record and the system). You own every file in this folder (`src/viz/day-24/`) and `tests/e2e/day-24.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day24.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 24 (Monday, June 16): The Jury Box, Seat by Seat, Across the Trial

- **Question:** Who sat on the jury, and how did it change?
- **Form:** a seat-map tracker. Twelve juror seats and six alternate seats drawn as a jury box; a scrubber runs across every court day and changes the seats' state: seated (May 12), a motion to remove Juror 6 (June 11), removal announced (June 13), Juror 6 dismissed and an alternate seated (June 16), a sick juror (June 18), a juror with outside communications kept (June 20), the first jury note about a juror (June 30), the verdict (July 2).
- **Data:** D1 12 jurors, 8 men and 4 women (high), 6 alternates (high), strikes 10 and 6 and the race claim rejected by the judge (low; conflict with D21's 9 strikes); D21 motion and defense response (high: NBC, ABC, CrimeOnline); D23 removal announced (high: GMA, ABC); D24 Juror 6 (41, a Black man) dismissed over inconsistency about where he lived, replaced by a 57-year-old white man from Westchester; 5 alternates remain; a 14-page defense letter (high: CBS, NBC); June 18 (D26 file); June 20 (D27 file); epilogue notes (high). Only what was reported is shown; other seats read "not reported".
- **Interaction:** scrub or step by day; the screen-reader version is a list of changes in order.
- **Caption:** "The judge said the removal rested only on inconsistent answers about where the juror lived. The defense called it discriminatory."
- **Text alternative:** "Jury box of 12 seats and 6 alternates showing one juror replaced on June 16 and the alternate pool falling from 6 to 5."
- **Why this form:** the jury is a state that changes over time; a seat map shows who was in the box at any moment.
- **Content level:** 1.

---

## Build notes (Builder 4)

- **Built:** seat-map tracker: 12 numbered juror seats and 6 alternate seats as a jury box, with Previous / Next, a range slider and an ordered list of every change (the screen-reader version). No-JavaScript readers get the final frame and the full list.
- **Events (all from the records):** Day 1 jury sworn in (12 jurors, 8 men and 4 women, 6 alternates); Day 21 motion to remove Juror No. 6 (the seat number is parsed from the record); Day 22 decision postponed; Day 23 removal announced; Day 24 dismissal and the alternate seated, 5 alternates left; June 18 (the calendar gap note: a juror ill); Day 26 (June 20) a juror with outside communications kept; verdict record June 30 jury note and July 2 verdict.
- **Adaptation to final numbering:** DESIGN_29's "D26 file" (June 18) is now the June 18 calendar note recorded on Day 25; its "D27 file" (June 20) is Day 26.
- Which alternate moved up and which seats the unnamed jurors held were not reported, so those are drawn as "not reported" (the empty alternate seat, a dashed red rail on the box). Strike counts are shown as a conflict (6 on Day 1 vs 9 on Day 21, each one outlet).
