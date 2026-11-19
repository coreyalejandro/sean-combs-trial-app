// Day 27 copy and settings. Owned by Builder 4 (the record and the system).
// Copy comes from DESIGN_29.md (Day 27). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 27,
  title: "Crossing State Lines: The Trips Behind the Transportation Charges",
  question: "Which trips in the records connect to the two transportation counts?",
  form: "Great-circle arc map",
  contentLevel: 2,
  caption: "Arcs appear only where records name both ends of a trip. The finale uses the same arcs for every survivor in the march.",
  howToRead: 'An arc joins two cities only where a record names both ends of a trip; a ring marks an arrival city when where the trip began was not reported. Solid marks are dated in the Ventura count period, dashed red marks in the Jane count period. Select a trip in the list, or play them in date order.',
  altShort: "Map of trips named in the transportation charges, including Atlanta to Newark in 2023, with arrival cities marked where only the destination was reported.",
  counts: [3, 5],
  status: 'done',
}
