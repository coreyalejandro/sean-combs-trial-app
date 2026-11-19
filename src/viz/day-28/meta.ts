// Day 28 copy and settings. Owned by Builder 4 (the record and the system).
// Copy comes from DESIGN_29.md (Day 28). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 28,
  title: "34 Witnesses for the Prosecution, None for the Defense",
  question: "Who testified over the 28 days, and what did the defense present?",
  form: "Witness constellation",
  contentLevel: 1,
  caption: "A defendant never has to testify or call witnesses. The burden of proof is on the prosecution.",
  howToRead: 'Each star is one prosecution witness, placed left to right by the day they first testified and in a band for their role; bigger stars spent more days on the stand. Faint lines join witnesses whose reported testimony mentions the same event. The right-hand sky is the defense. Select a star for its card, or show one role.',
  altShort: "Constellation of 34 prosecution witnesses in the order they testified over 28 days, beside an empty space for the defense, which called none.",
  status: 'done',
}
