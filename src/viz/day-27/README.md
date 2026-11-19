# Day 27: Crossing State Lines: The Trips Behind the Transportation Charges

**Owner:** Builder 4 (the record and the system). You own every file in this folder (`src/viz/day-27/`) and `tests/e2e/day-27.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day27.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 27 (Monday, June 23): Crossing State Lines: The Trips Behind the Transportation Charges

- **Question:** Which trips in the records connect to the two transportation counts?
- **Form:** an arc map using John Loewen's great-circle arc method (in SVG with d3-geo). Arcs are drawn only where records name both ends of a trip; where only the destination is known, a ring marks the arrival city. Count 3 (Ventura) arcs are solid and Count 5 (Jane) arcs are dashed, with labels.
- **Data:** D27 a sex worker flown from Atlanta to Newark and housed at a New York hotel in September 2023, paid on Combs's card (high: NBC, ABC, NBC newsletter); D24 flight records and a London hotel stay for a sex worker, December 2009 (low, NBC); D25 2010 airline tickets paid through a business account (low, GMA; route not given, ring only); D2 workers flown into Los Angeles, Miami and Las Vegas (high; origins not given, rings only); D17 Jane's travel to Turks and Caicos, Miami, Los Angeles and New York, May 2021 to October 2023 (low, NBC). Workers are never named.
- **Interaction:** select an arc for the record, the count and the source; "Play in date order".
- **Caption:** "Arcs appear only where records name both ends of a trip. The final map uses the same arcs for 78 million people."
- **Text alternative:** "Map of trips named in the transportation charges, including Atlanta to Newark in 2023, with arrival cities marked where only the destination was reported."
- **Why this form:** the transportation counts are about movement between places, so arcs are the native form, and they rhyme with the finale.
- **Content level:** 2.
