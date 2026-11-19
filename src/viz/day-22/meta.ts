// Day 22 copy and settings. Owned by Builder 4 (the record and the system).
// Copy comes from DESIGN_29.md (Day 22). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 22,
  title: "Six Days on the Stand: Jane's Testimony, Hour by Hour",
  question: "How long did Jane testify, and who was questioning her at each point?",
  form: "Testimony Gantt",
  contentLevel: 2,
  caption: "\"Is that all I'm worth in three years?\" (Jane's last answer, June 12).",
  howToRead: 'Each row is a court day and runs left to right along the clock. Blue is the prosecution asking, amber the defense; striped bars are redirect, re-cross and the closed conference. Dashed outlines mean the times are approximate or were not reported. Select a bar for its times and topics.',
  altShort: "Chart of six court days of Jane's testimony, split between prosecution and defense questioning, ending June 12.",
  counts: [4, 5],
  status: 'done',
}
