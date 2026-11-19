// Day 13 copy and settings. Owned by Builder 2 (the witnesses around her).
// Copy comes from DESIGN_29.md (Day 13). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 13,
  title: "Asked, Settled, Received: Money in the Record on One Scale",
  question: "How does the 2017 settlement over Mia's claims compare with the other settlements, suits and payments named at trial?",
  form: "Log-scale dot line",
  contentLevel: 2,
  caption: "On this scale each step to the right is ten times bigger. A settlement is not an admission by either side.",
  howToRead: 'Further right means more money, and each gridline is ten times the one before. The red dots joined by a dotted line are Mia\'s mediation, from what was asked to what she received; the other dots are amounts named at trial, grouped by kind. A solid dot was reported by two or more outlets, a hollow one by one outlet, a half-filled one where outlets disagree. Switch to the ordinary scale to see why the log scale is needed.',
  altShort: "Log-scale line of amounts named at trial, from $20,000 to $30 million, with Mia's 2017 mediation shown falling from $10 million asked to about $200,000 received.",
  status: 'done',
}
