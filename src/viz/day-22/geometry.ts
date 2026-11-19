// Day 22 layout: one row per court day, bars along clock time. Pure function of the selection and a width.
// Every size comes from src/lib/viz/layout.ts.
import { scaleUtc, utcHour } from 'd3'
import { layout } from '@/lib/viz/layout'
import { formatClock, formatDuration, HALF_DAY_HOURS, MINUTES_PER_HOUR, minutesBetween } from './clock'
import { EXAM_LABEL, EXAM_SIDE, type Day22Selection, type Exam } from './select'

export interface BarMark {
  key: string
  row: number
  exam: Exam
  side: 'prosecution' | 'defense' | 'court'
  x: number
  y: number
  w: number
  h: number
  /** Dashed outline: placement or length approximate, or times not reported. */
  approximate: boolean
  notReported: boolean
  label: string
  aria: string
  sourceIds: string
}

export interface RowMark {
  row: number
  y: number
  labelX: number
  labelY: number
  dayLabel: string
  dateLabel: string
  durationText: string
  durationX: number
  durationY: number
  sourceIds: string
  calculated: boolean
}

export interface GanttGeometry {
  width: number
  height: number
  axisY: number
  durationHeadX: number
  durationHeadY: number
  ticks: Array<{ x: number; label: string }>
  plotTop: number
  plotBottom: number
  bars: BarMark[]
  rows: RowMark[]
  gaps: Array<{ key: string; x: number; y: number; w: number; h: number; label: string }>
  ticksBack: Array<{ key: string; x: number; y: number; h: number; label: string }>
  endMark: { x: number; y: number } | null
  narrow: boolean
}

function hourLabel(d: Date): string {
  const h24 = d.getUTCHours()
  const h = h24 % HALF_DAY_HOURS === 0 ? HALF_DAY_HOURS : h24 % HALF_DAY_HOURS
  return `${h} ${h24 >= HALF_DAY_HOURS ? 'p.m.' : 'a.m.'}`
}

/** "2 hr 3 min" for the chart's narrow right-hand column. */
function compact(minutes: number): string {
  const h = Math.floor(minutes / MINUTES_PER_HOUR)
  const m = minutes % MINUTES_PER_HOUR
  return h > 0 ? `${h} hr ${m} min` : `${m} min`
}

export const SHORT_EXAM: Record<Exam, string> = { direct: 'Direct', cross: 'Cross', redirect: 'Redirect', 're-cross': 'Re-cross', closed: 'Closed conference' }

const short = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(0, m - 1, d))
  return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })
}

