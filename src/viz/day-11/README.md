# Day 11: The Car Fire Investigation: Where the Trail Stopped

**Owner:** Builder 2 (the witnesses around her). You own every file in this folder (`src/viz/day-11/`) and `tests/e2e/day-11.spec.ts` if you add one. Nothing else.

**Files here**

- `index.tsx`: the picture (`default` export) and the `TextVersion` export. Both receive `{ n, day }`.
- `meta.ts`: title, question, form, content level, caption, how-to-read line, short text alternative, status.
- `additions.json`: facts this day needs that `src/data/trial_days.json` lacks, each with sources (schema in `src/lib/data/schema.ts`).
- Add `select.ts` (pull the fields you need), `describe.ts` (long description and table rows from the same selection), `Interactive.tsx` (`'use client'`) and `day11.test.tsx` as you build.

Read `/BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` first. The design below is copied from `DESIGN_29.md`. Where DESIGN_29's day file names differ, the final data wins: Day 26 = June 20 (old `day_27.md`), Day 27 = June 23 (old `day_28.md`), Day 28 = June 24 (now in the data); June 18 is a gap note, not a day.

---

### Day 11 (Wednesday, May 28): The Car Fire Investigation: Where the Trail Stopped

- **Question:** What did investigators do after the January 2012 car fire, and where did the trail stop?
- **Form:** a chain-of-evidence diagram. A left-to-right process (report, police response, fire scene, evidence collected, lab tests, suspect, charges) with solid links where testimony says the step happened and broken links where it says it did not (the glove left on the back seat was not collected or DNA-tested; Clark and Ventura were not reached; no charges; the case went inactive). A legal lane underneath: the fingerprint testimony was struck, and the defense's first mistrial motion was denied.
- **Data:** D11 `testimony_points` (Christopher Ignacio: the entry was not reported as a burglary, low: NBC; Lance Jimenez: the fire was targeted, the canvas top was cut, the glove was not collected, high: NBC, Fox); `numbers`: January 9, 2012 (low, NBC); `legal_events`: mistrial motion denied and fingerprint testimony struck (low on D11, NBC; the motion is confirmed by CNN on D20, high).
- **Interaction:** select a link to read what the witness said about that step and its source.
- **Caption:** "No one was charged for the fire. Jurors were told to disregard testimony suggesting who set it."
- **Text alternative:** "Seven-step investigation chain in which three links are broken: evidence not collected, witnesses not reached, and no charges."
- **Why this form:** Day 11 testimony was about process; a chain with visible breaks shows absences honestly, because what was not done is itself evidence of how the case went cold.
- **Content level:** 1.
