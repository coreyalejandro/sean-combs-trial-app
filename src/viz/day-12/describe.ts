// Day 12 text version: long description and table rows from the same selection as the picture.
import type { TableRow } from '@/viz/kits/days-08-14/ui'
import { valueText } from '@/viz/kits/days-08-14/geom'
import { ALL_HOURS, HOURS_PER_DAY, type Day12Model } from './select'

export function describe(m: Day12Model): { paragraphs: string[]; rows: TableRow[] } {
  const daily = m.people.filter((p) => p.span?.per === 'day')
  const hours = daily.map((p) => p.span?.hours ?? 0)
  const paragraphs = [
    `${m.people.length} small multiples, one per former staff member: ${m.people.map((p) => `${p.name}${p.pseudonym ? ' (pseudonym)' : ''}`).join(', ')}. Each dial is a ${HOURS_PER_DAY}-hour clock with the hours the person testified to working filled in red${m.standardDay ? `, and a thin grey arc of a traditional ${m.standardDay.value}-hour day for comparison` : ''}. A figure given per week is drawn on a week dial${m.standardWeek ? ` against a ${m.standardWeek.value}-hour week` : ''}.`,
    hours.length ? `Daily accounts run from ${Math.min(...hours)} to ${Math.max(...hours)} hours. ${m.people.filter((p) => p.always).map((p) => p.name).join(' and ')} also described the job as ${ALL_HOURS}.` : '',
    `Under each dial, one block per day marks the longest stretch without sleep, where one was described: ${m.people.filter((p) => p.sleepDays).map((p) => `${p.name}, ${p.sleepDays?.days} days`).join('; ')}. Hours are each person's own account in testimony, not payroll records.`,
  ].filter(Boolean)
  const rows: TableRow[] = []
  for (const p of m.people) {
    const who = `${p.name}${p.pseudonym ? ' (pseudonym)' : ''}`
    if (p.span) rows.push({ key: `${p.id}-hours`, value: p.span.words, what: `${who}: ${p.span.fact.text}`, fact: p.span.fact })
    if (p.span?.calculated) rows.push({ key: `${p.id}-calc`, value: `${p.span.hours} hours`, what: `${who}: length of the workday`, fact: null, calc: p.span.calculated })
    if (p.always) rows.push({ key: `${p.id}-always`, value: ALL_HOURS, what: `${who}: ${p.always.text}`, fact: p.always })
    if (p.sleepDays) rows.push({ key: `${p.id}-sleep`, value: valueText(p.sleepDays.fact.value, p.sleepDays.fact.unit), what: `${who}: ${p.sleepDays.fact.text}`, fact: p.sleepDays.fact })
    for (const x of p.pay) rows.push({ key: `${p.id}-${x.fact.key}`, value: valueText(x.fact.value, x.fact.unit), what: `${who}: ${x.label.toLowerCase()} (${x.fact.text})`, fact: x.fact })
  }
  for (const f of [m.standardDay, m.standardWeek]) if (f) rows.push({ key: f.key, value: valueText(f.value, f.unit), what: f.text, fact: f })
  return { paragraphs, rows }
}
