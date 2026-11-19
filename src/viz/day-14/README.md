# Day 14: What Mia Posted, and What She Said Was Happening

**Owner:** Builder 2 (the witnesses around her). You own every file in this folder (`src/viz/day-14/`) and `tests/e2e/day-14.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day14.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 14 (Monday, June 2): What Mia Posted, and What She Said Was Happening

- **Question:** How did the defense use Mia's public posts and texts, and how did she explain them?
- **Form:** a mirrored two-track timeline, 2009 to 2024. Above the axis: what was public or sent (a birthday post, a birthday gift, texts from December 2016 to December 2022, a birthday video). Below the axis: her account of the same years (employment 2009 to 2017, leaving in 2017, the 2017 mediation, her first meetings with prosecutors in January 2024, messages from Combs in February 2024).
- **Data:** D13 `exhibits` (posts 2013 to 2016; a November 4, 2013 post; a book of articles and a letter for his birthday, November 2014; an October 26, 2015 chat; a December 6, 2016 text; February 4 and 7, 2024 messages) (high: Fox, NBC); D14 `exhibits` (texts December 2016, January, March and April 2019, Christmas 2018, August 29, 2020, July 30, 2022, December 28, 2022; Defense Exhibit 1750) (low, Fox); `numbers`: 28 meetings with prosecutors (low, NBC); the same question asked more than 100 times (low, NPR); her later job lasting 6 or 8 months (conflict). `legal_events`: the "money grab" phrase struck; the judge cautioned the defense lawyer as argumentative and repetitive; her face shown on the overflow feed in error (not depicted).
- **Interaction:** select any item to see its counterpart across the axis; a strip of small ticks along the bottom shows the "100 or more" repetitions as one annotation, labelled as NPR's count.
- **Caption:** "Mia testified she posted out of fear and job pressure ('I was terrified and brainwashed'). The defense said the posts showed real affection. Both are shown."
- **Text alternative:** "Timeline from 2009 to 2024 with public posts and texts above the line and Mia's account of the same years below it."
- **Why this form:** her cross-examination set a public record against a private account; mirrored tracks put both on one clock.
- **Content level:** 2.
