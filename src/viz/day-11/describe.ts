// Day 11 text version: long description and table rows from the same selection as the picture.
import { midSentence } from '@/lib/viz/format'
import type { TableRow } from '@/viz/kits/days-08-14/ui'
import type { Day11Model } from './select'

export function describe(m: Day11Model): { paragraphs: string[]; rows: TableRow[] } {
  const done = m.steps.filter((s) => s.status === 'done')
  const missing = m.steps.filter((s) => s.status === 'not-done')
  const paragraphs = [
    `A chain of ${m.steps.length} investigation steps, in order: ${m.steps.map((s) => midSentence(s.title)).join(', ')}. Testimony says the first ${done.length} happened (${done.map((s) => s.title.toLowerCase()).join(', ')}); after the fire scene the chain is broken: ${missing.map((s) => s.summary.toLowerCase().replace(/\.$/, '')).join('; ')}.`,
    m.court.length ? `A court lane underneath records what the judge did with this testimony: ${m.court.map((c) => c.text.replace(/\.$/, '')).join('; ')}.` : '',
  ].filter(Boolean)
  const rows: TableRow[] = []
  m.steps.forEach((s, i) => s.evidence.forEach((e) => rows.push({ key: `${s.id}-${e.fact.key}`, value: `Step ${i + 1}: ${s.status === 'done' ? 'happened' : 'did not happen'}`, what: `${s.title}. ${e.who}: ${e.said}`, fact: e.fact })))
  m.court.forEach((c) => rows.push({ key: `court-${c.fact.key}`, value: 'In court', what: c.text, fact: c.fact }))
  return { paragraphs, rows }
}
