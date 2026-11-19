// Day 13: Asked, Settled, Received: Money in the Record on One Scale
// Owned by Builder 2 (the witnesses around her). Replace the placeholder with the log-scale dot line described in README.md.
// Rules: render only from `day` / '@/lib/data'; no numbers typed by hand (npm run check:literals);
// interaction goes in a 'use client' child component in this folder.
import { PlaceholderTextVersion, PlaceholderViz } from '@/components/shell/Placeholder'
import type { DayVizProps } from '@/viz/types'
import { meta } from './meta'

export { meta }

export default function Day13Viz(props: DayVizProps) {
  return <PlaceholderViz {...props} meta={meta} />
}

export function TextVersion(props: DayVizProps) {
  return <PlaceholderTextVersion {...props} meta={meta} />
}
