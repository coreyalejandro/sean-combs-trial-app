// Time helpers shared by Builder 3's days (15 to 21). No number is typed here: unit sizes come from
// d3's calendar intervals, and every date comes from the data or an additions.json file.
import { utcDay, utcHour, utcMonth, utcWeek, utcYear } from 'd3'

const EPOCH = new Date(0)

/** Hours in one day, from the calendar (not typed). */
export const HOURS_PER_DAY = utcHour.count(EPOCH, utcDay.offset(EPOCH, 1))
/** Days in one week, from the calendar. */
export const DAYS_PER_WEEK = utcDay.count(EPOCH, utcWeek.offset(EPOCH, 1))
/** Months in one year, from the calendar. */
export const MONTHS_PER_YEAR = utcMonth.count(EPOCH, utcYear.offset(EPOCH, 1))

export type Precision = 'day' | 'month' | 'year'

export interface Dated {
  date: Date
  precision: Precision
}

/** "2016-03-05", "2023-11" or "2021" to a UTC date. */
export function isoToDate(iso: string): Dated | null {
  const g = iso.match(/^(?<y>\d{4})(?:-(?<m>\d{2}))?(?:-(?<d>\d{2}))?/)?.groups
  if (!g) return null
  const y = Number(g.y)
  const mo = g.m ? Number(g.m) - 1 : 0
  const d = g.d ? Number(g.d) : 1
  return { date: new Date(Date.UTC(y, mo, d)), precision: g.d ? 'day' : g.m ? 'month' : 'year' }
}

export function toIso(date: Date): string {
  return date.toISOString().slice(0, utcIsoDayLength)
}
const utcIsoDayLength = 'yyyy-mm-dd'.length

const monthNames: string[] = utcMonth
  .range(EPOCH, utcYear.offset(EPOCH, 1))
  .map((d) => d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }).toLowerCase())

/** Month index from "Nov", "Nov.", "November", "Sept". */
function monthIndex(word: string): number {
  const w = word.toLowerCase().replace(/\./g, '')
  const stem = w.slice(0, 2 + 1)
  return monthNames.findIndex((name) => name.startsWith(stem))
}

const MONTH_WORD = '\\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\b\\.?'

const DAY_YEAR = /\s*(?<day>\d{1,2}(?!\d))?(?:,?\s*(?<year>\d{4}))?/

/**
 * Find a date written in data text: "Nov 30, 2023", "Jan 5 and Jan 8, 2024", "March 2024", "late Dec 2023".
 * Returns every date found, in order. A day-less mention is a month-precision date.
 */
export function datesInText(text: string, fallbackYear?: number): Dated[] {
  const out: Dated[] = []
  const re = new RegExp(MONTH_WORD + DAY_YEAR.source, 'g')
  for (const m of text.matchAll(re)) {
    const mi = monthIndex(m[1])
    if (mi < 0) continue
    const year = m.groups?.year ? Number(m.groups.year) : fallbackYear
    if (year === undefined) continue
    const day = m.groups?.day ? Number(m.groups.day) : 1
    out.push({ date: new Date(Date.UTC(year, mi, day)), precision: m.groups?.day ? 'day' : 'month' })
  }
  return out
}

export function formatDay(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function formatMonth(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export function formatDated(d: Dated): string {
  if (d.precision === 'day') return formatDay(d.date)
  if (d.precision === 'month') return formatMonth(d.date)
  return String(d.date.getUTCFullYear())
}

export function shortDay(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}
