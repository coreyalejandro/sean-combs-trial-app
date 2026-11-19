// Day 17 copy and settings. Owned by Builder 3 (the money and the second account).
// Copy comes from DESIGN_29.md (Day 17). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 17,
  title: "Two Places at Once? A Hotel Bill Tests a Date",
  question: "How did hotel records challenge the date of one witness's account?",
  form: "Space-and-time contradiction diff",
  contentLevel: 2,
  caption: "A hotel bill shows where a stay was booked, not where a person was every hour. The judge left the weight of this testimony to the jury.",
  howToRead: 'The map shows where; the strip below shows when, one row per city. Bars are stays, dots are dated records, the diamond is the witness. Scrub the dates to light up the cities on that day; switch the three layers on and off; select a mark for its words and sources.',
  altShort: "Two maps and a date strip showing a New York hotel stay of September 24 to 29, 2016, overlapping the September 26 date on photos from Los Angeles.",
  status: 'done',
}
