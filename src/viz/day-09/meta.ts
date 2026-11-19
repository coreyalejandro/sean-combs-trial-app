// Day 9 copy and settings. Owned by Builder 2 (the witnesses around her).
// Copy comes from DESIGN_29.md (Day 9). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 9,
  title: "One Man, Many Names: The Hotel Aliases",
  question: "What names did hotel records show Combs using, and at which hotels?",
  form: "Two-sided network",
  contentLevel: 1,
  caption: "The defense noted that celebrities commonly use aliases (Day 14). Prosecutors said these kept hotel stays hidden.",
  howToRead: 'Names are on the left and places on the right; each line is one record or testimony tying a name to a place. Solid lines were reported by two or more outlets, dashed lines by one. Bigger marks connect to more. Select a name or a place to light up its links and read what was reported behind them.',
  altShort: "Network linking five aliases to six places (four hotels, rooms booked by former assistants and a laptop user profile), with 'Frank Black' connected to the most places and years.",
  status: 'done',
}
