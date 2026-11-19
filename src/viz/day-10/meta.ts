// Day 10 copy and settings. Owned by Builder 2 (the witnesses around her).
// Copy comes from DESIGN_29.md (Day 10). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 10,
  title: "December 2011, Told by Six Witnesses",
  question: "How do different witnesses' accounts of the same few weeks line up?",
  form: "Corroboration strip",
  contentLevel: 2,
  caption: "Agreement on dates is not proof of who did what. The judge told jurors to disregard testimony suggesting who set the fire (Days 9 and 11).",
  howToRead: 'The calendar runs across the top; each red mark is an event\'s date, joined to its column below. Each tile in a column is one witness or record that described that event (initials; dark = witness, white = police or fire, dashed = bank records); the dot on its corner says how sure that account is. Choose a name to see only their accounts, or select a column to read them.',
  altShort: "Calendar of December 2011 to January 2012 showing seven events and which of seven witnesses and records described each.",
  status: 'done',
}
