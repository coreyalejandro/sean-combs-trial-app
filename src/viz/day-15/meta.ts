// Day 15 copy and settings. Owned by Builder 3 (the money and the second account).
// Copy comes from DESIGN_29.md (Day 15). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 15,
  title: "Where the $100,000 for the Hotel Video Went",
  question: "How was the cash paid for the 2016 hotel video divided, according to Eddy Garcia, a hotel security officer?",
  form: "Sankey with a confidence switch",
  contentLevel: 1,
  caption: "Prosecutors called the payment a bribe and part of the racketeering case. The defense said it was meant to keep a damaging video out of the news (Day 1).",
  howToRead: 'Money flows left to right (top to bottom on a phone); each band is as wide as the dollars in it. Solid parts were reported by two or more outlets, striped parts by one. Select a part for what Garcia said and who reported it; the switch hides every one-outlet figure.',
  altShort: "Flow diagram of $100,000 in cash: $30,000 to the security supervisor, the rest to his boss and other guards in amounts outlets report differently, with an NDA carrying a $1 million penalty.",
  status: 'done',
}
