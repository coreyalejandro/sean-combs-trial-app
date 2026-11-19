// Day 18: every duration the two women gave in testimony, as hours, read from the days they testified.
// The picture charts lengths of time only; it never describes what happened during them (care rule 2).
import { resolveSources, type ReportedNumber, type Source, type TrialDay } from '@/lib/data'
import { formatValue, toNumber } from '@/lib/viz/format'
import { dayRef } from '@/viz/kits/days-15-21/days'
import { lowest, type Level } from '@/viz/kits/days-15-21/sources'
import { datesInText, DAYS_PER_WEEK, formatMonth, HOURS_PER_DAY } from '@/viz/kits/days-15-21/time'

export type Who = 'ventura' | 'jane' | 'recovery'

export interface Span {
  id: string
  who: Who
  label: string
  /** Hours, low and high (equal for a single figure). */
  lo: number
  hi: number
  /** The figure exactly as reported ("36-48 hours"). */
  reported: string
  level: Level
  sources: Source[]
  fromDay: number
}

export interface Group { who: Who; name: string; years: string | null; yearsSources: Source[] }

export interface Day18Selection {
  spans: Span[]
  groups: Group[]
  /** Hours both women's ranges cover (calculated), or null if they do not overlap. */
  overlap: { lo: number; hi: number } | null
  used: ReportedNumber[]
  other: ReportedNumber[]
  omitted: number
  pool: Source[]
  extraSources: Source[]
}

const UNIT_HOURS: Record<string, number> = { hours: 1, days: HOURS_PER_DAY, weeks: HOURS_PER_DAY * DAYS_PER_WEEK }

/** "36-48" hours -> [36, 48]; 4 days -> [96, 96]; "3-3.5" days -> [72, 84]. */
export function toHours(value: number | string, unit: string): [number, number] | null {
  const per = UNIT_HOURS[unit.split(/\s/)[0].toLowerCase()]
  if (!per) return null
  const parts = String(value).split(/\s*-\s*|\s+to\s+/).map((p) => toNumber(p))
  if (parts.length === 0 || parts.some((p) => p === null)) return null
  const nums = parts as number[]
  return [Math.min(...nums) * per, Math.max(...nums) * per]
}

/** Intimate or bodily detail, left out of this page and its table (care rule 2). */
const INTIMATE = /UTI|yeast|piercing|men present|other men/i

export function select(day: TrialDay): Day18Selection {
  const spans: Span[] = []
  const used: ReportedNumber[] = []
  const d2 = dayRef('Day 2')
  const d17 = dayRef('Day 17')
  const d19 = dayRef('Day 19')

  const add = (src: TrialDay, num: ReportedNumber | undefined, who: Who, id: string, label: string) => {
    if (!num) return
    const h = toHours(num.value, num.unit)
    if (!h) return
    if (src.day === day.day) used.push(num)
    spans.push({ id, who, label, lo: h[0], hi: h[1], reported: formatValue(num.value, num.unit), level: num.confidence, sources: resolveSources(num, src.sources), fromDay: src.day })
  }

  // Ventura (Day 2)
  const typical = d2.numbers.find((n) => /typical .*duration/i.test(n.what))
  add(d2, typical, 'ventura', 'v-typical', 'Typical length')
  const nbcAdds = typical?.what.match(/NBC adds (?<h>\d+) hours/)?.groups?.h
  if (typical && nbcAdds) {
    const h = Number(nbcAdds)
    const nbc = resolveSources({ source: 'NBC', outlets: ['NBC'] }, d2.sources)
    spans.push({ id: 'v-nbc', who: 'ventura', label: 'A longer length one outlet reported', lo: h, hi: h, reported: `${h} hours`, level: 'low', sources: nbc.length ? nbc : resolveSources(typical, d2.sources), fromDay: d2.day })
  }
  add(d2, d2.numbers.find((n) => /^longest/i.test(n.what)), 'ventura', 'v-longest', 'Longest')

  // Jane (Days 17, 18, 19)
  add(d17, d17.numbers.find((n) => /hotel nights/i.test(n.what) && n.unit === 'hours'), 'jane', 'j-typical', 'Usual length')
  add(day, day.numbers.find((n) => /^shortest/i.test(n.what)), 'jane', 'j-shortest', 'Shortest')
  add(day, day.numbers.find((n) => /^longest/i.test(n.what)), 'jane', 'j-longest', 'Longest')
  const oct = d19.numbers.find((n) => /\b(Oct|October)\b/.test(n.what) && n.unit === 'hours')
  const octDate = oct ? datesInText(oct.what)[0] : undefined
  add(d19, oct, 'jane', 'j-oct', octDate ? `One night in ${formatMonth(octDate.date)}` : 'One night')

  // Recovery (Day 18)
  add(day, day.numbers.find((n) => /recovery/i.test(n.what)), 'recovery', 'recovery', 'Recovery time Jane described')

  // Years each account covers
  const first = d2.numbers.find((n) => /first .*\(~?\d{4}\)/i.test(n.what))?.what.match(/\(~?(?<y>\d{4})\)/)?.groups?.y
  const lastNum = d2.numbers.find((n) => /^last /i.test(n.what))
  const last = lastNum ? String(lastNum.value).match(/\d{4}(?!.*\d{4})/)?.[0] : undefined
  const travel = d17.numbers.find((n) => /window of travel/i.test(n.what))
  const travelYears = travel ? String(travel.value).match(/\d{4}/g) : null
  const groups: Group[] = [
    {
      who: 'ventura', name: 'Cassie Ventura',
      years: first && last ? `about ${first} to ${last}` : null,
      yearsSources: lastNum ? resolveSources(lastNum, d2.sources) : [],
    },
    {
      who: 'jane', name: 'Jane',
      years: travelYears && travelYears.length > 1 ? `${travelYears[0]} to ${travelYears[travelYears.length - 1]}` : null,
      yearsSources: travel ? resolveSources(travel, d17.sources) : [],
    },
    { who: 'recovery', name: 'Afterwards', years: null, yearsSources: [] },
  ]

  const range = (who: Who) => {
    const s = spans.filter((x) => x.who === who)
    return s.length ? { lo: Math.min(...s.map((x) => x.lo)), hi: Math.max(...s.map((x) => x.hi)) } : null
  }
  const v = range('ventura')
  const j = range('jane')
  const overlap = v && j && Math.max(v.lo, j.lo) < Math.min(v.hi, j.hi) ? { lo: Math.max(v.lo, j.lo), hi: Math.min(v.hi, j.hi) } : null

  const omittedList = day.numbers.filter((n) => INTIMATE.test(n.what))
  const pool = day.sources
  const ids = new Set(pool.map((s) => s.id))
  return {
    spans,
    groups,
    overlap,
    used,
    other: day.numbers.filter((n) => !used.includes(n) && !omittedList.includes(n)),
    omitted: omittedList.length,
    pool,
    extraSources: [...spans.flatMap((s) => s.sources), ...groups.flatMap((g) => g.yearsSources)].filter((s) => !ids.has(s.id)),
  }
}

export const levelOf = (spans: Span[]): Level => spans.reduce<Level>((a, s) => lowest(a, s.level), 'high')
