// Day 13 text version: long description and table rows from the same selection as the picture.
import { formatUSDShort } from '@/lib/viz/format'
import type { TableRow } from '../day-08/kit/ui'
import { KINDS, type Day13Model } from './select'

export function describe(m: Day13Model): { paragraphs: string[]; rows: TableRow[] } {
  const all = [...m.mia, ...m.context]
  const values = all.map((a) => a.value)
  const [asked, settled, share] = m.mia
  const paragraphs = [
    `A dot line on a logarithmic scale, where each gridline is ten times the one before. It holds ${all.length} amounts named at trial, from ${formatUSDShort(Math.min(...values))} to ${formatUSDShort(Math.max(...values))}.`,
    asked && settled && share
      ? `Mia's mediation is drawn as a step down: ${formatUSDShort(asked.value)} asked, about ${formatUSDShort(settled.value)} settled, and about ${formatUSDShort(share.value)} to her${share.alt ? ` (one outlet says ${formatUSDShort(share.alt.value)}; outlets disagree)` : ''}.`
      : '',
    `The other amounts are grouped by kind: ${KINDS.map((k) => `${k.label.toLowerCase()} (${m.context.filter((a) => a.kind === k.id).map((a) => `${a.who}, ${formatUSDShort(a.value)}`).join('; ')})`).join('; ')}. A switch redraws the line on an ordinary scale, where everything under a million dollars crowds near zero. A settlement is not an admission by either side.`,
  ].filter(Boolean)
  const rows: TableRow[] = all.map((a) => ({
    key: a.id,
    value: formatUSDShort(a.value),
    what: `${a.who}: ${a.label} (${m.mia.includes(a) ? "Mia's mediation" : KINDS.find((k) => k.id === a.kind)?.plain}). ${a.fact.text}`,
    fact: a.fact,
    note: a.alt ? `${formatUSDShort(a.value)} vs ${formatUSDShort(a.alt.value)} (${a.alt.note})` : undefined,
  }))
  return { paragraphs, rows }
}
