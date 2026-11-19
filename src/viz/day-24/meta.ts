// Day 24 copy and settings. Owned by Builder 4 (the record and the system).
// Copy comes from DESIGN_29.md (Day 24). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 24,
  title: "The Jury Box, Seat by Seat, Across the Trial",
  question: "Who sat on the jury, and how did it change?",
  form: "Seat-map tracker",
  contentLevel: 1,
  caption: "The judge said the removal rested only on inconsistent answers about where the juror lived. The defense called it discriminatory.",
  howToRead: 'Use Previous change, Next change or the slider to move through the trial. Juror seats are numbered as reported; red marks the seat at issue, and an empty dashed alternate seat shows the alternate who moved up. Each step shows what was reported and how sure it is.',
  altShort: "Jury box of 12 seats and 6 alternates showing one juror replaced on June 16 and the alternate pool falling from 6 to 5.",
  status: 'done',
}
