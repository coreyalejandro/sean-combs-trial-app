// Day 6 copy and settings. Owned by Builder 1 (the first week: one woman's account).
// Copy comes from DESIGN_29.md (Day 6). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 6,
  title: "Where Other People Say They Saw Violence",
  question: "Besides Ventura, who says they saw violence toward her, or what it left, and where and when?",
  form: "Dot map with year slider",
  contentLevel: 2,
  caption: "Each dot is one person's sworn account of one occasion. Dots sit on the city, not the address.",
  howToRead: "Each shape is one witness's account of one occasion, placed on the city; each witness has their own shape, filled solid when two or more outlets reported it and open when one did. The list gives every account by year; the map shows the Los Angeles area, where most of them sit. Move the slider to add the years; select an account for its source.",
  altShort: "A list, by year, of accounts by witnesses who said they saw violence toward Ventura or her injuries afterward, in Los Angeles, New York, Las Vegas, Beverly Hills and Jamaica, from 2009 to 2016, with a map of the Los Angeles area.",
  status: 'done',
}
