// Day 25 treemap geometry: one tile per exhibit, grouped by kind. Pure function of the selection and a size.
import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from 'd3'
import { layout } from '@/lib/viz/layout'
import type { Day25Selection, Exhibit, Kind, Side } from './select'

export interface Tile {
  id: string
  x: number
  y: number
  w: number
  h: number
  side: Side
  sealed: boolean
  today: boolean
}

export interface GroupBox {
  kind: Kind
  label: string
  count: number
  sealed: number
  x: number
  y: number
  w: number
  h: number
  tiles: Tile[]
  aria: string
}

export interface TreemapGeometry {
  width: number
  height: number
  groups: GroupBox[]
  narrow: boolean
}

type Node = { name: string; kind?: Kind; exhibit?: Exhibit; children?: Node[] }

export function treemapGeometry(sel: Day25Selection, width: number, height: number): TreemapGeometry {
  const narrow = width < layout.breakpoint
  const root = hierarchy<Node>({
    name: 'all',
    children: sel.groups.map((g) => ({ name: g.label, kind: g.kind, children: g.exhibits.map((e) => ({ name: e.id, exhibit: e })) })),
  })
    .sum((d) => (d.exhibit ? 1 : 0))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
  const head = layout.fontSize.label + layout.dot + 2
  const laid = treemap<Node>()
    .tile(treemapSquarify)
    .size([width, height])
    .paddingOuter(layout.stroke.emphasis)
    .paddingTop(head)
    .paddingInner(1)
    .round(true)(root)
  const today = new Set(sel.todayIds)
  const groups: GroupBox[] = (laid.children ?? []).map((g: HierarchyRectangularNode<Node>) => {
    const meta = sel.groups.find((x) => x.kind === g.data.kind)
    const tiles: Tile[] = (g.children ?? []).map((t) => {
      const e = t.data.exhibit as Exhibit
      return { id: e.id, x: t.x0, y: t.y0, w: t.x1 - t.x0, h: t.y1 - t.y0, side: e.side, sealed: e.sealed, today: today.has(e.id) }
    })
    const count = meta?.exhibits.length ?? 0
    const sealed = meta?.sealed ?? 0
    const def = meta?.bySide.defense ?? 0
    const pro = meta?.bySide.prosecution ?? 0
    return {
      kind: g.data.kind as Kind,
      label: g.data.name,
      count,
      sealed,
      x: g.x0,
      y: g.y0,
      w: g.x1 - g.x0,
      h: g.y1 - g.y0,
      tiles,
      aria: `${g.data.name}: ${count} exhibits named in coverage; ${sealed} sealed from the public; side stated as defense for ${def}, as prosecution for ${pro}. Press Enter to list them.`,
    }
  })
  return { width, height, groups, narrow }
}
