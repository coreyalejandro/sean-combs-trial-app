// Day 21 copy and settings. Owned by Builder 3 (the money and the second account).
// Copy comes from DESIGN_29.md (Day 21). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 21,
  title: "Every Payment Named in Jane's Testimony",
  question: "What money moved between Combs and Jane, and when?",
  form: "Payment beeswarm",
  contentLevel: 2,
  caption: "Prosecutors said the rent was leverage. The defense said the gifts showed a loving relationship. Jane's answer comes on Day 22.",
  howToRead: 'Read left to right through time. The upper bands are money paid each month; the dots below are one-time payments, their area true to the dollars; red dashes are what Jane asked for. Undated amounts and the total sit at the side on the same scale. Select any amount for what it was and who reported it; the switch hides one-outlet amounts.',
  altShort: "Timeline of payments from 2021 to 2024, including about $150,000 wired in total and $10,000 a month in rent from March 2023.",
  status: 'done',
}
