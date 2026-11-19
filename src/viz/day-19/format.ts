// Day 19: an event's date in words (shared by the picture and the text version).
import { formatDate } from '@/lib/data'
import { formatMonth, isoToDate } from '../day-15/kit/time'

export function whenText(e: { iso: string; precision: string }): string {
  const d = isoToDate(e.iso)?.date
  if (!d) return e.iso
  return e.precision === 'day' ? formatDate(e.iso) : `${formatMonth(d)} (day not reported)`
}
