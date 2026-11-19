# Day 1: Two Opening Statements, One Set of Charges

**Owner:** Builder 1 (the first week: one woman's account). You own every file in this folder (`src/viz/day-01/`) and `tests/e2e/day-01.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day01.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 1 (Monday, May 12): Two Opening Statements, One Set of Charges

- **Question:** Before any witness spoke, what did each side tell the jury the case was about?
- **Form:** an aligned claim diff. Two columns, prosecution left and defense right, with topic rows between them ("The hotel video payment", "The men who were paid", "The violence", "The years"), each joined by a thin ribbon. Above it, the first appearance of the charge ribbon (five counts in plain words). Below it, the first two stars of the witness constellation.
- **Data:** D1 `testimony_points` for the prosecution opening (about 20 years of conduct through an enterprise of employees; $100,000 cash and an NDA for the hotel video; searches found guns, drugs, lubricant) and the defense opening ("love, jealousy, infidelity and money"; domestic violence is not sex trafficking; the payment was to avoid bad publicity; the men were paid for porn-related work). `numbers`: 5 counts (high, repeated on D8, D11, D24); 15-year mandatory minimum, maximum life (high: AP, D11 Fox); 12 jurors, 8 men and 4 women (high: AP, CBS NY, NBC, Fox; one CBS blog error noted); 6 alternates (high with D24 CBS); "about 20 years" (low, CBS blog); $100,000 (an allegation here, low on D1, high once D15 testimony arrives). Peremptory strikes 10 and 6 and the "7 Black jurors" claim (low; conflict with D21) go in the Day 24 jury tracker instead.
- **Interaction:** select a topic row to highlight both claims and see "Tested on Day 15, Day 16" links. Select a count in the ribbon to read its plain-language definition. The verdict is hidden behind "See how the jury decided" until the viewer chooses it.
- **Caption:** "Openings are not evidence. They are each side's map of what it plans to prove."
- **Text alternative:** "Side-by-side list of four topics, showing how the prosecution and the defense each described them in opening statements, under the five charges."
- **Why this form:** openings are two competing frames over the same facts; a diff makes the disagreement readable topic by topic and sets up every later day as a test of one side's map.
- **Content level:** 2.