export function ganttGeometry(sel: Day22Selection, width: number): GanttGeometry {
  const narrow = width < layout.breakpoint
  const { margin, tap, gap, fontSize } = layout
  const labelW = narrow ? 0 : margin.left + tap + gap * 2
  const durW = narrow ? 0 : margin.left * 2 + tap
  const rowGap = narrow ? fontSize.label + gap : gap / 2
  const barH = narrow ? tap - gap / 2 : tap - gap / 2
  const rowH = barH + rowGap
  const axisY = margin.top + (narrow ? 0 : fontSize.label)
  const plotTop = axisY + gap
  const x0 = (narrow ? margin.left : margin.right) + labelW
  const x1 = width - margin.right - durW

  const times = sel.rows.flatMap((r) => r.segments.flatMap((s) => [s.start?.date, s.end?.date])).filter((d): d is Date => Boolean(d))
  const lo = utcHour.floor(new Date(Math.min(...times.map((t) => t.getTime()))))
  const hi = utcHour.ceil(new Date(Math.max(...times.map((t) => t.getTime()))))
  const x = scaleUtc().domain([lo, hi]).range([x0, x1])
  const ticks = x.ticks(utcHour.every(narrow ? 2 : 1) ?? utcHour).map((d) => ({ x: x(d), label: hourLabel(d) }))

  const bars: BarMark[] = []
  const rows: RowMark[] = []
  const gaps: GanttGeometry['gaps'] = []
  const ticksBack: GanttGeometry['ticksBack'] = []
  let endMark: GanttGeometry['endMark'] = null

  sel.rows.forEach((r, i) => {
    const top = plotTop + i * rowH + (narrow ? fontSize.label + gap / 2 : 0)
    const dayLabel = `Day ${r.n}`
    const dateLabel = `${r.weekday.slice(0, 2 + 1)}, ${short(r.date)}`
    const rowSources = r.sources.map((s) => s.id).join(' ')
    rows.push({
      row: i,
      y: top,
      labelX: margin.right,
      labelY: narrow ? top - gap / 2 + 1 : top + barH / 2,
      dayLabel,
      dateLabel,
      durationText: r.minutes === null ? 'not reported' : `≈ ${compact(r.minutes)}`,
      durationX: narrow ? x1 : width - margin.right,
      durationY: narrow ? top - gap / 2 + 1 : top + barH / 2,
      sourceIds: rowSources,
      calculated: r.minutes !== null,
    })
    let cursor = x0
    const untimed = r.segments.filter((s) => s.timesNotReported)
    r.segments.forEach((s, j) => {
      const side = EXAM_SIDE[s.exam]
      const ids = [s.start, s.end].flatMap((f) => (f ? f.sources.map((src) => src.id) : [])).concat(s.timesNotReported ? r.sources.map((src) => src.id) : [])
      const sourceIds = [...new Set(ids)].join(' ')
      const who = s.by ? `, questioned by ${s.by}` : ''
      if (s.start && s.end) {
        const xa = x(s.start.date)
        const xb = x(s.end.date)
        cursor = Math.max(cursor, xb)
        const mins = minutesBetween(s.start.date, s.end.date)
        const timeText = `${formatClock(s.start.date)} to ${formatClock(s.end.date)}`
        bars.push({
          key: `${r.n}-${j}`,
          row: i,
          exam: s.exam,
          side,
          x: xa,
          y: top,
          w: Math.max(xb - xa, 1),
          h: barH,
          approximate: s.approximate,
          notReported: false,
          label: SHORT_EXAM[s.exam],
          aria: `${dateLabel}: ${EXAM_LABEL[s.exam]}${who}, ${s.approximate ? 'about ' : ''}${timeText} (${formatDuration(mins)}${s.approximate ? ', approximate' : ''}).`,
          sourceIds,
        })
      } else if (s.timesNotReported) {
        // Parts of the day with no reported times share the rest of the row, in order, outlined only.
        const k = untimed.indexOf(s)
        const span = (x1 - cursor) / untimed.length
        bars.push({
          key: `${r.n}-${j}`,
          row: i,
          exam: s.exam,
          side,
          x: cursor + k * span,
          y: top,
          w: Math.max(span - 2, 1),
          h: barH,
          approximate: true,
          notReported: true,
          label: SHORT_EXAM[s.exam],
          aria: `${dateLabel}: ${EXAM_LABEL[s.exam]}${who}; times not reported (order as recorded; widths do not show length).`,
          sourceIds,
        })
        if (i === sel.rows.length - 1 && k === untimed.length - 1) endMark = { x: x1, y: top + barH / 2 }
      }
    })
    if (r.lunch) {
      const xa = x(r.lunch.start.date)
      const xb = x(r.lunch.end.date)
      gaps.push({ key: `lunch-${r.n}`, x: xa, y: top, w: xb - xa, h: barH, label: 'lunch' })
    }
    if (r.lunchReturn) {
      ticksBack.push({ key: `back-${r.n}`, x: x(r.lunchReturn.date), y: top, h: barH, label: `back from lunch ${formatClock(r.lunchReturn.date)}` })
    }
    if (i === sel.rows.length - 1 && !endMark) {
      const last = bars.filter((b) => b.row === i).pop()
      if (last) endMark = { x: last.x + last.w, y: top + barH / 2 }
    }
  })

  const plotBottom = plotTop + sel.rows.length * rowH + (narrow ? fontSize.label : 0)
  return { width, height: plotBottom + margin.bottom / 2, axisY, durationHeadX: width - margin.right, durationHeadY: axisY - fontSize.label, ticks, plotTop, plotBottom, bars, rows, gaps, ticksBack, endMark, narrow }
}
