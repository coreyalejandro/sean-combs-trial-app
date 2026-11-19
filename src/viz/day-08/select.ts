// Day 8: the dumbbell rows (earliest event described -> first legal step or first contact with
// investigators) and Dr. Hughes's four general concepts. Every year is read from the record or
// from this folder's sourced additions.json; gaps are calculated here.
import { getDay, getWitnesses, type ReportedNumber, type TrialDay } from '@/lib/data'
import additionsJson from './additions.json'
import {
  D, withDay, additionById, buildSourceBook, factFromAddition, findNumber, factFromNumber, firstYear, mergeFacts,
  type AdditionsFile, type DayReader, type Fact, type SourceBook,
} from './kit/facts'

export type Mode = 'legal' | 'official'

export const MODES: Array<{ id: Mode; label: string; long: string }> = [
  { id: 'legal', label: 'First step toward a court or police', long: 'the first police report, mediation or lawsuit' },
  { id: 'official', label: 'First contact with police, agents or prosecutors', long: 'the first meeting or contact with police, federal agents or prosecutors' },
]

export interface Point { year: number | null; label: string; fact: Fact | null }
export interface Row {
  id: string
  who: string
  pseudonym: boolean
  start: Point
  ends: Record<Mode, Point>
}

export interface Concept { id: string; label: string; plain: string }
export interface Day08Model {
  rows: Row[]
  concepts: Concept[]
  conceptSource: string | null
  fees: Fact[]
  feeNote: string | null
  book: SourceBook
  used: ReportedNumber[]
  years: [number, number]
}

const CONCEPTS: Array<Concept & { match: RegExp }> = [
  { id: 'delay', label: 'Delayed telling', plain: 'Many people wait a long time before telling anyone.', match: /delay disclosure/i },
  { id: 'memory', label: 'Fragmented memory', plain: 'Memories of trauma can come back in pieces.', match: /fragmented/i },
  { id: 'bond', label: 'Trauma bonds', plain: 'Strong attachment can form to a person who causes harm.', match: /trauma bonds/i },
  { id: 'control', label: 'Financial and psychological control', plain: 'Control of money and of how a person thinks can keep them in place.', match: /financial and psychological control/i },
]

const name = (id: string) => getWitnesses().find((w) => w.id === id)

