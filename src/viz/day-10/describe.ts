// Day 10 text version: long description and table rows from the same selection as the picture.
import type { TableRow } from '../day-08/kit/ui'
import { eventLabel, type Day10Model } from './select'

export function describe(m: Day10Model): { paragraphs: string[]; rows: TableRow[] } {
  const name = (id: string) => m.witnesses.find((w) => w.id === id)?.name ?? id
  const most = [...m.events].sort((a, b) => b.accounts.length - a.accounts.length)[0]
  const paragraphs = [
    `A corroboration strip. A calendar runs from ${eventLabel(m.events[0])} to ${eventLabel(m.events[m.events.length - 1])}; ${m.events.length} events sit below it in date order, and under each is one tile for every witness or record that described it. ${m.witnesses.length} witnesses and records appear: ${m.witnesses.map((w) => `${w.name} (Day ${w.day})`).join(', ')}.`,
    most ? `The most-described event is "${most.title}" (${most.accounts.length} accounts). Several dates rest on one outlet; each tile's corner dot shows how sure that account is.` : '',
    'Agreement on dates is not proof of who did what. The judge told jurors to disregard testimony suggesting who set the fire.',
  ].filter(Boolean)
  const rows: TableRow[] = []
  for (const e of m.events) {
    for (const a of e.accounts) rows.push({ key: `${e.id}-${a.witness}`, value: eventLabel(e), what: `${e.title}. ${name(a.witness)} (Day ${a.day}): ${a.said}`, fact: a.fact })
  }
  return { paragraphs, rows }
}
