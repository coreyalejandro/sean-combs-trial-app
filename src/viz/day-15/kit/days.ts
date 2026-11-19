// Read another testimony day by its name ("Day 25"), so cross-day references read as words, not bare numbers.
import { getDay, type TrialDay } from '@/lib/data'

export function dayNumber(ref: string): number {
  const n = Number(ref.replace(/\D/g, ''))
  if (!Number.isInteger(n) || n < 1) throw new Error(`Not a day reference: ${ref}`)
  return n
}

export function dayRef(ref: string): TrialDay {
  return getDay(dayNumber(ref))
}

export const dayHref = (n: number) => `/day/${n}/`
