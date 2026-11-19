# Day 10: December 2011, Told by Six Witnesses

**Owner:** Builder 2 (the witnesses around her). You own every file in this folder (`src/viz/day-10/`) and `tests/e2e/day-10.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day10.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 10 (Tuesday, May 27): December 2011, Told by Six Witnesses

- **Question:** How do different witnesses' accounts of the same few weeks line up?
- **Form:** a corroboration strip. A day-by-day calendar from December 1, 2011 to January 15, 2012; each event is a column, and under it a stack of small witness glyphs shows who described it (Ventura D3, Regina Ventura D7, Kid Cudi D9, Capricorn Clark D10, the police officer and the arson investigator D11, the finance chief's bank records D15).
- **Data:** shared `events` for December 2011: Combs learns of the Cudi relationship (D3, D9; high); December 14 transfer (D15, low); Clark says Combs came to her door at about 5:30 to 6 a.m. on December 22 (date high: Fox, NBC; time low: Fox) and made her go with him to Cudi's home; the entry at Cudi's home (D9, high: CBS, AP, Fox; police account D11); December 23 email and wire (D7, D15); December 27 return (D15, low); the car fire about a month later, with an engine company finding it on January 9, 2012 (month high; date low: NBC). D10 `numbers` for Clark's own story (five days of lie-detector tests, high; about 40 hours, low; $55,000 salary, low) appear in the detail panel.
- **Interaction:** select an event for each witness's paraphrased account and its day; filter to one witness to see only their columns.
- **Caption:** "Agreement on dates is not proof of who did what. The judge told jurors to disregard testimony suggesting who set the fire (Days 9 and 11)."
- **Text alternative:** "Calendar of December 2011 to January 2012 showing seven events and which of six witnesses or records described each."
- **Why this form:** Clark was the only witness on Day 10, and her account is best read as one strand in a cluster; visual investigators build exactly this kind of linear, sourced timeline from many accounts.
- **Thin data:** one witness that day; many of her figures come from one outlet.
- **Content level:** 2.
