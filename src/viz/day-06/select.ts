// Day 6: where witnesses other than Ventura said they saw violence toward her, and when.
// Accounts and city coordinates are in this folder's additions.json (each with sources); an account is drawn only
// while its witness's own day record still mentions them.
import { getDay, getDays, getWitnesses, type TrialDay } from '@/lib/data'
import { additionRefs, buildIndex, findNumber, numberRefs, toRef, uniqueRefs, yearIn, yearsIn, type AdditionItem, type AdditionsFile, type Level, type Ref, type RefIndex } from '../day-01/kit/refs'
import additions from './additions.json'

export interface Place {
  id: string
  name: string
  lat: number
  lon: number
  /** "Los Angeles area" places share one marker on the national map. */
  area: 'la' | 'jamaica' | 'national'
  level: Level
  refs: Ref[]
}

export interface Account {
  id: string
  witnessId: string
  witness: string
  year: number | null
  placeId: string | null
  text: string
  onFlight: boolean
  level: Level
  refs: Ref[]
  fromDays: number[]
}

export interface Day06Selection {
  accounts: Account[]
  places: Place[]
  yearFrom: number
  yearTo: number
  witnesses: string[]
  numbers: Array<{ label: string; value: string; level: Level; refs: Ref[] }>
  index: RefIndex
}

const LA_AREA = /los-angeles|west-hollywood|beverly-hills/

function placeName(text: string): string {
  return text.split(' (')[0]
}

export function select(day: TrialDay, file: AdditionsFile = additions as AdditionsFile): Day06Selection {
  const items: AdditionItem[] = file.items
  const witnesses = getWitnesses()
  const places: Place[] = items
    .filter((i) => i.kind === 'place' && typeof i.value === 'string')
    .map((i) => {
      const [lat, lon] = String(i.value).split(',').map(Number)
      return { id: i.id, name: placeName(i.text), lat, lon, area: LA_AREA.test(i.id) ? 'la' : 'national', level: i.confidence, refs: additionRefs(i) } as Place
    })
  // Jamaica is drawn from the world atlas outline (its centre), not from a coordinate typed here.
  places.push({ id: 'place-jamaica', name: 'Jamaica', lat: NaN, lon: NaN, area: 'jamaica', level: 'medium', refs: [] })

  const accounts: Account[] = items
    .filter((i) => i.kind === 'event' && i.id.startsWith('acct-'))
    .flatMap((i) => {
      const witnessId = i.id.split('-')[1]
      const w = witnesses.find((x) => x.id === witnessId)
      if (!w) return []
      const surname = w.display_name.split(' ').slice(-1)[0]
      // the witness's own day records must still mention them
      const recs = i.from_days.map((d) => (d === day.day ? day : getDay(d)))
      const named = recs.some((r) => [...r.key_points, ...r.exhibits, r.summary].some((t) => t.includes(surname)))
      if (!named) return []
      const disputed = /unresolved|did not name/i.test(i.text)
      return [{
        id: i.id,
        witnessId,
        witness: w.display_name,
        year: i.date ? yearIn(i.date) : null,
        placeId: typeof i.value === 'string' ? i.value : null,
        text: i.text,
        onFlight: /on a .*flight/i.test(i.text),
        level: disputed ? 'conflict' : i.confidence,
        refs: additionRefs(i),
        fromDays: i.from_days,
      } as Account]
    })

  const datedYears = accounts.map((a) => a.year).filter((y): y is number => y !== null)
  const span = getDays()
    .flatMap((d) => d.numbers.filter((n) => /^relationship/i.test(n.what) && yearsIn(n.what).length >= 2))
    .map((n) => yearsIn(n.what))[0]
  const yearFrom = Math.min(...(span ?? []), ...datedYears)
  const yearTo = Math.max(...(span ?? []), ...datedYears)

  const numbers: Day06Selection['numbers'] = []
  const hid = findNumber(day, /hid face-down/i)
  if (hid) numbers.push({ label: 'minutes: how long Kerry Morgan said she and Ventura hid on a neighbor’s steps', value: String(hid.value), level: hid.confidence, refs: numberRefs(day, hid) })
  const friends = findNumber(day, /friendship/i)
  if (friends) numbers.push({ label: 'years: how long Morgan and Ventura were friends', value: String(friends.value), level: friends.confidence, refs: numberRefs(day, friends) })

  const used = new Set(accounts.map((a) => a.placeId))
  const shownPlaces = places.filter((p) => used.has(p.id))
  const all = uniqueRefs([
    ...accounts.flatMap((a) => a.refs),
    ...shownPlaces.flatMap((p) => p.refs),
    ...numbers.flatMap((n) => n.refs),
    ...day.numbers.flatMap((n) => numberRefs(day, n)),
    ...day.sources.map((s) => toRef(s)),
  ])
  return {
    accounts,
    places: shownPlaces,
    yearFrom,
    yearTo,
    witnesses: [...new Set(accounts.map((a) => a.witness))],
    numbers,
    index: buildIndex(day.sources, all),
  }
}
