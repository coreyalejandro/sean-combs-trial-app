// Clock-time parsing for times written in the day records ("2:27 PM", "8:32 a.m.", "9 AM").
// All times land on one reference day (the Unix epoch, UTC) so they can share an axis.
// No hour or minute constants are typed: they come from d3's time intervals.
import { utcDay, utcHour, utcMinute } from 'd3'

export const EPOCH = utcDay.floor(new Date(0))
/** Hours in half a day (derived, not typed). */
export const HALF_DAY_HOURS = utcHour.count(EPOCH, utcDay.offset(EPOCH, 1)) / 2
/** Minutes in an hour (derived, not typed). */
export const MINUTES_PER_HOUR = utcMinute.count(EPOCH, utcHour.offset(EPOCH, 1))

export type Meridiem = 'am' | 'pm' | null

export interface ClockToken {
  hour: number
  minute: number
  meridiem: Meridiem
  /** The text as written ("2:27 PM"). */
  raw: string
  index: number
}

const TIME_RE = /\b(?<h>\d{1,2})(?::(?<m>\d{2}))?\s*(?<mer>a\.m\.|p\.m\.|am|pm)?(?=[\s,;.)\-]|$)/gi

function meridiemOf(s: string | undefined): Meridiem {
  if (!s) return null
  return s.toLowerCase().startsWith('a') ? 'am' : 'pm'
}

/** Every clock time in a text. Bare numbers count only when they carry a colon or an a.m./p.m. mark. */
export function clockTokens(text: string): ClockToken[] {
  const out: ClockToken[] = []
  for (const m of text.matchAll(TIME_RE)) {
    const g = m.groups ?? {}
    if (g.m === undefined && g.mer === undefined) continue
    const hour = Number(g.h)
    if (hour > HALF_DAY_HOURS) continue
    out.push({ hour, minute: g.m === undefined ? 0 : Number(g.m), meridiem: meridiemOf(g.mer), raw: m[0].trim(), index: m.index ?? 0 })
  }
  // A time written without a.m./p.m. ("12:20-1:15 PM") takes the mark of the next time that has one.
  for (let i = out.length - 1; i >= 0; i -= 1) {
    if (out[i].meridiem === null) {
      const next = out.slice(i + 1).find((t) => t.meridiem !== null)
      out[i].meridiem = next ? (out[i].hour === HALF_DAY_HOURS ? 'pm' : next.meridiem) : null
    }
  }
  return out
}

/** A token as a Date on the reference day. */
export function toDate(t: ClockToken): Date {
  const base = t.hour % HALF_DAY_HOURS
  const hour24 = t.meridiem === 'pm' ? base + HALF_DAY_HOURS : base
  return utcMinute.offset(utcHour.offset(EPOCH, hour24), t.minute)
}

export function minutesBetween(a: Date, b: Date): number {
  return utcMinute.count(a, b)
}

/** "2:27 p.m." in DESIGN_29's style. */
export function formatClock(d: Date): string {
  const h24 = d.getUTCHours()
  const h = h24 % HALF_DAY_HOURS === 0 ? HALF_DAY_HOURS : h24 % HALF_DAY_HOURS
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m} ${h24 >= HALF_DAY_HOURS ? 'p.m.' : 'a.m.'}`
}

/** "5 hours 36 minutes" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / MINUTES_PER_HOUR)
  const m = minutes % MINUTES_PER_HOUR
  const hs = h === 1 ? 'hour' : 'hours'
  const ms = m === 1 ? 'minute' : 'minutes'
  if (h === 0) return `${m} ${ms}`
  if (m === 0) return `${h} ${hs}`
  return `${h} ${hs} ${m} ${ms}`
}
