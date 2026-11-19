# Day 5: What Agents Found in the Hotel Room on the Day of the Arrest

**Owner:** Builder 1 (the first week: one woman's account). You own every file in this folder (`src/viz/day-05/`) and `tests/e2e/day-05.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day05.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 5 (Friday, May 16): What Agents Found in the Hotel Room on the Day of the Arrest

- **Question:** What did agents find when they arrested Combs at a Manhattan hotel on September 16, 2024?
- **Form:** an isotype pictograph. One plain icon per unit: nine $1,000 bundles for the $9,000, five bottles, one lighting device, one pill bottle labelled under an alias, one bag of powder that was tested. A small bar beside it marks Ventura's four days on the stand, which ended this day.
- **Data:** D5 `numbers`: arrest date 2024-09-16 (low, GMA; widely reported); $9,000 in a fanny pack (high: GMA, D6 GMA photo release); 5 baby-oil bottles (low, GMA); alias "Frank Black" on the pills (low here, high in the alias network on Day 9); Ventura on the stand 4 days, May 13 to 16 (high: NPR, D9 AP). D5 cross point: a woman's belongings were in the room.
- **Interaction:** focus or tap an icon for the item, the witness (agent Yasin Binda) and the source; "Show as a list" toggle.
- **Caption:** "Items as the agent listed them. On cross-examination, the defense pointed out a woman's belongings were also in the room."
- **Text alternative:** "Pictograph of items found in the arrest room: $9,000 in cash, five bottles of baby oil, pills under an alias, a powder tested for drugs, and a lighting device."
- **Why this form:** the agent's testimony was a list of discrete objects; icons make a list tangible without photographs.
- **Content level:** 2.
