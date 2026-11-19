// Day 1 copy and settings. Owned by Builder 1 (the first week: one woman's account).
// Copy comes from DESIGN_29.md (Day 1). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 1,
  title: "Two Opening Statements, One Set of Charges",
  question: "Before any witness spoke, what did each side tell the jury the case was about?",
  form: "Aligned claim diff",
  contentLevel: 2,
  caption: "Openings are not evidence. They are each side's map of what it plans to prove.",
  howToRead: "Prosecution claims sit on the left in blue, defense claims on the right in amber, joined through the topic between them; a dashed line means that side's claim on the topic was not reported. Select a topic to see the later days that tested it.",
  altShort: "Side-by-side list of four topics, showing how the prosecution and the defense each described them in opening statements, under the five charges.",
  status: 'done',
}
