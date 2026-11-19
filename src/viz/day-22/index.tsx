// Day 22: Six Days on the Stand: Jane's Testimony, Hour by Hour
// Owned by Builder 4 (the record and the system). Replace the placeholder with the testimony gantt described in README.md.
// Rules: render only from `day` / '@/lib/data'; no numbers typed by hand (npm run check:literals);
// interaction goes in a 'use client' child component in this folder.
import { PlaceholderTextVersion, PlaceholderViz } from '@/components/shell/Placeholder'
import type { DayVizProps } from '@/viz/types'
import { meta } from './meta'

export { meta }

export default function Day22Viz(props: DayVizProps) {
  return <PlaceholderViz {...props} meta={meta} />
}

export function TextVersion(props: DayVizProps) {
  return <PlaceholderTextVersion {...props} meta={meta} />
}
