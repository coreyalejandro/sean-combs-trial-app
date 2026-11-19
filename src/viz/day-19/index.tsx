// Day 19: After the Lawsuit: November 2023 to September 2024, Person by Person
// Owned by Builder 3 (the money and the second account). Replace the placeholder with the swimlane timeline described in README.md.
// Rules: render only from `day` / '@/lib/data'; no numbers typed by hand (npm run check:literals);
// interaction goes in a 'use client' child component in this folder.
import { PlaceholderTextVersion, PlaceholderViz } from '@/components/shell/Placeholder'
import type { DayVizProps } from '@/viz/types'
import { meta } from './meta'

export { meta }

export default function Day19Viz(props: DayVizProps) {
  return <PlaceholderViz {...props} meta={meta} />
}

export function TextVersion(props: DayVizProps) {
  return <PlaceholderTextVersion {...props} meta={meta} />
}
