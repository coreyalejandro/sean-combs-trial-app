// Day 18: a duration in hours, written in hours or days (shared by the picture and the text version).
import { formatInt } from '@/lib/viz/format'
import { HOURS_PER_DAY } from '@/viz/kits/days-15-21/time'

export type SpanUnit = 'hours' | 'days'
const dec = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

export function spanText(sp: { lo: number; hi: number }, unit: SpanUnit): string {
  const f = (h: number) => (unit === 'hours' ? formatInt(h) : dec.format(h / HOURS_PER_DAY))
  const word = unit === 'hours' ? 'hours' : 'days'
  return sp.lo === sp.hi ? `${f(sp.lo)} ${word}` : `${f(sp.lo)} to ${f(sp.hi)} ${word}`
}
