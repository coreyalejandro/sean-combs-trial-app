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
  howToRead: 'The picture is not built yet. The text version lists every figure reported this day, with how sure each one is and where it came from.',
  altShort: "Map of trips named in the transportation charges, including Atlanta to Newark in 2023, with arrival cities marked where only the destination was reported.",
  status: 'placeholder',
}
