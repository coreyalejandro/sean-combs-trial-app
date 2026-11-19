// Day 12: workdays as former staff described them, one 24-hour clock each (a week dial where the
// figure was given per week), the longest stretch without sleep where one was described, and pay.
// Hours are each person's own account in testimony, not payroll records.
import { getDay, getWitnesses, type ReportedNumber, type TrialDay } from '@/lib/data'
import { utcDay, utcHour, utcWeek } from 'd3'
import additionsJson from './additions.json'
import {
  D, withDay, additionById, buildSourceBook, factFromAddition, factFromNumber, findNumber, leadingNumber, textFact,
  type AdditionsFile, type DayReader, type Fact, type SourceBook,
} from '../day-08/kit/facts'

const EPOCH = new Date(0)
/** Hours in a day and days in a week, from the calendar (not typed). */
export const HOURS_PER_DAY = utcHour.count(EPOCH, utcDay.offset(EPOCH, 1))
export const DAYS_PER_WEEK = utcDay.count(EPOCH, utcWeek.offset(EPOCH, 1))
/** "24/7", built from the calendar. */
export const ALL_HOURS = `${HOURS_PER_DAY}/${DAYS_PER_WEEK}`

export interface Span {
  /** Hours worked (low end of a range). */
  hours: number
  /** High end when a range was given ("80-100"). */
  hoursHigh: number | null
  per: 'day' | 'week'
  /** Clock start hour when the person gave times ("7 a.m. - 4 a.m."), else null. */
  startHour: number | null
  words: string
  fact: Fact
  calculated: string | null
}
export interface Person {
  id: string
  name: string
  pseudonym: boolean
  role: string
  day: number
  span: Span | null
  /** "24/7" style description of the job, when given. */
  always: Fact | null
  sleepDays: { days: number; fact: Fact } | null
  pay: Array<{ label: string; fact: Fact }>
}
export interface Day12Model { people: Person[]; standardDay: Fact | null; standardWeek: Fact | null; book: SourceBook; used: ReportedNumber[] }

/** "7 a.m. - 4 a.m." -> start 7, end 4 (24-hour clock). */
export function parseClockRange(v: string): { start: number; end: number } | null {
  const m = v.match(/(\d{1,2})\s*(a\.m\.|p\.m\.)\s*-\s*(\d{1,2})\s*(a\.m\.|p\.m\.)/i)
  if (!m) return null
  const half = HOURS_PER_DAY / 2
  const to24 = (h: number, ap: string) => (h % half) + (/p/i.test(ap) ? half : 0)
  return { start: to24(Number(m[1]), m[2]), end: to24(Number(m[2 + 1]), m[2 + 2]) }
}

