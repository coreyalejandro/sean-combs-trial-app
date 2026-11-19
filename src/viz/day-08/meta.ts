// Day 8 copy and settings. Owned by Builder 2 (the witnesses around her).
// Copy comes from DESIGN_29.md (Day 8). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 8,
  title: "Why Many Survivors Wait to Tell",
  question: "An expert testified that delay in telling is common. In this trial, how long were the gaps between what people described and when they went to police, a lawyer or prosecutors?",
  form: "Dumbbell chart",
  contentLevel: 2,
  caption: "Hughes did not evaluate anyone in this case; she described patterns researchers see. The chart shows only dates reported in coverage. One witness reported within weeks; others waited years.",
  howToRead: 'Each row is one account. The black dot is the year of the earliest event the person described; the red dot is the year of their first step toward a court or police (switch it to their first contact with investigators). White beads count the years in between. The dot\'s style says how sure the date is: solid, hollow, dashed, or split when outlets disagree. Select a row for both dates and their sources.',
  altShort: "Chart of five accounts showing the years between the events described and the first report or legal step, from zero years to about 16.",
  status: 'done',
}
