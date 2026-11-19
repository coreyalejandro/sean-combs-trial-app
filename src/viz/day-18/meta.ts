// Day 18 copy and settings. Owned by Builder 3 (the money and the second account).
// Copy comes from DESIGN_29.md (Day 18). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 18,
  title: "How Long the Nights Lasted, in Two Women's Testimony",
  question: "How long did the encounters both women described last, and how long did recovery take?",
  form: "Duration range plot",
  contentLevel: 3,
  caption: "Durations as each woman testified. Two accounts, more than a decade apart, describe encounters of similar length, which Ventura said Combs called 'freak-offs' and Jane called 'hotel nights'. Prosecutors offered these nights as part of their case that the women took part under force, fraud or coercion; the defense argued they were consenting adults.",
  howToRead: 'Each bar runs from the shortest to the longest figure a witness gave for one length of time; a dot is a single figure. Bars are grouped by witness, with the years each account covers. Solid means two or more outlets reported it, outlined one outlet, striped one outlet unconfirmed. Switch the axis between hours and days; select a bar for its source.',
  altShort: "Range chart comparing durations Ventura described (36 hours to four days, about 2008 to 2018) with those Jane described (12 hours to three and a half days, 2021 to 2023).",
  status: 'done',
}
