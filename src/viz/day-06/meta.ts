// Day 6 copy and settings. Owned by Builder 1 (the first week: one woman's account).
// Copy comes from DESIGN_29.md (Day 6). Every number in these strings must appear in the data
// (npm run check:literals enforces it). Survivor readers and Corey review this copy before publishing.
import type { VizMeta } from '@/viz/types'

export const meta: VizMeta = {
  day: 6,
  title: "Where Other People Say They Saw Violence",
  question: "Besides Ventura, who says they saw Combs hurt her, and where and when?",
  form: "Dot map with year slider",
  contentLevel: 2,
  caption: "Each dot is one person's sworn account of one occasion. Dots sit on the city, not the address.",
  howToRead: "Each shape is one witness's account of one occasion, placed on the city; each witness has their own shape, filled solid when two or more outlets reported it and open when one did. The Los Angeles places are a few miles apart, so they appear in their own inset. Move the slider to add the years; select an account for its source.",
  altShort: "Map of accounts by witnesses who said they saw violence toward Ventura, in Los Angeles, New York, Las Vegas, Beverly Hills and Jamaica, from 2009 to 2016.",
  status: 'done',
}
