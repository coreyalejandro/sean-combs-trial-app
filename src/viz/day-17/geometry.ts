// Day 17 geometry, computed at build time: a U.S. outline with the two cities and the arc between them
// (d3-geo, us-atlas), and the shared date strip (one column per day, one row per place).
import { geoAlbersUsa, geoPath, scaleBand, type GeoContext } from 'd3'
import { feature, mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import us from 'us-atlas/states-10m.json'
import { layout } from '@/lib/viz/layout'
import { shortDay } from '../day-15/kit/time'
import { isoToDate } from '../day-15/kit/time'
import type { City, DateMark, LaneId } from './select'

export interface MapGeo { width: number; height: number; nation: string; states: string; arc: string | null; cities: Array<{ id: City['id']; name: string; x: number; y: number }> }
export interface StripGeo {
  width: number
  height: number
  days: Array<{ iso: string; x: number; w: number; weekday: string; label: string }>
  lanes: Array<{ id: LaneId; name: string; labelY: number; y: number; h: number }>
  marks: Array<{ id: string; x0: number; x1: number; cy: number; lane: LaneId }>
}

export const LANES: Array<{ id: LaneId; name: string }> = [
  { id: 'ny', name: 'New York' },
  { id: 'la', name: 'Los Angeles' },
  { id: 'none', name: 'No place stated' },
]

const topo = us as unknown as Topology<{ nation: GeometryCollection; states: GeometryCollection }>

/**
 * A path context that drops points closer than `min` px to the last kept point and rings that collapse,
 * so the small outline maps stay light in the page (the outline is context, not data).
 */
class LightPath {
  private parts: string[] = []
  private ring: Array<[number, number]> = []
  constructor(private min: number) {}
  moveTo(x: number, y: number) { this.flush(); this.ring = [[x, y]] }
  lineTo(x: number, y: number) {
    const last = this.ring[this.ring.length - 1]
    if (!last || Math.hypot(x - last[0], y - last[1]) >= this.min) this.ring.push([x, y])
  }
  closePath() { this.flush(true) }
  arc() { /* points are not drawn with this context */ }
  beginPath() { /* each ring starts with moveTo */ }
  private flush(close = false) {
    if (this.ring.length > 2 || (!close && this.ring.length > 1)) {
      const r = (n: number) => Math.round(n)
      this.parts.push(`M${this.ring.map(([x, y]) => `${r(x)},${r(y)}`).join('L')}${close ? 'Z' : ''}`)
    }
    this.ring = []
  }
  result() { this.flush(); const out = this.parts.join(''); this.parts = []; return out }
}

export function mapGeo(cities: City[], width: number, height: number): MapGeo {
  const nation = feature(topo, topo.objects.nation)
  const projection = geoAlbersUsa().fitSize([width, height], nation)
  const path = geoPath(projection).digits(1)
  const light = new LightPath(layout.stroke.mark)
  const lightPath = geoPath(projection, light as unknown as GeoContext)
  const draw = (obj: Parameters<typeof lightPath>[0]) => { lightPath(obj); return light.result() }
  const pts = cities
    .map((c) => ({ c, p: projection(c.lonLat) }))
    .filter((x): x is { c: City; p: [number, number] } => !!x.p)
    .map(({ c, p }) => ({ id: c.id, name: c.name, x: p[0], y: p[1] }))
  const arc = cities.length === 2 ? path({ type: 'LineString', coordinates: [cities[0].lonLat, cities[1].lonLat] }) : null
  return {
    width,
    height,
    nation: draw(nation),
    states: draw(mesh(topo, topo.objects.states, (a, b) => a !== b)),
    arc,
    cities: pts,
  }
}

export function stripGeo(days: string[], marks: DateMark[], width: number): StripGeo {
  const x = scaleBand<string>().domain(days).range([0, width]).paddingInner(layout.stroke.mark / layout.gap)
  const head = layout.tap
  const labelH = layout.fontSize.label + layout.dot
  const rowH = layout.tap
  const lanes = LANES.filter((l) => marks.some((m) => m.lane === l.id)).map((l, i) => {
    const top = head + i * (labelH + rowH)
    return { id: l.id, name: l.name, labelY: top + layout.fontSize.label, y: top + labelH, h: rowH }
  })
  const laneOf = new Map(lanes.map((l) => [l.id, l]))
  const geoMarks = marks.flatMap((m) => {
    const lane = laneOf.get(m.lane)
    const a = x(m.start)
    const b = x(m.end)
    if (!lane || a === undefined || b === undefined) return []
    // two marks on the same lane and day sit side by side, not on top of each other
    const twins = marks.filter((o) => o.lane === m.lane && o.start === m.start && o.end === m.end && o.start === o.end)
    const k = twins.indexOf(m)
    const offset = twins.length > 1 ? (k - (twins.length - 1) / 2) * layout.gap : 0
    return [{ id: m.id, x0: a + (m.start === m.end ? offset : 0), x1: b + x.bandwidth() + (m.start === m.end ? offset : 0), cy: lane.y + lane.h / 2, lane: m.lane }]
  })
  return {
    width,
    height: head + lanes.length * (labelH + rowH) + layout.stroke.mark,
    days: days.map((iso) => {
      const d = isoToDate(iso)?.date ?? new Date(iso)
      return { iso, x: x(iso) ?? 0, w: x.bandwidth(), weekday: d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), label: shortDay(d) }
    }),
    lanes,
    marks: geoMarks,
  }
}
