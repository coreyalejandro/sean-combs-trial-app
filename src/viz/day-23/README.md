# Day 23: Three Searches, Side by Side

**Owner:** Builder 4 (the record and the system). You own every file in this folder (`src/viz/day-23/`) and `tests/e2e/day-23.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day23.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 23 (Friday, June 13): Three Searches, Side by Side

- **Question:** How do the items agents seized in the three searches compare in scale?
- **Form:** a waffle comparison on one shared unit: one tiny square equals one bottle, for the arrest hotel room, the Miami home and the Los Angeles home side by side, with other items (pairs of shoes, boxes, firearm parts) as labelled counts. Day 5 showed one room as icons; Day 23 needs a grid because 1,100 bottles cannot be drawn as icons.
- **Data:** D5 arrest room: 5 bottles (low). D8 Miami: 25 bottles of baby oil and 31 of lubricant (high: Fox, NBC), 13 pairs of heels (low), parts of two AR-15 rifles (D7, high). D23 Los Angeles: 900 bottles of lubricant and 200 of baby oil (low: GMA and ABC count as one outlet family), 18 boxes shown in photos (low), a drum magazine (low), firearms kept in a security room (low).
- **Interaction:** select a site to see the agent, date and source; "Show as a table".
- **Caption:** "Counts as agents testified. The defense asked why lubricant was relevant to a trafficking case."
- **Text alternative:** "Three grids of bottles on one scale: 5 in the arrest room, 56 in Miami and 1,100 in Los Angeles."
- **Why this form:** the Los Angeles numbers dwarf the others; a shared unit shows the scale exactly, without the exaggeration that scaled circles invite.
- **Thin data:** the Los Angeles counts come from one outlet family and the agent's name is unverified.
- **Content level:** 1.
