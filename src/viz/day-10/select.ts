// Day 10: December 2011 to January 2012, event by event, with who described each one.
// Dates come from the record (numbers and the dates written in them); each account is a paraphrase
// tied to the record that backs it (its sources and confidence).
import { getDay, getWitnesses, type ReportedNumber, type TrialDay } from '@/lib/data'
import { monthYear, shortDate } from '@/viz/kits/days-08-14/geom'
import {
  D, withDay, buildSourceBook, datesIn, isoToDate, factFromNumber, findNumber, textFact, weakest,
  type DayReader, type Fact, type SourceBook,
} from '@/viz/kits/days-08-14/facts'

export interface Witness { id: string; name: string; short: string; kind: 'person' | 'official' | 'records'; day: number }
export interface Account { witness: string; day: number; said: string; fact: Fact }
export interface Event {
  id: string
  title: string
  /** ISO date, or "YYYY-MM" when only the month is known. */
  date: string
  precision: 'day' | 'month'
  dateNote: string
  dateFact: Fact | null
  accounts: Account[]
}
export interface Day10Model { events: Event[]; witnesses: Witness[]; clark: Fact[]; book: SourceBook; used: ReportedNumber[]; window: [string, string] }

const initials = (name: string) => name.replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase()

/** The date written next to a phrase in a text with several dated parts ("Dec 14, 2011 outgoing transfer ...; Dec 23, 2011 ..."). */
function dateNear(text: string, phrase: RegExp): string | null {
  const part = text.split(';').find((p) => phrase.test(p))
  return part ? datesIn(part)[0] ?? null : null
}

