// Day 16 long description and table rows, from the same stations as the picture.
import type { TableRow } from '@/viz/kits/days-15-21/VizTable'
import { levelWords } from '@/viz/kits/days-15-21/sources'
import type { Day16Selection } from './select'

export function describe(sel: Day16Selection, gaps: Array<string | null>): { paragraphs: string[]; rows: TableRow[] } {
  const n = sel.stations.length
  const p: string[] = [
    `The picture is a line drawn like a subway map, with ${n} stops in time order, tracing where the hotel hallway video went. It never shows the video. Each stop names who had the video or acted on it, what was said, and who reported it. The line turns red up to the stop you select, and its long dashed stretches stand for long waits.`,
  ]
  sel.stations.forEach((st, i) => {
    const gap = gaps[i] ? ` (${gaps[i]}, calculated)` : ''
    p.push(`Stop ${i + 1}${gap}: ${st.whenText}. ${st.title}. Who had it: ${st.holder}. ${st.words.join(' ')} (${levelWords(st.level)}.)`)
  })
  const rows: TableRow[] = sel.stations.map((st, i) => ({
    key: st.id,
    what: `Stop ${i + 1}: ${st.title}`,
    value: st.holder,
    when: st.whenText,
    level: st.level,
    sources: st.sources,
  }))
  return { paragraphs: p, rows }
}
