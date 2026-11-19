# Day 20: Motions, Rulings and Immunity: The Legal Fights Behind the Testimony

**Owner:** Builder 3 (the money and the second account). You own every file in this folder (`src/viz/day-20/`) and `tests/e2e/day-20.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day20.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 20 (Tuesday, June 10): Motions, Rulings and Immunity: The Legal Fights Behind the Testimony

- **Question:** What legal fights happened outside the jury's view, and how did each end?
- **Form:** a docket tracker. Lanes by kind (mistrial motions; immunity and the Fifth Amendment; juror issues; warnings and leaks; evidence rulings), with events placed by trial day and an outcome shape and word on each (granted, denied, struck, pending, reserved).
- **Data:** `legal_events` from all days: first mistrial motion May 28, denied (D11, D20 CNN; high); second mistrial motion over the balcony date, denied June 10 (high: NBC, CNN); immunity for George Kaplan (D8), Eddy Garcia (D14 to 15), Bryana Bongolan (D16), Jonathan Perez (D23, "4th witness with immunity" per GMA), Brendan Paul (D26), Jane (D19); warning to Combs for nodding at jurors, June 5 (high); the leak warning, "Someone's lying", June 17 (low, GMA); Juror 6 (D21, D23, D24); the sick juror, June 18; a juror with outside communications kept, June 20 (low, ABC); the video exclusion bid denied (D1); media requests to see sealed recordings denied (D2, D3); Rule 29 ruling reserved, June 24. The count of motions and denials on the chart is computed from the data.
- **Interaction:** filter by kind; select an event for its ruling and source; on phones it becomes a vertical list with the same outcome shapes.
- **Caption:** "Most of the trial's legal fights happened with the jury out of the room. This is the record of them."
- **Text alternative:** "Tracker of the trial's legal events across five kinds, showing two mistrial motions denied and six witnesses given immunity." (The generated version adds the computed total.)
- **Why this form:** Day 20 opened with the judge denying the second mistrial; a docket tracker makes the legal process a story of its own.
- **Content level:** 1.
