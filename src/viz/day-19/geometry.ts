// Day 19 geometry (build time): swimlanes over time. Wide screens run time left to right with one row per
// person; phones run time top to bottom with one column per person, so nothing scrolls sideways.
// One geometry per zoom level ("all months", then each month).
import { scaleLinear, scaleUtc, utcMonday, utcMonth } from 'd3'
import { layout } from '@/lib/viz/layout'
import { isoToDate } from '../day-15/kit/time'
import { LANES, type LaneId, type TimelineEvent } from './select'

export interface LaneGeo { id: LaneId; pos: number; name: string }
export interface TickGeo { pos: number; label: string; major: boolean }
export interface EventGeo { id: string; t: number; from: number; to: number | null }
export interface SwimGeo {
  vertical: boolean
  width: number
  height: number
  /** Start and end of the time axis, in px. */
  t0: number
  t1: number
  lanes: LaneGeo[]
  ticks: TickGeo[]
  events: EventGeo[]
}

const monthLabel = (d: Date, withYear: boolean) =>
  d.toLocaleDateString('en-US', { month: 'short', year: withYear ? 'numeric' : undefined, timeZone: 'UTC' })

export function zoomKeys(events: TimelineEvent[]): string[] {
  if (events.length === 0) return ['all']
  const first = isoToDate(events[0].iso)?.date
  const last = isoToDate(events[events.length - 1].iso)?.date
  if (!first || !last) return ['all']
  return ['all', ...utcMonth.range(utcMonth.floor(first), utcMonth.offset(utcMonth.floor(last), 1)).map((d) => d.toISOString().slice(0, 'yyyy-mm'.length))]
}

export function swimGeo(events: TimelineEvent[], zoom: string, vertical: boolean, width: number): SwimGeo {
  const dates = events.map((e) => isoToDate(e.iso)?.date).filter((d): d is Date => !!d)
  const start = zoom === 'all' ? utcMonth.floor(dates[0] ?? new Date(0)) : isoToDate(zoom)?.date ?? new Date(0)
  const end = zoom === 'all' ? utcMonth.offset(utcMonth.floor(dates[dates.length - 1] ?? new Date(0)), 1) : utcMonth.offset(start, 1)
  const span = zoom === 'all' ? utcMonth.count(start, end) : utcMonday.count(start, end) + 1

  const labelW = vertical ? layout.tap + layout.gap : layout.tap * (2 + 2)
  const headH = vertical ? layout.tap : layout.margin.top + layout.gap / 2
  const laneStep = vertical ? (width - labelW - layout.stroke.mark) / LANES.length : layout.tap
  const tStep = vertical ? (zoom === 'all' ? layout.tap + layout.gap : layout.tap * 2) : 0
  const t0 = vertical ? headH : labelW
  const t1 = vertical ? headH + span * tStep : width - layout.margin.right
  const t = scaleUtc().domain([start, end]).range([t0, t1])
  const lanePos = scaleLinear().domain([0, LANES.length]).range(vertical ? [labelW, labelW + laneStep * LANES.length] : [headH, headH + laneStep * LANES.length])
  const lanes: LaneGeo[] = LANES.map((l, i) => ({ id: l.id, name: vertical ? l.short : l.name, pos: lanePos(i + 1 / 2) }))
  const at = (id: LaneId | null) => (id === null ? null : lanes.find((l) => l.id === id)?.pos ?? null)

  const tickDates = zoom === 'all' ? utcMonth.range(start, end) : utcMonday.range(start, end)
  const ticks: TickGeo[] = tickDates.map((d, i) => ({
    pos: t(d),
    label: zoom === 'all' ? monthLabel(d, i === 0 || d.getUTCMonth() === 0) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
    major: zoom === 'all' ? d.getUTCMonth() === 0 : false,
  }))

  const inRange = events.filter((e) => {
    const d = isoToDate(e.iso)?.date
    return d !== undefined && d >= start && d < end
  })
  return {
    vertical,
    width,
    height: vertical ? t1 + layout.gap : headH + laneStep * LANES.length + layout.dot,
    t0,
    t1,
    lanes,
    ticks,
    events: inRange.map((e) => ({ id: e.id, t: t(isoToDate(e.iso)?.date ?? start), from: at(e.from) ?? 0, to: at(e.to) })),
  }
}
