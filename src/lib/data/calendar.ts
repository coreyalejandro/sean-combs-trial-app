// Dates inside the testimony span with no testimony, shown on the trial rail as grey gaps.
// June 18, 2025: court convened, a juror was ill, no witnesses. The note text comes from the data
// (the calendar_note recorded on the day before the gap), so nothing here is typed by hand except the date.
import { data as publicData } from './store'

const data = publicData

export interface CalendarGap {
  date: string
  /** The gap sits after this testimony day on the rail. */
  afterDay: number
  label: string
  note: string
}

const GAP_DATES = ['2025-06-18']

export function getGaps(): CalendarGap[] {
  return GAP_DATES.map((date) => {
    const before = [...data.days].filter((d) => d.date < date).pop()
    if (!before) throw new Error(`No testimony day before gap ${date}`)
    const note = before.calendar_note ?? data.days.find((d) => d.calendar_note?.includes('June 18'))?.calendar_note ?? ''
    return { date, afterDay: before.day, label: 'No testimony', note: note.split('. Thursday')[0] + '.' }
  })
}
