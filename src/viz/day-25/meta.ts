// Day 25 copy and settings. Owned by Builder 4 (the record and the system).
// Copy comes from DESIGN_29.md (Day 25). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 25,
  title: "What the Jury Was Shown, by Kind of Evidence",
  question: "What kinds of evidence went before the jury, and how much of it the public could not see?",
  form: "Treemap",
  contentLevel: 2,
  caption: "Counts are exhibits named in news coverage, not the court's official exhibit list, which was not opened for this project.",
  howToRead: 'Each small tile is one exhibit named in news coverage, grouped into blocks by kind; bigger blocks hold more exhibits. Blue and amber tiles were presented by the prosecution or the defense as coverage states; pale tiles do not say. Hatched tiles were sealed from the public. Select a block to list its exhibits.',
  altShort: "Treemap of every exhibit named in coverage, grouped by kind, with sealed recordings hatched.",
  status: 'done',
}
