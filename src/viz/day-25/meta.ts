// Day 25 copy and settings. Owned by Builder 4 (the record and the system).
// Copy comes from DESIGN_29.md (Day 25). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 25,
  title: "What the News Said the Jury Was Shown, by Kind of Evidence",
  question: "What kinds of evidence went before the jury, and how much of it the public could not see?",
  form: "Bar chart by kind",
  contentLevel: 2,
  caption: "Counts are exhibits named in news coverage, once each, leaving out what the judge excluded and what was only described. They are not the court's official exhibit list.",
  howToRead: 'Each bar is one kind of evidence; a longer bar means more exhibits of that kind were named in coverage. The hatched part of a bar was sealed from the public. Select a kind to list its exhibits, each linked to its day.',
  altShort: "Bar chart of the exhibits news coverage names, one bar per kind of evidence, with the sealed part of each bar hatched.",
  status: 'done',
}
