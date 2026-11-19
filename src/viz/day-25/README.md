# Day 25: What the Jury Was Shown, by Kind of Evidence

**Owner:** Builder 4 (the record and the system). You own every file in this folder (`src/viz/day-25/`) and `tests/e2e/day-25.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day25.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 25 (Tuesday, June 17): What the Jury Was Shown, by Kind of Evidence

- **Question:** What kinds of evidence went before the jury, and how much of it the public could not see?
- **Form:** a treemap of every exhibit named in coverage across the 28 days, grouped by kind (video, audio, text and email, photograph, financial record, hotel record, travel record, seized item, document), with a hatch pattern on items sealed from the public, and the prosecution and defense split shown inside each block.
- **Data:** every day's `exhibits`, each tagged by the scaffold with `type`, `sealed` and `side`; counts are computed. Day 25's own items: business accounts at Signature Bank paying 2010 airline tickets for Ventura and a sex worker (low, GMA); a $944,059 monthly card bill (low, GMA); more than $46,000 in room damage at a Times Square hotel (low, GMA); sealed recordings watched on headphones (high: GMA, ABC).
- **Interaction:** select a block to list its exhibits with day links; toggle prosecution and defense.
- **Caption:** "Counts are exhibits named in news coverage, not the court's official exhibit list, which was not opened for this project."
- **Text alternative:** "Treemap of every exhibit named in coverage, grouped by kind, with sealed recordings hatched." (The generated version adds the computed counts for each kind.)
- **Why this form:** a summary witness speaks to the whole body of records; a treemap shows the parts of a whole.
- **Thin data:** one witness that day; the day's own figures are from one outlet.
- **Content level:** 2.

---

## Build notes (Builder 4)

- **Built:** squarified treemap (d3.treemap), one tile per exhibit named in the day records across all 28 days, grouped by kind; tiles coloured by the side coverage states (prosecution blue, defense amber, pale when not stated), hatched when sealed, red-outlined when named on this day. Block buttons and keyboard selection list each block's exhibits with day links; side buttons highlight one side.
- **Method (the scaffold did not tag exhibits):** kind, sealed and side are computed from each exhibit's own words by the ordered rules in `select.ts` (for example "audio", "photo", "bank"; "sealed", "jury only"; "(defense)"). Side is "not stated" for most exhibits because coverage rarely says; that is shown, not guessed.
- **Care:** exhibit descriptions are shown with quoted message text removed, and descriptions of injuries, sexual material or people hired for encounters are replaced by plain general words; third parties are redacted (including one name the shared redactor lacks; see SHARED_REQUEST.md).
- **Day 25's own figures** ($944,059 card bill, more than $46,000 vs $46,786 hotel damage, 2010 tickets, sealed recordings on headphones) are listed under the treemap with their marks.
