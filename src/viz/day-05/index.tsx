// Day 5: What Agents Found in the Hotel Room on the Day of the Arrest
// Owned by Builder 1 (the first week: one woman's account). Replace the placeholder with the isotype pictograph described in README.md.
// Rules: render only from `day` / '@/lib/data'; no numbers typed by hand (npm run check:literals);
// interaction goes in a 'use client' child component in this folder.
import { PlaceholderTextVersion, PlaceholderViz } from '@/components/shell/Placeholder'
import type { DayVizProps } from '@/viz/types'
import { meta } from './meta'

export { meta }

export default function Day05Viz(props: DayVizProps) {
  return <PlaceholderViz {...props} meta={meta} />
}

export function TextVersion(props: DayVizProps) {
  return <PlaceholderTextVersion {...props} meta={meta} />
}
