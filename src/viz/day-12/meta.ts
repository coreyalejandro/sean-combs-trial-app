// Day 12 copy and settings. Owned by Builder 2 (the witnesses around her).
// Copy comes from DESIGN_29.md (Day 12). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 12,
  title: "Workdays Without an End: What Former Assistants Described",
  question: "How long did people who worked for Combs say their workdays were?",
  form: "24-hour clocks, small multiples",
  contentLevel: 3,
  caption: "Hours are each person's own account in testimony, not payroll records.",
  howToRead: 'Each dial is one person\'s account. The red arc is the hours they testified to working in a day (or a week, on the week dial); the thin grey arc is a traditional workday for comparison. A solid arc was reported by two or more outlets, an outlined one by one outlet, a dashed one by one outlet and unconfirmed. Blocks under a dial count the days without sleep, where one was described. Select a dial for the person\'s own words and the sources.',
  altShort: "Five small multiples for former staff: 24-hour clocks showing workdays of 20 to 22 hours and a week of 80 to 100 hours, against a traditional 8-hour day, with the longest stretches without sleep (three and five days).",
  status: 'done',
}
