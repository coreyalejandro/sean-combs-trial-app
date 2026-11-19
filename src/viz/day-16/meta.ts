// Day 16 copy and settings. Owned by Builder 3 (the money and the second account).
// Copy comes from DESIGN_29.md (Day 16). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 16,
  title: "The Life of One Video, from Hotel Camera to Jury Room",
  question: "Where did the 2016 hotel hallway video go between March 2016 and the jury's deliberations?",
  form: "Chain-of-custody subway line",
  contentLevel: 2,
  caption: "This page never shows the video. It shows where the video went.",
  howToRead: 'Read the line from top to bottom: each dot is a stop in the video\'s journey, filled when two or more outlets reported it, hollow or dashed when one did. Select a stop, or use Previous and Next, for who had the video, what was said and the source. Dashed stretches are long waits.',
  altShort: "Eight-stop line tracing the 2016 hotel video from the hallway camera through a $100,000 purchase, a 2024 news release and forensic checks to the jury's deliberations.",
  status: 'done',
}
