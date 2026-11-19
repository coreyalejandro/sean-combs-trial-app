// Day 11 copy and settings. Owned by Builder 2 (the witnesses around her).
// Copy comes from DESIGN_29.md (Day 11). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 11,
  title: "The Car Fire Investigation: Where the Trail Stopped",
  question: "What did police do after the December 2011 entry into Kid Cudi's home, and investigators after the January 2012 car fire, and where did the trail stop?",
  form: "Chain-of-evidence diagram with broken links",
  contentLevel: 1,
  caption: "No one was charged for the fire. Jurors were told to disregard testimony suggesting who set it.",
  howToRead: 'Read the steps in order. A whole link means testimony says the step happened; a broken link and a dashed card mean testimony says it did not. The grey court notes under a step say what the judge did with that testimony. Select a step for what each witness said and where it was reported.',
  altShort: "Seven-step investigation chain that stops after the fire scene: the glove was not collected or tested, two witnesses were not reached, and no one was charged.",
  status: 'done',
}
