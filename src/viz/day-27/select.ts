// Day 27: trips in the records behind the two transportation counts. Trip endpoints and dates come from
// this folder's additions.json (each with the day it was reported and its sources); the map's reference
// points (city coordinates) come from additions.json too. Counts and relationship periods come from the data.
import { getCharges, getDay, getWitnesses, sourceById, type Confidence, type Source, type TrialDay } from '@/lib/data'
import additions from './additions.json'
import type { AdditionItem } from '@/viz/kits/days-22-28/kit'

export interface Place {
  id: string
  name: string
  lat: number
  lon: number
}

export interface Trip {
  id: string
  text: string
  date: string
  /** First year in the date text, used to place the trip in a relationship period. */
  year: number | null
  from: string | null
  to: string[]
  /** A stay after arrival (e.g. a hotel in New York after landing in Newark). */
  stay: string[]
  day: number
  confidence: Confidence
  sources: Source[]
  /** The transportation count whose relationship period the trip's date falls in, if any. */
  count: number | null
  person: string | null
  addition: AdditionItem
}

export interface Period {
  count: number
  person: string
  short: string
  from: number
  to: number
}

export interface Day27Selection {
  places: Place[]
  trips: Trip[]
  periods: Period[]
  placeSources: AdditionItem[]
}

const items = (additions as { items: AdditionItem[] }).items

function yearsIn(text: string): number[] {
  return [...text.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0]))
}

export function selectDay27(today: TrialDay): Day27Selection {
  const places: Place[] = items
    .filter((i) => i.kind === 'place')
    .map((i) => {
      const [lat, lon] = String(i.value).split(',').map(Number)
      return { id: i.id.replace(/^place-/, ''), name: i.text.split(' (')[0], lat, lon }
    })

  // Relationship periods: Ventura's from her witness-table role, Jane's from the record of her first day.
  const charges = getCharges().filter((c) => /transportation/i.test(c.short) && c.person)
  const periods: Period[] = []
  for (const c of charges) {
    let span: number[] = []
    if (c.person === 'Ventura') {
      span = yearsIn(getWitnesses().find((w) => w.id === 'ventura')?.role ?? '')
    } else if (c.person === 'Jane') {
      const jane = getWitnesses().find((w) => w.id === 'jane')
      const d = jane ? (jane.first_day === today.day ? today : getDay(jane.first_day)) : null
      const num = d?.numbers.find((n) => /duration of jane's relationship/i.test(n.what))
      span = num ? yearsIn(String(num.value)) : []
    }
    if (span.length >= 2) periods.push({ count: c.count, person: c.person as string, short: c.short, from: Math.min(...span), to: Math.max(...span) })
  }

  const trips: Trip[] = items
    .filter((i) => i.kind === 'event' && i.id.startsWith('trip-'))
    .map((i) => {
      const [route, ...rest] = String(i.value).split(';')
      const [from, to] = route.split('>')
      const stay = rest.filter((r) => r.startsWith('stay:')).map((r) => r.slice('stay:'.length))
      const year = yearsIn(i.date ?? '')[0] ?? null
      const period = year === null ? undefined : periods.find((p) => year >= p.from && year <= p.to)
      const day = i.from_days[0]
      const pool = day === today.day ? today.sources : getDay(day).sources
      const sources = (i.source_ids ?? []).map((id) => pool.find((s) => s.id === id) ?? sourceById(id)).filter((s): s is Source => Boolean(s))
      return {
        id: i.id,
        text: i.text,
        date: i.date ?? '',
        year,
        from: from ? from : null,
        to: to ? to.split('|').filter(Boolean) : [],
        stay,
        day,
        confidence: i.confidence,
        sources,
        count: period?.count ?? null,
        person: period?.person ?? null,
        addition: i,
      }
    })
    .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))

  return { places, trips, periods, placeSources: items.filter((i) => i.kind === 'place') }
}
