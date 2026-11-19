// Day 27 copy and settings. Owned by Builder 4 (the record and the system).
// Copy comes from DESIGN_29.md (Day 27). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 27,
  title: "Crossing State Lines: The Trips the Reporting Names, for the Two Counts That Ended in Guilty Verdicts",
  question: "Which trips does the reporting name for the two transportation counts, the only charges on which the jury found Combs guilty?",
  form: "Great-circle arc map",
  contentLevel: 2,
  caption: "Arcs appear only where the reporting names both ends of a trip, which it rarely does. The jury found Combs guilty on both transportation counts (Counts 3 and 5).",
  howToRead: 'An arc joins two cities only where the reporting names both ends of a trip; a ring marks an arrival city when where the trip began was not reported. Solid marks are dated in the Ventura count period, dashed red marks in the Jane count period. Select a trip in the list, or play them in date order.',
  altShort: "Map of the few trips the reporting names in the periods of the two transportation counts, including Atlanta to Newark in 2023, with arrival cities marked where only the destination was reported. The reporting does not say which count each trip was offered for.",
  counts: [3, 5],
  status: 'done',
}
