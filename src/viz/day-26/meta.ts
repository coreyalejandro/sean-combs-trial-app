// Day 26 copy and settings. Owned by Builder 4 (the record and the system).
// Copy comes from DESIGN_29.md (Day 26). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 26,
  title: "Who Did What: The Staff Around Combs, as Witnesses Described",
  question: "What tasks did former employees testify they did, and who did witnesses say gave the instructions?",
  form: "Grid of people and tasks",
  contentLevel: 2,
  caption: "These are accounts witnesses gave and texts shown in court, not findings. Count 1 charged that Combs led a criminal enterprise; the jury found him not guilty of racketeering conspiracy.",
  howToRead: "Each row is a person who worked for Combs; each column is a kind of task. A dot means the person testified they did it. Under a name, 'instructions from' gives who witnesses or texts say asked for the work. Select any name or task to read the reported words behind each link.",
  altShort: "Grid of former assistants and seven kinds of task, showing which tasks each testified to, such as booking hotels, stocking rooms, buying drugs or arranging travel, and who witnesses said gave the instructions.",
  counts: [1],
  status: 'done',
}
