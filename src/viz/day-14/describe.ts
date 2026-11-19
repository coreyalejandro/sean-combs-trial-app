// Day 14 text version: long description and table rows from the same selection as the picture.
import type { TableRow } from '@/viz/kits/days-08-14/ui'
import { valueText } from '@/viz/kits/days-08-14/geom'
import { whenLabel, type Day14Model } from './select'

export function describe(m: Day14Model): { paragraphs: string[]; rows: TableRow[] } {
  const dated = m.publicItems.filter((p) => p.date)
  const paragraphs = [
    `A mirrored timeline from ${m.years[0]} to ${m.years[1]}. Above the line are ${m.publicItems.length} posts, gifts, texts and a video the defense showed (${dated.length} with dates; ${m.publicItems.length - dated.length} without a date in coverage). Below the line is Mia's own account of the same years: ${m.account.map((a) => `${a.text.split(';')[0].toLowerCase()} (${a.end ? `${a.date} to ${a.end}` : whenLabel(a.date)})`).join('; ')}.`,
    `How she explained the public record: ${m.explanations.map((e) => e.text.replace(/\.$/, '')).join('; ')}. The defense said the posts showed real affection.`,
    m.repetitions ? `Along the bottom, ${m.repetitions.count} ticks stand for the times the defense asked her a version of the same question about her posts (${m.repetitions.fact.value}, by NPR's count; one outlet).` : '',
  ].filter(Boolean)
  const rows: TableRow[] = [
    ...m.publicItems.map((p) => ({ key: p.id, value: whenLabel(p.date, p.end), what: `Above the line: ${p.text}`, fact: p.fact })),
    ...m.account.map((a) => ({ key: a.id, value: a.end ? `${a.date} to ${a.end}` : whenLabel(a.date), what: `Her account: ${a.text}`, fact: a.fact, note: a.conflict })),
    ...m.explanations.map((e) => ({ key: e.fact.key, value: 'Her explanation', what: e.text, fact: e.fact })),
    ...(m.repetitions ? [{ key: 'repetitions', value: String(m.repetitions.fact.value), what: m.repetitions.fact.text, fact: m.repetitions.fact }] : []),
    ...(m.meetings ? [{ key: 'meetings', value: valueText(m.meetings.value, m.meetings.unit), what: m.meetings.text, fact: m.meetings }] : []),
    ...(m.laterJob ? [{ key: 'later-job', value: 'After she left', what: m.laterJob.fact.text, fact: m.laterJob.fact, note: m.laterJob.conflict ?? undefined }] : []),
    ...m.court.map((f) => ({ key: f.key, value: 'In court', what: f.text, fact: f })),
  ]
  return { paragraphs, rows }
}