export function select(day: TrialDay, read0: DayReader = getDay, additions: AdditionsFile = additionsJson as AdditionsFile): Day12Model {
  const read = withDay(day, read0)
  const used: ReportedNumber[] = []
  const num = (n: number, key: string, what: RegExp) => {
    const hit = findNumber(read, n, what)
    if (hit && n === day.day) used.push(hit.num)
    return factFromNumber(key, hit)
  }
  const roster = getWitnesses()
  const who = (id: string) => roster.find((w) => w.id === id)

  const range = (v: Fact['value']): [number, number | null] => {
    const s = String(v ?? '')
    const m = s.match(/(\d+)\s*-\s*(\d+)/)
    return m ? [Number(m[1]), Number(m[2])] : [leadingNumber(v) ?? 0, null]
  }

  const people: Person[] = []
  const add = (id: string, role: string, span: Span | null, extra: Partial<Person> = {}) => {
    const w = who(id)
    if (!w || (!span && !extra.sleepDays && !extra.always)) return
    people.push({ id, name: w.display_name, pseudonym: w.pseudonym, role, day: w.first_day, span, always: null, sleepDays: null, pay: [], ...extra })
  }

  // David James (Day 6): 20-hour workdays.
  const james = num(D('Day 6'), 'james-hours', /James's workdays/i)
  add('james', 'Personal assistant', james ? { hours: leadingNumber(james.value) ?? 0, hoursHigh: null, per: 'day', startHour: null, words: `${james.value}-hour workdays`, fact: james, calculated: null } : null)

  // George Kaplan (Day 8): 80 to 100 hours a week; pay about $125,000 a year.
  const kaplan = num(D('Day 8'), 'kaplan-hours', /Kaplan's reported work week/i)
  const kaplanPay = num(D('Day 8'), 'kaplan-pay', /Kaplan's approximate pay/i)
  if (kaplan) {
    const [lo, hi] = range(kaplan.value)
    add('kaplan', 'Executive and personal assistant', { hours: lo, hoursHigh: hi, per: 'week', startHour: null, words: `${lo} to ${hi ?? lo} hours a week`, fact: kaplan, calculated: null }, { pay: kaplanPay ? [{ label: 'Pay, about', fact: kaplanPay }] : [] })
  }

  // Capricorn Clark (Day 10): 7 a.m. to 4 a.m.; salary.
  const clark = num(D('Day 10'), 'clark-hours', /Clark's described workday/i)
  const clarkPay = num(D('Day 10'), 'clark-pay', /Clark's salary/i)
  const clock = clark ? parseClockRange(String(clark.value)) : null
  if (clark && clock) {
    const hours = (clock.end - clock.start + HOURS_PER_DAY) % HOURS_PER_DAY
    add('clark', 'Executive assistant', { hours, hoursHigh: null, per: 'day', startHour: clock.start, words: String(clark.value).replace(/\s+-\s+/, ' to '), fact: clark, calculated: `from ${clock.start}:00 to ${clock.end}:00 is ${hours} hours` }, { pay: clarkPay ? [{ label: 'Salary', fact: clarkPay }] : [] })
  }

  // Mia (Days 12 to 14): a 24/7 job; about 22-hour days (NPR); five days without sleep; pay.
  const miaDay = num(D('Day 14'), 'mia-hours', /Typical workday per Mia/i)
  const miaAlways = textFact(read, D('Day 12'), 'mia-always', 'key_points', /24\/7 job/i, /^(NBC News|Fox News)$/, 'high', `Mia described a ${ALL_HOURS} job: social media, scheduling, and staying near Combs at all hours.`)
  const miaSleep = num(D('Day 12'), 'mia-sleep', /Longest stretch without sleep she reported/i)
  const miaPromised = num(D('Day 12'), 'mia-pay-promised', /Pay promised to Mia/i)
  const miaPaid = num(D('Day 12'), 'mia-pay-paid', /Pay actually received/i)
  const miaOvertime = num(D('Day 14'), 'mia-overtime', /Unpaid overtime bill/i)
  add('mia', 'Personal assistant, later in film development', miaDay ? { hours: leadingNumber(miaDay.value) ?? 0, hoursHigh: null, per: 'day', startHour: null, words: `about ${miaDay.value} hours a day`, fact: miaDay, calculated: null } : null, {
    always: miaAlways,
    sleepDays: miaSleep ? { days: leadingNumber(miaSleep.value) ?? 0, fact: miaSleep } : null,
    pay: [
      miaPromised ? { label: 'Pay promised', fact: miaPromised } : null,
      miaPaid ? { label: 'Pay received', fact: miaPaid } : null,
      miaOvertime ? { label: 'Overtime bill she said Combs tore up', fact: miaOvertime } : null,
    ].filter((p): p is { label: string; fact: Fact } => !!p),
  })

  // Brendan Paul (Day 26): three days without sleep; no hours figure in coverage.
  const paulSleep = num(D('Day 26'), 'paul-sleep', /Longest stretch Paul said he went without sleep/i)
  add('paul', 'Personal assistant', null, { sleepDays: paulSleep ? { days: leadingNumber(paulSleep.value) ?? 0, fact: paulSleep } : null })

  const standardDay = factFromAddition(additionById(additions, 'standard-day'))
  const standardWeek = factFromAddition(additionById(additions, 'standard-week'))
  people.sort((a, b) => a.day - b.day)

  const facts = [...people.flatMap((p) => [p.span?.fact, p.always, p.sleepDays?.fact, ...p.pay.map((x) => x.fact)]), standardDay, standardWeek]
  return { people, standardDay, standardWeek, book: buildSourceBook(day, facts), used }
}
