// The one way to read trial data. Server components and build-time code import from here.
// Never type a fact into a component: read it from these functions.
import raw from '@/data/trial_days.json'
import chargesFile from '@/data/shared/charges.json'
import witnessesFile from '@/data/shared/witnesses.json'
import type { Charge, Source, TrialData, TrialDay, Verdict, WitnessRecord } from './types'

export * from './types'
export { resolveSources, sourcesForDay, allSources, sourceById } from './sources'
export { confidenceInfo, CONFIDENCE_ORDER, lowerConfidence } from './confidence'
export { redactThirdParties } from './redact'
export { getGaps, type CalendarGap } from './calendar'

const data = raw as unknown as TrialData

/** Number of testimony days (28). Derived from the data, never typed. */
export const DAY_COUNT: number = data.days.length

export function getTrialData(): TrialData {
  return data
}

export function getDays(): TrialDay[] {
  return data.days
}

/** Day n (1-based). Throws if the day is not in the data, so a bad route fails the build loudly. */
export function getDay(n: number): TrialDay {
  const day = data.days.find((d) => d.day === n)
  if (!day) throw new Error(`No testimony day ${n} in trial_days.json`)
  return day
}

export function getDayNumbers(): number[] {
  return data.days.map((d) => d.day)
}

export function getVerdict(): Verdict {
  return data.verdict
}

export function getCaseName(): string {
  return data.case
}

export function getNumberingRule(): string {
  return data.numbering_rule
}

export function getCharges(): Charge[] {
  return (chargesFile as { charges: Charge[] }).charges
}

/** The 34 prosecution witnesses (scaffold-owned shared table). */
export function getWitnesses(): WitnessRecord[] {
  return (witnessesFile as { witnesses: WitnessRecord[] }).witnesses
}

/** Witnesses who had taken the stand by the end of day n. */
export function getWitnessesThrough(n: number): WitnessRecord[] {
  return getWitnesses().filter((w) => w.first_day <= n)
}

/** The witnesses on the stand on day n, in that day's order, with the name the app may display. */
export function getWitnessesOnDay(n: number): WitnessRecord[] {
  return getWitnesses().filter((w) => w.days.includes(n))
}

/** Format an ISO date (2025-05-12) as "Monday, May 12, 2025" without timezone drift. */
export function formatDate(iso: string, opts: { weekday?: boolean; year?: boolean } = {}): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: opts.weekday ? 'long' : undefined,
    month: 'long',
    day: 'numeric',
    year: opts.year === false ? undefined : 'numeric',
  })
}

export type { Source }
