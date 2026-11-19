// Day 20 geometry (build time): five lanes of legal events placed by trial day.
import { scaleLinear } from 'd3'
import { DAY_COUNT } from '@/lib/data'
import { layout } from '@/lib/viz/layout'
import { KINDS, type DocketEvent, type Kind } from './select'

export interface DocketGeo {
  width: number
  height: number
  x0: number
  x1: number
  lanes: Array<{ id: Kind; name: string; y0: number; y1: number }>
  days: Array<{ n: number; x: number }>
  marks: Array<{ id: string; x: number; y: number }>
}

export function docketGeo(events: DocketEvent[], width: number): DocketGeo {
  const x0 = layout.tap * (2 + 2) + layout.gap
  const x1 = width - layout.margin.right
  const x = scaleLinear().domain([1 / 2, DAY_COUNT + 1 / 2]).range([x0, x1])
  const step = layout.gap + layout.dot
  const head = layout.margin.top + layout.dot
  // stack events that share a lane and a day
  const slot = new Map<string, number>()
  const stackOf = new Map<string, number>()
  for (const e of events) {
    const key = `${e.kind}|${e.at}`
    const k = slot.get(key) ?? 0
    stackOf.set(e.id, k)
    slot.set(key, k + 1)
  }
  const lanes: DocketGeo['lanes'] = []
  let y = head
  for (const kind of KINDS) {
    const depth = Math.max(1, ...events.filter((e) => e.kind === kind.id).map((e) => (stackOf.get(e.id) ?? 0) + 1))
    const h = depth * step + layout.gap
    lanes.push({ id: kind.id, name: kind.name, y0: y, y1: y + h })
    y += h
  }
  const laneOf = new Map(lanes.map((l) => [l.id, l]))
  return {
    width,
    height: y + layout.dot,
    x0,
    x1,
    lanes,
    days: Array.from({ length: DAY_COUNT }, (_, i) => ({ n: i + 1, x: x(i + 1) })),
    marks: events.map((e) => {
      const lane = laneOf.get(e.kind)
      return { id: e.id, x: x(e.at), y: (lane?.y0 ?? 0) + layout.gap / 2 + step / 2 + (stackOf.get(e.id) ?? 0) * step }
    }),
  }
}
