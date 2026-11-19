// Day 9 text version: long description and table rows from the same selection as the picture.
import { midSentence } from '@/lib/viz/format'
import type { TableRow } from '@/viz/kits/days-08-14/ui'
import type { Day09Model } from './select'

export function describe(m: Day09Model): { paragraphs: string[]; rows: TableRow[] } {
  const count = (a: string) => m.links.filter((l) => l.alias === a).length
  const top = [...m.aliases].sort((a, b) => count(b.name) - count(a.name))[0]
  const hotels = m.places.filter((p) => p.kind === 'hotel')
  const paragraphs = [
    `A two-sided network. On the left are ${m.aliases.length} names Combs was said to have used (${m.aliases.map((a) => a.name).join(', ')}); on the right are ${m.places.length} places where records with those names turned up: ${hotels.length} hotels (${hotels.map((h) => h.name).join('; ')}), rooms booked by former assistants, and a laptop user profile. Each of the ${m.links.length} lines is one record or testimony linking a name to a place.`,
    top ? `${top.name} is linked to the most places (${count(top.name)}). Every other name appears at one hotel only.` : '',
    'Lines are solid when two or more outlets reported the link and dashed when one outlet did. Several hotel links rest on a single live blog.',
  ].filter(Boolean)
  const rows: TableRow[] = m.links.map((l) => ({ key: l.id, value: l.alias, what: `${l.place}: ${l.fact.text}${l.years.length ? ` (${l.years.join(', ')})` : ''}`, fact: l.fact }))
  for (const p of m.places) for (const n of p.notes) rows.push({ key: `${p.id}-${n.fact.key}`, value: String(n.fact.value ?? ''), what: `${p.name}, ${midSentence(n.label)}: ${n.fact.text}`, fact: n.fact })
  return { paragraphs, rows }
}
