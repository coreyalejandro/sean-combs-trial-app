# Day 6: Where Other People Say They Saw Violence

**Owner:** Builder 1 (the first week: one woman's account). You own every file in this folder (`src/viz/day-06/`) and `tests/e2e/day-06.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day06.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 6 (Monday, May 19): Where Other People Say They Saw Violence

- **Question:** Besides Ventura, who says they saw Combs hurt her, and where and when?
- **Form:** a dot map with a year slider. A map of the United States with a Jamaica inset; each dot is one witness's account of one occasion, placed at the city (not an address), labelled with the witness's name and year. The slider runs from 2007 to 2018 and accumulates dots.
- **Data:** D6 `locations` and years: Dawn Richard, Los Angeles 2009 and Central Park 2009, West Hollywood 2010 (low: Complex; high for the 2009 incident with AP); Kerry Morgan, Los Angeles and Jamaica 2013, and the 2016 hotel aftermath (low: Complex); D1 Daniel Phillip (high: CBS NY, CBS blog); D9 George Kaplan, a flight to Las Vegas (year not reported; ABC; drawn at Las Vegas with "on a flight"), Mylah Morales, Beverly Hills 2010 (high: AP, Fox, ABC); D11 Deonte Nash (more than once; place and year partly unresolved, conflict). Places come from the shared `places` table with a precision field (city or venue).
- **Interaction:** drag or play the slider; select a dot for the witness's paraphrased account and source; "Show as a list".
- **Caption:** "Each dot is one person's sworn account of one occasion. Dots sit on the city, not the address."
- **Text alternative:** "Map of accounts by witnesses who said they saw violence toward Ventura, in Los Angeles, New York, Las Vegas, Beverly Hills and Jamaica, from 2009 to 2016." (The generated version names the computed number of accounts and witnesses.)
- **Why this form:** Day 6 brought three eyewitnesses in one day; place and time together show the testimony ran across a decade and two coasts.
- **Content level:** 2.
