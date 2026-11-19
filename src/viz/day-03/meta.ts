// Day 3 copy and settings. Owned by Builder 1 (the first week: one woman's account).
// Copy comes from DESIGN_29.md (Day 3). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 3,
  title: "What Backs Each Part of Her Account",
  question: "For each event Ventura described, what kind of evidence did the jury see?",
  form: "Evidence matrix that fills over time",
  contentLevel: 3,
  caption: "A filled square means the jury saw that kind of evidence, not that it believed it. No photograph or video is shown here.",
  howToRead: "Each row is an event Ventura testified about; each column a kind of evidence. A dark square shows the trial day that kind of evidence first reached the jury, and red dots count later pieces; a striped square rests on one unconfirmed outlet. Move the slider or press Play to watch it fill, and select a square for its sources.",
  altShort: "Grid of five events from Ventura's testimony against six kinds of evidence, showing which kinds the jury saw for each and on which trial day.",
  status: 'done',
}