export function select(day: TrialDay, read0: DayReader = getDay, additions: AdditionsFile = additionsJson as AdditionsFile): Day08Model {
  const read = withDay(day, read0)
  const used: ReportedNumber[] = []
  const num = (n: number, key: string, what: RegExp) => {
    const hit = findNumber(read, n, what)
    if (hit && n === day.day) used.push(hit.num)
    return factFromNumber(key, hit)
  }
  const add = (id: string) => factFromAddition(additionById(additions, id))
  const point = (fact: Fact | null, label: string, pick: (f: Fact) => number | null = (f) => firstYear(f.value)): Point => ({ year: fact ? pick(fact) : null, label, fact })

  // Ventura: 2007 -> November 2023 lawsuit (no first meeting with prosecutors in coverage).
  const venturaSuit = mergeFacts('ventura-suit', 'Ventura filed a civil lawsuit; it settled within a day', [
    num(D('Day 19'), 'ventura-suit-late', /Ventura lawsuit filed/i),
    num(D('Day 3'), 'ventura-suit-early', /Lawsuit filed/i),
  ])
  // Mia: employment from 2009 -> 2017 mediation, and her first meetings with prosecutors (January 2024 per Fox; NPR says June 2024).
  const miaStart = num(D('Day 12'), 'mia-start', /Mia's employment/i)
  const miaMediation = num(D('Day 13'), 'mia-mediation', /^Mediation/i)
  const miaProsecutors = num(D('Day 14'), 'mia-prosecutors', /first meetings with prosecutors/i)
  const disclosureConflict = read(D('Day 14')).discrepancies.find((d) => /Disclosure timing/i.test(d)) ?? null
  const miaOfficial = miaProsecutors && disclosureConflict ? { ...miaProsecutors, confidence: 'conflict' as const, text: `${miaProsecutors.text}. Outlets disagree: ${disclosureConflict}` } : miaProsecutors
  // Kid Cudi: December 2011, reported to police the same month.
  const cudiStart = num(D('Day 9'), 'cudi-start', /Break-in at Cudi/i)
  const cudiReport = add('cudi-police-report')
  // Jane: 2021 -> an agent's card after the March 2024 raids.
  const janeStart = num(D('Day 17'), 'jane-start', /Duration of Jane's relationship/i)
  const janeContact = add('jane-agent-contact')
  // Bongolan: 2016 -> a civil suit whose filing year coverage does not give.
  const bongolanSuit = num(D('Day 16'), 'bongolan-suit', /Amount Bongolan sued/i)

  const rows: Row[] = [
    {
      id: 'ventura', who: name('ventura')?.display_name ?? 'Cassie Ventura', pseudonym: false,
      start: point(add('ventura-first-event'), 'Physical abuse began, she testified'),
      ends: { legal: point(venturaSuit, 'Filed a civil lawsuit'), official: { year: null, label: 'First meeting with prosecutors', fact: null } },
    },
    {
      id: 'mia', who: name('mia')?.display_name ?? 'Mia', pseudonym: true,
      start: point(miaStart, 'Began working for Combs'),
      ends: {
        legal: point(miaMediation, 'Mediation over her claims'),
        official: point(miaOfficial, 'First meetings with prosecutors'),
      },
    },
    {
      id: 'mescudi', who: name('mescudi')?.display_name ?? 'Kid Cudi', pseudonym: false,
      start: point(cudiStart, 'Entry into his home'),
      ends: { legal: point(cudiReport, 'Reported it to police'), official: point(cudiReport, 'Reported it to police') },
    },
    {
      id: 'jane', who: name('jane')?.display_name ?? 'Jane', pseudonym: true,
      start: point(janeStart, 'Relationship with Combs began'),
      ends: { legal: point(janeContact, 'Agent left a card after the raids'), official: point(janeContact, 'Agent left a card after the raids') },
    },
    {
      id: 'bongolan', who: name('bongolan')?.display_name ?? 'Bryana Bongolan', pseudonym: false,
      start: point(add('bongolan-first-event'), 'The incident she described'),
      ends: {
        legal: { year: null, label: 'Filed a civil suit (year not in coverage)', fact: bongolanSuit },
        official: { year: null, label: 'First meeting with prosecutors', fact: null },
      },
    },
  ]

  // Hughes's concepts: shown only if the day's record says she described them.
  const hughes = day.key_points.find((k) => /Hughes/.test(k)) ?? ''
  const concepts = CONCEPTS.filter((c) => c.match.test(hughes)).map(({ id, label, plain }) => ({ id, label, plain }))

  const fees = [num(day.day, 'hughes-rate', /Hughes's rate/i), num(day.day, 'hughes-fee', /Hughes's fee/i)].filter((f): f is Fact => !!f)
  const feeNote = day.discrepancies.find((d) => /RESOLVED - Hughes fee/i.test(d))?.replace(/^RESOLVED - /, '') ?? null

  const allYears = rows.flatMap((r) => [r.start.year, r.ends.legal.year, r.ends.official.year]).filter((y): y is number => y !== null)
  const years: [number, number] = allYears.length ? [Math.min(...allYears), Math.max(...allYears)] : [0, 1]

  const facts = rows.flatMap((r) => [r.start.fact, r.ends.legal.fact, r.ends.official.fact]).concat(fees)
  const book = buildSourceBook(day, facts)

  return { rows, concepts, conceptSource: hughes ? 'Day 8 record' : null, fees, feeNote, book, used, years }
}

/** Years between the first event and the chosen end point (null when a date is missing). */
export function gap(row: Row, mode: Mode): number | null {
  const a = row.start.year
  const b = row.ends[mode].year
  return a === null || b === null ? null : b - a
}
