// Day 26 hive-plot geometry: three axes (people, tasks, who directed), nodes spaced evenly on each,
// links drawn as curves between axes. Pure function of the selection.
import { layout } from '@/lib/viz/layout'
import type { Day26Selection, Link } from './select'

export type Axis = 'people' | 'tasks' | 'directors'

export interface HiveNode {
  id: string
  axis: Axis
  label: string
  x: number
  y: number
  anchor: 'start' | 'end' | 'middle'
  lx: number
  ly: number
  degree: number
}

export interface HiveLink {
  key: string
  kind: Link['kind']
  from: string
  to: string
  d: string
}

export interface HiveGeometry {
  width: number
  height: number
  axes: Array<{ axis: Axis; x1: number; y1: number; x2: number; y2: number; label: string; lx: number; ly: number; anchor: 'start' | 'end' | 'middle' }>
  nodes: HiveNode[]
  links: HiveLink[]
}

const TAU = Math.PI * 2
const THIRD = TAU / (2 + 1)

export function hiveGeometry(sel: Day26Selection, shortTask: Record<string, string>): HiveGeometry {
  const width = layout.chartWidth
  const base = layout.chartWidth * (2 / (2 + 1))
  const cx = width / 2
  const cy = base / 2 + layout.margin.bottom + layout.gap
  const r0 = layout.margin.bottom + layout.gap
  const r1 = base / 2
  const height = cy + r1 / 2 + layout.margin.bottom + layout.gap * 2
  const angle: Record<Axis, number> = { people: -Math.PI / 2, tasks: -Math.PI / 2 + THIRD, directors: -Math.PI / 2 + THIRD * 2 }
  const at = (a: number, r: number) => ({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
  const lists: Record<Axis, Array<{ id: string; label: string }>> = {
    people: sel.people.map((p) => ({ id: p.id, label: p.label })),
    tasks: sel.tasks.map((t) => ({ id: t.id, label: shortTask[t.id] ?? t.label })),
    directors: sel.directors.map((d) => ({ id: d.id, label: d.label.split(' (')[0] })),
  }
  const nodes: HiveNode[] = []
  ;(Object.keys(lists) as Axis[]).forEach((axis) => {
    const list = lists[axis]
    list.forEach((n, i) => {
      const t = list.length > 1 ? i / (list.length - 1) : 1 / 2
      const r = axis === 'directors' ? r0 + (r1 - r0) * (1 / 2 + t / 2) : r0 + t * (r1 - r0)
      const p = at(angle[axis], r)
      const anchor = axis === 'directors' ? 'end' : 'start'
      const off = layout.dot * 2
      nodes.push({
        id: n.id,
        axis,
        label: n.label,
        x: p.x,
        y: p.y,
        anchor,
        lx: p.x + (anchor === 'end' ? -off : off),
        ly: p.y + layout.fontSize.label / (2 + 1),
        degree: sel.links.filter((l) => l.from === n.id || l.to === n.id).length,
      })
    })
  })
  const node = (id: string) => nodes.find((n) => n.id === id)
  const links: HiveLink[] = sel.links
    .map((l) => {
      const a = node(l.from)
      const b = node(l.to)
      if (!a || !b) return null
      // Curve through control points pulled toward the centre (the usual hive-plot link).
      const pull = 1 / 2
      const c1 = { x: cx + (a.x - cx) * pull, y: cy + (a.y - cy) * pull }
      const c2 = { x: cx + (b.x - cx) * pull, y: cy + (b.y - cy) * pull }
      return { key: l.key, kind: l.kind, from: l.from, to: l.to, d: `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}` }
    })
    .filter((l): l is HiveLink => Boolean(l))
  const axisLabel: Record<Axis, string> = { people: 'People who worked for Combs', tasks: 'Tasks they described', directors: 'Who directed' }
  const axes = (Object.keys(angle) as Axis[]).map((axis) => {
    const p1 = at(angle[axis], r0 - layout.gap)
    const p2 = at(angle[axis], r1 + layout.gap)
    const pl = at(angle[axis], r1 + layout.gap * 2)
    return {
      axis,
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      label: axisLabel[axis],
      lx: pl.x,
      ly: pl.y + (axis === 'people' ? 0 : layout.fontSize.label),
      anchor: (axis === 'people' ? 'middle' : axis === 'tasks' ? 'end' : 'start') as 'start' | 'end' | 'middle',
    }
  })
  return { width, height, axes, nodes, links }
}
