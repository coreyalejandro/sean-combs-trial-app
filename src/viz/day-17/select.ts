// Day 17: the records, the witness's account and the judge's ruling about one disputed date.
import { geoDistance, utcDay } from 'd3'
import { redactThirdParties, resolveSources, type ReportedNumber, type Source, type TrialDay } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import { dayRef } from '@/viz/kits/days-15-21/days'
import { additionSources, citedIn, findAddition, lowest, type AdditionsFile, type Level } from '@/viz/kits/days-15-21/sources'
import { isoToDate, toIso } from '@/viz/kits/days-15-21/time'
import { clause } from '../day-16/select'
import additionsFile from './additions.json'

const additions = additionsFile as AdditionsFile

export type LaneId = 'ny' | 'la' | 'none'
export type Layer = 'records' | 'witness' | 'judge'

export interface DateMark {
  id: string
  lane: LaneId
  layer: Layer
  /** ISO dates, inclusive. A point has start === end. */
  start: string
  end: string
  label: string
  words: string[]
  level: Level
  sources: Source[]
  side: 'record' | 'defense' | 'witness'
}

export interface City { id: 'ny' | 'la'; name: string; lonLat: [number, number]; level: Level; sources: Source[] }

export interface Day17Selection {
  marks: DateMark[]
  cities: City[]
  /** Great-circle distance between the two cities (calculated), in miles. */
  miles: number | null
  distanceSources: Source[]
  /** What the witness said about the date, and the ruling on Day 20. */
  witness: { words: string[]; level: Level; sources: Source[] } | null
  ruling: { date: string; words: string[]; level: Level; sources: Source[]; day: number } | null
  /** Said "as words only" (DESIGN_29): never drawn. */
  wordsOnly: string[]
  used: ReportedNumber[]
  other: ReportedNumber[]
  pool: Source[]
  extraSources: Source[]
}

const lonLatOf = (value: string | number | undefined): [number, number] | null => {
  const [lat, lon] = String(value ?? '').split(',').map(Number)
  return Number.isFinite(lat) && Number.isFinite(lon) ? [lon, lat] : null
}

const textLevel = (d: TrialDay): Level => lowest(d.confidence.level, 'medium')