export function select(day: TrialDay, read0: DayReader = getDay): Day10Model {
  const read = withDay(day, read0)
  const used: ReportedNumber[] = []
  const num = (n: number, key: string, what: RegExp, level?: Fact['confidence']) => {
    const hit = findNumber(read, n, what)
    if (hit && n === day.day) used.push(hit.num)
    return factFromNumber(key, hit, level && hit ? weakest(level, hit.num.confidence) : undefined)
  }
  const d3 = D('Day 3'), d7 = D('Day 7'), d9 = D('Day 9'), d10 = D('Day 10'), d11 = D('Day 11'), d15 = D('Day 15')

  // Records behind the accounts.
  const venturaDec = num(d3, 'ventura-dec', /Kid Cudi relationship/i)
  const venturaFire = textFact(read, d3, 'ventura-fire', 'key_points', /car later blown up/i, /^CNN/, 'medium')
  const cudiLearned = textFact(read, d9, 'cudi-learned', 'key_points', /Combs learned of their relationship/i, /^(CBS|AP|Fox News)/, 'high')
  const cudiEntry = num(d9, 'cudi-entry', /Break-in at Cudi's home/i)
  const cudiFire = num(d9, 'cudi-fire', /Porsche set on fire/i)
  const clarkDate = num(d10, 'clark-date', /alleged Cudi-home incident/i)
  const clarkTime = num(d10, 'clark-time', /arrived at Clark's door/i)
  const ignacio = textFact(read, d11, 'ignacio', 'key_points', /not reported as a burglary/i, /^NBC/, 'low')
  const fireFound = num(d11, 'fire-found', /Engine company found the Porsche/i, 'low')
  const jimenez = textFact(read, d11, 'jimenez', 'key_points', /fire was targeted/i, /^(NBC|Fox News)/, 'high')
  const reginaEmail = textFact(read, d7, 'regina-email', 'exhibits', /Dec 23, 2011 email/i, /^Global/, 'medium')
  const reginaMoney = num(d7, 'regina-money', /demanded from Regina Ventura/i)
  const wires = num(d15, 'wires', /outgoing transfer to Cassie Ventura/i)
  const wireText = wires ? String(wires.text) : ''
  const wireLow = (key: string, text: string): Fact | null => (wires ? { ...wires, key, text, confidence: weakest('low', wires.confidence) } : null)

  const people = getWitnesses()
  const W = (id: string, kind: Witness['kind']): Witness | null => {
    const w = people.find((x) => x.id === id)
    return w ? { id, name: w.display_name, short: initials(w.display_name), kind, day: w.first_day } : null
  }
  const witnesses = [W('ventura', 'person'), W('regina-ventura', 'person'), W('mescudi', 'person'), W('clark', 'person'), W('ignacio', 'official'), W('jimenez', 'official'), W('ferguson', 'records')].filter((w): w is Witness => !!w)

  const acc = (witness: string, n: number, said: string, fact: Fact | null): Account | null => (fact ? { witness, day: n, said, fact } : null)
  const ok = (xs: Array<Account | null>) => xs.filter((x): x is Account => !!x)

  const month = (v: unknown) => String(v ?? '').match(/\d{4}-\d{2}/)?.[0] ?? ''
  const events = ([
    {
      id: 'learns', title: 'Combs learns Ventura is seeing Kid Cudi', date: month(venturaDec?.value), precision: 'month',
      dateNote: 'Month as reported; the day is not stated', dateFact: venturaDec,
      accounts: ok([
        acc('ventura', d3, 'Ventura testified Combs found out she was dating Kid Cudi and threatened her; she ended that relationship.', venturaDec),
        acc('mescudi', d9, 'Kid Cudi testified Ventura called him frightened after Combs learned of the relationship.', cudiLearned),
      ]),
    },
    {
      id: 'transfer', title: 'A transfer to Ventura from a Combs account', date: dateNear(wireText, /outgoing transfer/i) ?? '', precision: 'day',
      dateNote: 'Date as written in the bank records (one outlet)', dateFact: wireLow('transfer-date', wireText),
      accounts: ok([acc('ferguson', d15, 'Bank records the former finance chief walked jurors through show an outgoing transfer to Ventura.', wireLow('transfer', wireText))]),
    },
    {
      id: 'door', title: 'Clark says Combs came to her door before dawn', date: datesIn(String(clarkDate?.value ?? ''))[0] ?? '', precision: 'day',
      dateNote: 'Date reported by two outlets; the time of day by one', dateFact: clarkDate,
      accounts: ok([acc('clark', d10, `Clark testified Combs came to her door at about ${clarkTime ? String(clarkTime.value).replace(/^~/, '') : 'dawn'} a.m., angry about Ventura and Kid Cudi, and made her go with him.`, clarkTime && clarkDate ? { ...clarkDate, refs: [...clarkDate.refs, ...clarkTime.refs.filter((r) => !clarkDate.refs.some((x) => x.url === r.url))], confidence: weakest(clarkDate.confidence, clarkTime.confidence) } : clarkDate)]),
    },
    {
      id: 'entry', title: "Combs enters Kid Cudi's home", date: datesIn(String(clarkDate?.value ?? ''))[0] ?? '', precision: 'day',
      dateNote: "Day from Clark's account; Kid Cudi gave only the month", dateFact: clarkDate,
      accounts: ok([
        acc('mescudi', d9, 'Kid Cudi testified Combs entered his home while he was out, and that he reported it to police.', cudiEntry),
        acc('clark', d10, "Clark testified she was taken with Combs to Kid Cudi's home.", clarkDate),
        acc('ignacio', d11, 'The officer who responded testified the incident was not reported as a burglary.', ignacio),
      ]),
    },
    {
      id: 'wire', title: "Ventura's email; her family's wire", date: dateNear(wireText, /wire from her father/i) ?? '', precision: 'day',
      dateNote: 'Date of the email exhibit and the wire record', dateFact: reginaEmail,
      accounts: ok([
        acc('regina-ventura', d7, `Ventura's mother testified Combs demanded money after her daughter's email about a threat; the family borrowed against their home and wired it.`, reginaMoney ? { ...reginaMoney, refs: [...reginaMoney.refs, ...(reginaEmail?.refs ?? [])].filter((r, i, a) => a.findIndex((x) => x.url === r.url) === i) } : reginaEmail),
        acc('ferguson', d15, 'Bank records show a wire in from her father the same day.', wireLow('wire-in', wireText)),
      ]),
    },
    {
      id: 'return', title: 'The money goes back', date: dateNear(wireText, /return of funds/i) ?? '', precision: 'day',
      dateNote: "Date as written in the bank records (one outlet)", dateFact: wireLow('return-date', wireText),
      accounts: ok([
        acc('ferguson', d15, "Bank records show money going out labelled 'return of funds'.", wireLow('return', wireText)),
        acc('regina-ventura', d7, 'Ventura\'s mother testified the money was later returned.', reginaMoney),
      ]),
    },
    {
      id: 'fire', title: "Kid Cudi's car is set on fire", date: String(fireFound?.value ?? month(cudiFire?.value)), precision: fireFound ? 'day' : 'month',
      dateNote: 'About a month later (two outlets); the exact day is when an engine company found the car (one outlet)', dateFact: fireFound,
      accounts: ok([
        acc('mescudi', d9, 'Kid Cudi testified his car was set on fire at his home about a month later.', cudiFire),
        acc('jimenez', d11, 'The arson investigator testified the fire was set on purpose; the case went inactive with no charges.', jimenez),
        acc('ventura', d3, "Ventura testified Kid Cudi's car was later destroyed.", venturaFire),
      ]),
    },
  ] as Event[]).filter((e) => e.date && e.accounts.length > 0)

  // Clark was the only witness on Day 10: her own figures (from this day's record).
  const clark = [
    num(d10, 'clark-polygraph', /lie-detector tests/i),
    num(d10, 'clark-hours', /Total lie-detector time/i),
    num(d10, 'clark-salary', /Clark's salary/i),
    num(d10, 'clark-workday', /Clark's described workday/i),
  ].filter((f): f is Fact => !!f)

  const dates = events.map((e) => e.date).sort()
  const facts = [...events.flatMap((e) => [e.dateFact, ...e.accounts.map((a) => a.fact)]), ...clark]
  return { events, witnesses: witnesses.filter((w) => events.some((e) => e.accounts.some((a) => a.witness === w.id))), clark, book: buildSourceBook(day, facts), used, window: [dates[0], dates[dates.length - 1]] }
}


/** "Dec 22", or "December 2011 (day not stated)" for a month-only date. */
export function eventLabel(e: Event): string {
  return e.precision === 'month' ? `${monthYear(isoToDate(e.date))} (day not stated)` : shortDate(isoToDate(e.date))
}
