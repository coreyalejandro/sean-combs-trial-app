// Day 9: aliases on one side, the places their records turned up on the other. Links come from this
// folder's sourced additions.json (where the record only says it in prose) and from the data itself.
import { formatDate, getDay, type ReportedNumber, type TrialDay } from '@/lib/data'
import { formatUSD } from '@/lib/viz/format'
import additionsJson from './additions.json'
import {
  D, withDay, buildSourceBook, datesIn, factFromAddition, factFromNumber, findNumber, textFact, yearsIn,
  type AdditionsFile, type DayReader, type Fact, type SourceBook,
} from '../day-08/kit/facts'

export interface Link { id: string; alias: string; place: string; fact: Fact; years: number[] }
export interface PlaceNote { fact: Fact; label: string }
export interface Place { id: string; name: string; kind: 'hotel' | 'booking' | 'device'; years: number[]; notes: PlaceNote[] }
export interface Alias { id: string; name: string }

export interface Day09Model {
  aliases: Alias[]
  places: Place[]
  links: Link[]
  book: SourceBook
  used: ReportedNumber[]
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')

export function select(day: TrialDay, read0: DayReader = getDay, additions: AdditionsFile = additionsJson as AdditionsFile): Day09Model {
  const read = withDay(day, read0)
  const used: ReportedNumber[] = []
  const num = (n: number, key: string, what: RegExp) => {
    const hit = findNumber(read, n, what)
    if (hit && n === day.day) used.push(hit.num)
    return factFromNumber(key, hit)
  }

  const links: Link[] = []
  for (const item of additions.items) {
    const fact = factFromAddition(item)
    if (!fact || typeof item.alias !== 'string' || typeof item.place !== 'string') continue
    links.push({ id: item.id, alias: item.alias, place: item.place, fact, years: yearsIn(item.date ?? '') })
  }

  // Trump International, New York: the bill the defense showed (Day 17), alias stated in the exhibit.
  const trumpStay = num(D('Day 17'), 'trump-stay', /Trump International Hotel/i)
  const trumpExhibit = read(D('Day 17')).exhibits.find((e) => /Trump International/i.test(e) && /Frank Black/.test(e))
  if (trumpStay && trumpExhibit) {
    const [from, to] = datesIn(String(trumpStay.value))
    const when = from && to ? `${formatDate(from, { year: false })} to ${formatDate(to)}` : String(trumpStay.value)
    links.push({ id: 'trump-frank-black', alias: 'Frank Black', place: 'Trump International Hotel & Tower, New York', fact: { ...trumpStay, text: `A hotel bill the defense showed placed Combs, under the alias Frank Black, at the hotel from ${when}` }, years: yearsIn(trumpStay.value).slice(0, 1) })
  }
  // The laptop user profile (Day 16): reported by NBC and Yahoo News.
  const laptop = textFact(read, D('Day 16'), 'laptop-frank-black', 'exhibits', /user profile labelled 'Frank Black'/i, /^(NBC News|Yahoo News)$/, 'high', 'A user profile named Frank Black on a laptop Ventura gave the government (Day 16; its contents are under seal and not described here)')
  if (laptop) links.push({ id: 'laptop-frank-black', alias: 'Frank Black', place: 'A laptop user profile', fact: laptop, years: [] })

  // Year of the Park Hyatt record comes from the arrest date in the Day 5 record.
  const arrest = num(D('Day 5'), 'arrest-date', /arrest date/i)

  // Records about each place that are not alias links (bills, stays, charges).
  const placeNotes: Record<string, PlaceNote[]> = {}
  const note = (place: string, label: string, fact: Fact | null) => {
    if (fact) (placeNotes[place] ??= []).push({ label, fact })
  }
  const wax = num(D('Day 9'), 'lermitage-charge', /candle-wax/i)
  const waxDate = num(D('Day 9'), 'lermitage-date', /L'Ermitage housekeeping complaint/i)
  note("L'Ermitage Beverly Hills", 'A stay with a housekeeping complaint', waxDate)
  note("L'Ermitage Beverly Hills", 'Charge for the complaint', wax && typeof wax.value === 'number' ? { ...wax, text: `${formatUSD(wax.value)}: ${wax.text}` } : wax)
  const bhhBill = num(D('Day 14'), 'bhh-bill', /Beverly Hills Hotel bill/i)
  note('Beverly Hills Hotel', 'Hotel bill', bhhBill && typeof bhhBill.value === 'number' ? { ...bhhBill, text: `Over ${formatUSD(bhhBill.value)}: ${bhhBill.text}` } : bhhBill)
  const trump2022 = num(D('Day 24'), 'trump-2022', /Trump International Hotel bill/i)
  note('Trump International Hotel & Tower, New York', 'A later bill (no alias stated in coverage)', trump2022 && typeof trump2022.value === 'number' ? { ...trump2022, text: `${formatUSD(trump2022.value)}: ${trump2022.text}` } : trump2022)
  note('Park Hyatt, New York', 'Arrest date', arrest)
  const bhhStay = read(D('Day 14')).exhibits.find((e) => /Beverly Hills Hotel bill/i.test(e))
  const ermitageRecords = read(D('Day 9')).exhibits.find((e) => /L'Ermitage reservation records/i.test(e))

  // Aliases in order of how many places they link to (most first), then by name.
  const aliasNames = [...new Set(links.map((l) => l.alias))]
  const count = (a: string) => links.filter((l) => l.alias === a).length
  aliasNames.sort((a, b) => count(b) - count(a) || a.localeCompare(b))
  const aliases = aliasNames.map((name) => ({ id: slug(name), name }))

  const placeNames = [...new Set(links.map((l) => l.place))]
  const kindOf = (p: string): Place['kind'] => (/laptop/i.test(p) ? 'device' : /booked/i.test(p) ? 'booking' : 'hotel')
  const places: Place[] = placeNames
    .map((name) => {
      const ls = links.filter((l) => l.place === name)
      const years = new Set(ls.flatMap((l) => l.years))
      for (const n of placeNotes[name] ?? []) yearsIn(n.fact.value).forEach((y) => years.add(y))
      if (/Ermitage/.test(name) && ermitageRecords) yearsIn(ermitageRecords).forEach((y) => years.add(y))
      if (/Beverly Hills Hotel/.test(name) && bhhStay) yearsIn(bhhStay).forEach((y) => years.add(y))
      return { id: slug(name), name, kind: kindOf(name), years: [...years].sort((a, b) => a - b), notes: placeNotes[name] ?? [] }
    })
    .sort((a, b) => (a.kind === b.kind ? (a.years[0] ?? Infinity) - (b.years[0] ?? Infinity) : a.kind === 'hotel' ? -1 : b.kind === 'hotel' ? 1 : a.kind === 'booking' ? -1 : 1))

  const facts = [...links.map((l) => l.fact), ...Object.values(placeNotes).flat().map((n) => n.fact)]
  return { aliases, places, links, book: buildSourceBook(day, facts), used }
}
