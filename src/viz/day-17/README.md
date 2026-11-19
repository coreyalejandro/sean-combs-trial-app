# Day 17: Two Places at Once? A Hotel Bill Tests a Date

**Owner:** Builder 3 (the money and the second account). You own every file in this folder (`src/viz/day-17/`) and `tests/e2e/day-17.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day17.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 17 (Thursday, June 5): Two Places at Once? A Hotel Bill Tests a Date

- **Question:** How did hotel records challenge the date of one witness's account?
- **Form:** a space-and-time contradiction diff. Two small linked maps (Los Angeles and New York, about 2,450 miles apart, "calculated") above one shared date strip for September 24 to 30, 2016: a bar for the Trump International stay in New York (September 24 to 29), a point for the date on Bongolan's injury photos in Los Angeles (September 26), a point for the defense's account of a morning event in New York (September 26), and a point for Ventura's September 30 text about the incident. A resolution lane below: Bongolan said she misremembered the date, not the event; on Day 20 the judge said the government "screwed up" but denied a mistrial because the defense had cross-examined effectively.
- **Data:** D17 `numbers`: stay September 24 to 29, 2016 (high: NBC, ABC, CNN); photo date September 26 (high); text September 30 (high: ABC, NBC); held 10 to 15 seconds, 17th floor (high, as words only). D20 `legal_events` (high: NBC, CNN). The judge's warning to Combs about nodding at jurors goes to the Day 20 docket tracker.
- **Interaction:** toggle "What the records show", "What the witness said" and "What the judge ruled"; scrub the dates.
- **Caption:** "A hotel bill shows where a stay was booked, not where a person was every hour. The judge left the weight of this testimony to the jury."
- **Text alternative:** "Two maps and a date strip showing a New York hotel stay of September 24 to 29, 2016, overlapping the September 26 date on photos from Los Angeles."
- **Why this form:** a contradiction is a mismatch in both place and time, so the picture needs both axes side by side.
- **Content level:** 2.
