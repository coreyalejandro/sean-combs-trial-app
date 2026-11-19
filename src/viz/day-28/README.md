# Day 28: 34 Witnesses for the Prosecution, None for the Defense

**Owner:** Builder 4 (the record and the system). You own every file in this folder (`src/viz/day-28/`) and `tests/e2e/day-28.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day28.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 28 (Tuesday, June 24): 34 Witnesses for the Prosecution, None for the Defense

- **Question:** Who testified over the 28 days, and what did the defense present?
- **Form:** a witness constellation. All 34 witnesses as stars in the order they first took the stand, grouped by role (the two women named in the charges, other people who described harm, eyewitnesses, former staff, police and agents, record keepers, the expert), star size by days on the stand, faint lines between witnesses who described the same event. The opposite half of the sky is empty except for "Defense: no witnesses, under 30 minutes reading exhibits into the record" and "Combs chose not to testify, as is his right."
- **Data:** the shared `witnesses` table, one row per witness with first day, days on the stand, role and immunity; a test checks the count equals 34 (it does today: Florez, Phillip, Ventura, Binda, Richard, Morgan, James, Regina Ventura, Hayes, Gannon, Hughes, Kaplan, Mescudi, Morales, Demmour, Croft, Clark, Ignacio, Jimenez, Nash, Mia, Oken, Garcia, Ferguson, Piazza, Bongolan, Santos, Jane, the Los Angeles search agent, Perez, Sankar, Penland, Paul, Cerciello; Croft's day is unconfirmed, low). The D28 record (to be created) supplies the rest and the Rule 29 argument (gma32, afp, abc623, wiki).
- **Interaction:** select a star for a one-line card (role, days, immunity, what they testified about) with a link to their days; pseudonymous witnesses show only the pseudonym; filter by role. This is the same constellation as the index, now complete.
- **Caption:** "A defendant never has to testify or call witnesses. The burden of proof is on the prosecution."
- **Text alternative:** "Constellation of 34 prosecution witnesses in the order they testified over 28 days, beside an empty space for the defense, which called none."
- **Why this form:** the last testimony day closes the record; the constellation shows the whole cast at once and the asymmetry between the sides.
- **Thin data:** no day file yet.
- **Content level:** 1.