export function select(day: TrialDay): Day17Selection {
  const pool = day.sources
  const used: ReportedNumber[] = []
  const marks: DateMark[] = []
  const extra: Source[] = []
  const d16 = dayRef('Day 16')
  const d20 = dayRef('Day 20')

  const stay = day.numbers.find((n) => /stay at .*Hotel|hotel .*stay/i.test(n.what) && /\d{4}-\d{2}-\d{2}/.test(String(n.value)))
  if (stay) {
    const [a, b] = String(stay.value).match(/\d{4}-\d{2}-\d{2}/g) ?? []
    if (a && b) {
      used.push(stay)
      marks.push({
        id: 'stay', lane: 'ny', layer: 'records', start: a, end: b, label: 'Hotel bill: stay in New York',
        words: [redactThirdParties(stay.what)], level: stay.confidence, sources: resolveSources(stay, pool), side: 'record',
      })
    }
  }
  const photos = day.numbers.find((n) => n.unit === 'date' && /photo/i.test(n.what))
  if (photos) {
    used.push(photos)
    marks.push({
      id: 'photos', lane: 'la', layer: 'records', start: String(photos.value), end: String(photos.value), label: "Date on the witness's injury photos",
      words: ["The photos of Bongolan's injuries were dated this day. The picture does not show them."], level: photos.confidence,
      sources: resolveSources(photos, pool), side: 'record',
    })
  }
  const defenseKey = day.key_points.find((k) => /defense said .*New York that morning|event in New York/i.test(k))
  if (defenseKey && photos) {
    const words = clause(defenseKey, /defense said/i)
    marks.push({
      id: 'defense', lane: 'ny', layer: 'records', start: String(photos.value), end: String(photos.value), label: "Defense's account: an event in New York that morning",
      words: words ? [words] : [], level: textLevel(day), sources: pool, side: 'defense',
    })
  }
  const text = day.numbers.find((n) => n.unit === 'date' && /text/i.test(n.what))
  if (text) {
    used.push(text)
    const recovered = day.key_points.find((k) => /recovered phone data/i.test(k))
    marks.push({
      id: 'text', lane: 'none', layer: 'records', start: String(text.value), end: String(text.value), label: "Ventura's text about the incident",
      words: [redactThirdParties(text.what), ...(recovered ? [clause(recovered, /implies|believed/i) ?? ''] : [])].filter(Boolean),
      level: text.confidence, sources: resolveSources(text, pool), side: 'record',
    })
  }

  // What the witness said, and what she was held to (words only, never drawn)
  const misremember = day.key_points.find((k) => /misremembered/i.test(k))
  const witness = misremember
    ? { words: [clause(misremember, /misremembered/i), clause(misremember, /no doubt/i)].filter((x): x is string => !!x), level: textLevel(day), sources: pool }
    : null
  if (witness && photos) {
    marks.push({
      id: 'witness', lane: 'la', layer: 'witness', start: String(photos.value), end: String(photos.value),
      label: 'Bongolan: the incident happened; she misremembered the date', words: witness.words, level: witness.level, sources: witness.sources, side: 'witness',
    })
  }
  const hold = day.numbers.find((n) => /balcony hold/i.test(n.what))
  const floor = d16.numbers.find((n) => /balcony height/i.test(n.what))
  const wordsOnly: string[] = []
  if (hold) {
    used.push(hold)
    wordsOnly.push(`She testified she was held over a balcony railing for ${formatValue(hold.value, hold.unit)}${floor ? `, on the ${formatValue(floor.value, '')}th floor (Day ${d16.day})` : ''}.`)
  }

  // The judge (Day 20)
  const rulingText = d20.legal_events.find((t) => /second mistrial/i.test(t) && /denied/i.test(t))
  const ruling = rulingText
    ? (() => {
        const c = citedIn(rulingText, d20.sources, textLevel(d20))
        return {
          date: d20.date,
          words: rulingText.split(/(?<=[.)])\s+(?=[A-Z])/).filter((t) => !/blog gives the denial time|^\(/.test(t)).map((t) => redactThirdParties(t.replace(/\s*\([^)]*\)\.?$/, ''))),
          level: c.level,
          sources: c.sources.length > 0 ? c.sources : d20.sources.slice(0, 1),
          day: d20.day,
        }
      })()
    : null
  if (ruling) extra.push(...ruling.sources)

  // The two cities and the distance between them (calculated from additions.json)
  const cities: City[] = []
  for (const [id, key, name] of [['la', 'place-los-angeles', 'Los Angeles'], ['ny', 'place-new-york', 'New York']] as const) {
    const item = findAddition(additions, key)
    const ll = lonLatOf(item?.value)
    if (item && ll) {
      const src = additionSources(item, pool)
      extra.push(...src)
      cities.push({ id, name, lonLat: ll, level: item.confidence, sources: src })
    }
  }
  const radius = findAddition(additions, 'earth-radius')
  const mile = findAddition(additions, 'mile')
  let miles: number | null = null
  const distanceSources: Source[] = []
  if (cities.length === 2 && radius && mile && typeof radius.value === 'number' && typeof mile.value === 'number') {
    miles = (geoDistance(cities[0].lonLat, cities[1].lonLat) * radius.value) / mile.value
    distanceSources.push(...additionSources(radius), ...additionSources(mile))
    extra.push(...distanceSources)
  }

  const ids = new Set(pool.map((s) => s.id))
  return {
    marks,
    cities,
    miles,
    distanceSources,
    witness,
    ruling,
    wordsOnly,
    used,
    other: day.numbers.filter((n) => !used.includes(n)),
    pool,
    extraSources: extra.filter((s) => !ids.has(s.id)),
  }
}

/** Every date from the first mark to the last, inclusive (the strip's columns). */
export function stripDays(marks: DateMark[]): string[] {
  const all = marks.flatMap((m) => [m.start, m.end]).sort()
  const first = all.length ? isoToDate(all[0]) : null
  const last = all.length ? isoToDate(all[all.length - 1]) : null
  if (!first || !last) return []
  return utcDay.range(first.date, utcDay.offset(last.date, 1)).map(toIso)
}
