# Day 9: One Man, Many Names: The Hotel Aliases

**Owner:** Builder 2 (the witnesses around her). You own every file in this folder (`src/viz/day-09/`) and `tests/e2e/day-09.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day09.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 9 (Thursday, May 22): One Man, Many Names: The Hotel Aliases

- **Question:** What names did hotel records show Combs using, and at which hotels?
- **Form:** a two-sided network. Aliases on one side, hotels on the other, joined by lines labelled with years; node size is the number of records or testimony mentions.
- **Data:** D9 Frédéric Demmour (L'Ermitage): Frank White, Frank Black, Jackie Star, Ryan Lopez (low, Fox; spelling of his name conflicts); January 10, 2010 stay and $500 wax-damage charge (low). D14 Sylvia Oken (Beverly Hills Hotel): Phillip Pines and Frank Black; a bill of over $6,600 (low). D7 David James and D8 George Kaplan: rooms booked under Frank Black (high across CNN and Fox). D5 pills under Frank Black (low). D16 the "Frank Black" laptop profile (high: NBC, Yahoo). D17 Trump International, September 24 to 29, 2016, Frank Black (high: NBC, ABC, CNN). D24 Trump International bill, October 14, 2022 (low).
- **Interaction:** select an alias to light up its hotels and the days it came up, or a hotel to light up its aliases. On phones it becomes an alias-by-hotel grid.
- **Caption:** "The defense noted that celebrities commonly use aliases (Day 14). Prosecutors said these kept hotel stays hidden."
- **Text alternative:** "Network linking five aliases to five hotels, with 'Frank Black' connected to the most hotels and years."
- **Why this form:** aliases and hotels are many-to-many; a network is the native shape of that relationship.
- **Content level:** 1.
