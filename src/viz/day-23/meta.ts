// Day 23 copy and settings. Owned by Builder 4 (the record and the system).
// Copy comes from DESIGN_29.md (Day 23). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 23,
  title: "Three Searches, Side by Side",
  question: "How do the items agents seized in the three searches compare in scale?",
  form: "Shared-unit waffle comparison",
  contentLevel: 1,
  caption: "Counts as agents testified. The defense asked why lubricant was relevant to a trafficking case.",
  howToRead: 'Every small square is one bottle, the same size in all three grids, so the grids compare exactly. Dark squares are lubricant, grey squares baby oil. A dashed top rule means the counts come from one outlet. Other items are listed under each grid.',
  altShort: "Three grids of bottles on one scale, one square per bottle, for the arrest room, the Miami home and the Los Angeles home.",
  status: 'done',
}
