// Day 26 copy and settings. Owned by Builder 4 (the record and the system).
// Copy comes from DESIGN_29.md (Day 26). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 26,
  title: "Who Did What: The Staff Around Combs, as Witnesses Described",
  question: "What tasks did employees say they did, and who directed them?",
  form: "Hive-plot network",
  contentLevel: 2,
  caption: "Count 1 asked whether these people formed a criminal enterprise. The answer is on the verdict page.",
  howToRead: 'Three axes run out from the centre: people who worked for Combs, the tasks they described, and who directed them. A solid line means a person said they did a task; a dashed red line means the record says who directed them. Select any name or task to read the record behind each line. On a phone the same links are a grid.',
  altShort: "Network of the people around Combs and seven kinds of task, showing which former assistants said they booked hotels, stocked rooms, bought drugs or arranged travel, and who directed them.",
  counts: [1],
  status: 'done',
}
