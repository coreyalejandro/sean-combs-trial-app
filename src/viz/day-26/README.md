# Day 26: Who Did What: The Staff Around Combs, as Witnesses Described

**Owner:** Builder 4 (the record and the system). You own every file in this folder (`src/viz/day-26/`) and `tests/e2e/day-26.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day26.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 26 (Friday, June 20): Who Did What: The Staff Around Combs, as Witnesses Described

- **Question:** What tasks did employees say they did, and who directed them?
- **Form:** a three-part network drawn as a hive plot: people on one axis (Combs; chief of staff Kristina Khorram, who was not charged and did not testify; former assistants James, Kaplan, Clark, Mia, Perez and Paul; security staff), tasks on a second (booking hotels under aliases, stocking rooms, buying drugs, cleaning rooms, arranging travel, carrying cash, keeping schedules), and direction on the third (who said they were told by whom).
- **Data:** D7 James (stocking a bag, Frank Black bookings; high: CNN, Fox); D8 Kaplan (rooms, cleaning, drugs once; high: Fox, ABC); D10 Clark; D12 Mia (cleaning and supplying rooms; high: NBC, Fox); D23 Perez (buying drugs "a handful of times"; arranging a $3,500 payment; low, GMA); D26 Paul ("Khorram basically ran the enterprise"; low, ABC); D24 Khorram texts (stock a Four Seasons room, fetch $4,000; low, NBC); D27 Khorram texts (rides, a Las Vegas hotel; high: NBC, ABC). D15 Derek Ferguson, who said he never saw any of it, is a node with no task links, on purpose.
- **Interaction:** select a person to see their tasks, a task to see who did it; on phones it becomes a person-by-task grid.
- **Caption:** "Count 1 asked whether these people formed a criminal enterprise. The answer is on the verdict page."
- **Text alternative:** "Network of nine people and seven tasks, showing which former assistants said they booked hotels, stocked rooms, bought drugs or arranged travel, and who directed them."
- **Why this form:** Paul's testimony was about relationships between people and tasks; a network shows that structure, and the hive layout keeps it readable.
- **Thin data:** a short court day with one main outlet; the network leans on earlier days.
- **Content level:** 2.

---

## Build notes (Builder 4)

- **Built:** hive plot (three axes: people who worked for Combs, seven kinds of task, who directed) in SVG; on phones a person-by-task grid. Selecting a name or task lights its links and quotes the record text behind each.
- **Method:** a link is drawn only when a day record holds words matching that link's rule (`RULES` in `select.ts`: person, task or director, and the words). The matched clause is shown as the evidence; if the record changes, the link disappears. Derek Ferguson (Day 15) is a node with no task links on purpose, with his "never saw" testimony shown; security staff appear with no task from the list.
- **Adaptation:** DESIGN_29's "D27 Khorram texts" are now Day 27 (June 23); "D26 Paul" is Day 26 (June 20). Khorram is labelled from the record as chief of staff, not charged, did not testify.
- Link confidence is at most "one outlet" (each rests on one day's summary sentence); sources are the day's sources.
