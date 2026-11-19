// Day 27 map geometry: land and state lines, places, and Loewen-style lifted great-circle arcs.
// Arcs are drawn only where a record names both ends of a trip; otherwise a ring marks the arrival city.
import { geoConicEqualArea, geoInterpolate, geoPath } from 'd3'
import { feature, mesh } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import landTopo from 'world-atlas/land-110m.json'
import statesTopo from 'us-atlas/states-10m.json'
import { layout } from '@/lib/viz/layout'
import type { Day27Selection } from './select'

export interface MapGeometry {
  width: number
  height: number
  land: string
  states: string
  places: Array<{ id: string; name: string; x: number; y: number; ly: number; anchor: 'start' | 'end' }>
  arcs: Array<{ tripId: string; d: string; length: number; head: { x: number; y: number } }>
  rings: Array<{ key: string; tripId: string; x: number; y: number; r: number }>
  narrow: boolean
  inset: { x: number; y: number; w: number; h: number; land: string; label: string } | null
}

export function mapGeometry(sel: Day27Selection, width: number, height: number): MapGeometry {
  const narrow = width < layout.breakpoint
  const pad = narrow ? layout.gap * 2 : layout.margin.left * 2
  // Places across the Atlantic go in an inset, so the main map can stay close on North America.
  const far = (p: { lon: number }) => p.lon > -(layout.margin.left - layout.gap)
  const pts = sel.places.filter((p) => !far(p)).map((p) => [p.lon, p.lat] as [number, number])
  const main = geoConicEqualArea()
    .parallels([layout.fontSize.value + layout.dot, layout.margin.left + 2])
    .rotate([layout.margin.left + layout.margin.right + layout.fontSize.value - 2, 0])
    .fitExtent([[pad, pad], [width - pad, height - pad]], { type: 'MultiPoint', coordinates: pts })
  const farPlaces = sel.places.filter(far)
  const iw = width / (2 + 2)
  const ih = height / (2 + 2)
  const ix = layout.stroke.mark
  const iy = height - ih - layout.stroke.mark
  const insetProj = farPlaces.length
    ? geoConicEqualArea()
        .parallels([layout.margin.left, layout.margin.left + layout.gap])
        .rotate([-farPlaces[0].lon, 0])
        .fitExtent([[ix + layout.gap, iy + layout.gap], [ix + iw - layout.gap, iy + ih - layout.gap]], {
          type: 'MultiPoint',
          coordinates: farPlaces.flatMap((p) => [[p.lon - layout.gap / 2, p.lat - layout.dot], [p.lon + layout.gap / 2, p.lat + layout.dot]] as [number, number][]),
        })
        .clipExtent([[ix, iy], [ix + iw, iy + ih]])
    : null
  const projection = (c: [number, number]) => {
    const p = sel.places.find((q) => q.lon === c[0] && q.lat === c[1])
    return p && far(p) && insetProj ? insetProj(c) : main(c)
  }
  const path = geoPath(main)
  const lt = landTopo as unknown as Topology<{ land: GeometryCollection }>
  const st = statesTopo as unknown as Topology<{ states: GeometryCollection }>
  const round = (s: string | null) => (s ?? '').replace(/-?\d+\.\d+/g, (m) => String(Math.round(Number(m))))
  const landGeo = feature(lt, lt.objects.land)
  const land = round(path(landGeo))
  const states = round(path(mesh(st, st.objects.states, (a, b) => a !== b)))
  const xy = (id: string) => {
    const p = sel.places.find((q) => q.id === id)
    const v = p ? projection([p.lon, p.lat]) : null
    return v ? { x: v[0], y: v[1] } : null
  }
  const places = sel.places
    .map((p) => {
      const v = xy(p.id)
      const name = p.name.split(',')[0]
      const fs = narrow ? layout.fontSize.small : layout.fontSize.label
      const tooWide = v ? v.x + layout.dot * 2 + (name.length * fs) / 2 > width : false
      return v ? { id: p.id, name, ...v, ly: tooWide ? v.y + fs * 2 : v.y, anchor: (tooWide ? 'end' : 'start') as 'start' | 'end' } : null
    })
    .filter((p): p is MapGeometry['places'][number] => Boolean(p))
    .sort((p, q) => p.y - q.y)
  // Nudge labels that would overlap a label already placed.
  const lh = (narrow ? layout.fontSize.small : layout.fontSize.label) + 2
  const lw = layout.chartWidth / (narrow ? (2 + 2) * (2 + 1) : (2 + 2) * (2 + 2))
  places.forEach((p, i) => {
    for (const q of places.slice(0, i)) {
      if (Math.abs(q.x - p.x) < lw && Math.abs(q.ly - p.ly) < lh) p.ly = q.ly + lh
    }
  })
  const inset = insetProj
    ? { x: ix, y: iy, w: iw, h: ih, land: round(geoPath(insetProj)(landGeo)), label: `Inset: ${farPlaces.map((p) => p.name.split(',')[0]).join(', ')}` }
    : null

  const arcs: MapGeometry['arcs'] = []
  const rings: MapGeometry['rings'] = []
  const ringCount = new Map<string, number>()
  for (const t of sel.trips) {
    const ends = t.from ? [t.from, ...t.to] : []
    if (t.from && t.to.length > 0) {
      for (const to of t.to) {
        const a = sel.places.find((p) => p.id === t.from)
        const b = sel.places.find((p) => p.id === to)
        if (!a || !b) continue
        const interp = geoInterpolate([a.lon, a.lat], [b.lon, b.lat])
        const steps = layout.tap
        const raw = Array.from({ length: steps + 1 }, (_, i) => projection(interp(i / steps)))
          .filter((p): p is [number, number] => Boolean(p))
        const [x0, y0] = raw[0]
        const [x1, y1] = raw[raw.length - 1]
        const len = Math.hypot(x1 - x0, y1 - y0)
        // Lift each point off the great circle by a sine of its position (John Loewen's arc method):
        // the arc bows upward in proportion to its length, so short and long trips read alike.
        let nx = (y0 - y1) / (len || 1)
        let ny = (x1 - x0) / (len || 1)
        if (ny > 0) { nx = -nx; ny = -ny } // always bow upward
        const lift = len / (2 + 2)
        const lifted = raw.map(([x, y], i) => {
          const k = Math.sin((Math.PI * i) / (raw.length - 1)) * lift
          return [x + nx * k, y + ny * k] as [number, number]
        })
        const d = lifted.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
        let length = 0
        for (let i = 1; i < lifted.length; i += 1) length += Math.hypot(lifted[i][0] - lifted[i - 1][0], lifted[i][1] - lifted[i - 1][1])
        arcs.push({ tripId: t.id, d, length, head: { x: lifted[lifted.length - 1][0], y: lifted[lifted.length - 1][1] } })
      }
    }
    const ringAt = [...(t.from ? [] : t.to), ...t.stay].filter((id) => !ends.includes(id) || t.stay.includes(id))
    for (const id of ringAt) {
      const v = xy(id)
      if (!v) continue
      const k = ringCount.get(id) ?? 0
      ringCount.set(id, k + 1)
      rings.push({ key: `${t.id}-${id}`, tripId: t.id, x: v.x, y: v.y, r: layout.dot + 2 + k * (layout.dot - 1) })
    }
  }
  return { width, height, land, states, places, arcs, rings, narrow, inset }
}
