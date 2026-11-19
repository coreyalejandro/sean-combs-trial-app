// Day 15 geometry: the Sankey layout, computed at build time with d3-sankey (no D3 in the browser).
// Wide screens flow left to right; phones flow top to bottom (the same layout, axes swapped).
import { sankey, sankeyLeft, type SankeyLink, type SankeyNode } from 'd3-sankey'
import { layout } from '@/lib/viz/layout'
import type { Day15Selection, NodeId } from './select'
import type { Level } from './kit/sources'

export interface NodeGeo { id: NodeId; x0: number; y0: number; x1: number; y1: number; depth: number }
export interface LinkGeo { id: string; source: NodeId; target: NodeId; d: string; width: number; level: Level; money: boolean }
export interface FlowGeo { width: number; height: number; vertical: boolean; nodes: NodeGeo[]; links: LinkGeo[]; maxDepth: number }

type N = { id: NodeId }
type L = { source: NodeId; target: NodeId; value: number; level: Level; money: boolean }

/** A band's centre line: a smooth S from the source edge to the target edge. */
function bandPath(sx: number, sy: number, tx: number, ty: number, vertical: boolean): string {
  const mid = (sx + tx) / 2
  if (!vertical) return `M${sx},${sy}C${mid},${sy} ${mid},${ty} ${tx},${ty}`
  // vertical: "x" is depth (drawn as y), "y" is breadth (drawn as x)
  return `M${sy},${sx}C${sy},${mid} ${ty},${mid} ${ty},${tx}`
}

export function flowLayout(sel: Day15Selection, opts: { width: number; height: number; vertical: boolean; onlyConfirmed: boolean }): FlowGeo {
  const { width, height, vertical, onlyConfirmed } = opts
  const keep = (id: NodeId) => {
    const n = sel.nodes.find((x) => x.id === id)
    return !!n && (!onlyConfirmed || n.confirmed || id === 'rest')
  }
  const nodes: N[] = sel.nodes.filter((n) => n.id !== 'nda' && keep(n.id)).map((n) => ({ id: n.id }))
  const links: L[] = sel.links
    .filter((l) => keep(l.source) && keep(l.target) && (!onlyConfirmed || l.confirmed || l.target === 'rest'))
    .map((l) => ({ source: l.source, target: l.target, value: l.value, level: l.level, money: true }))
  // Depth runs along the flow (x when wide, y on phones); breadth across it.
  const depth = vertical ? height : width
  const breadth = vertical ? width : height
  const padStart = layout.margin.top * 2
  const padEnd = vertical ? layout.margin.bottom : layout.margin.right
  const order = nodes.map((n) => n.id)
  const generator = sankey<N, L>()
    .nodeId((d) => d.id)
    .nodeAlign(sankeyLeft)
    .nodeWidth(layout.gap)
    .nodePadding(vertical ? layout.gap * 2 : layout.margin.top * 2)
    .nodeSort(() => 0)
    .linkSort((a, b) => {
      const at = order.indexOf((a.target as SankeyNode<N, L>).id) - order.indexOf((b.target as SankeyNode<N, L>).id)
      return at !== 0 ? at : order.indexOf((a.source as SankeyNode<N, L>).id) - order.indexOf((b.source as SankeyNode<N, L>).id)
    })
    .extent([
      [vertical ? padStart : layout.margin.left / 2, vertical ? layout.margin.left / 2 : padStart],
      [depth - padEnd, breadth - (vertical ? layout.margin.left / 2 : layout.margin.bottom)],
    ])
  const graph = generator({ nodes: nodes.map((d) => ({ ...d })), links: links.map((d) => ({ ...d })) })

  const geoNodes: NodeGeo[] = (graph.nodes as Array<SankeyNode<N, L>>).map((n) => {
    const x0 = n.x0 ?? 0
    const x1 = n.x1 ?? 0
    const y0 = n.y0 ?? 0
    const y1 = n.y1 ?? 0
    return vertical ? { id: n.id, x0: y0, x1: y1, y0: x0, y1: x1, depth: n.depth ?? 0 } : { id: n.id, x0, x1, y0, y1, depth: n.depth ?? 0 }
  })
  const geoLinks: LinkGeo[] = (graph.links as Array<SankeyLink<N, L>>).map((l) => {
    const s = l.source as SankeyNode<N, L>
    const t = l.target as SankeyNode<N, L>
    return {
      id: `${s.id}-${t.id}`,
      source: s.id,
      target: t.id,
      d: bandPath(s.x1 ?? 0, l.y0 ?? 0, t.x0 ?? 0, l.y1 ?? 0, vertical),
      width: Math.max(l.width ?? 0, layout.stroke.hairline),
      level: l.level,
      money: l.money,
    }
  })
  // The NDA is not money: a small document set just past Garcia's share, joined by a dashed hairline.
  const g = geoNodes.find((n) => n.id === 'garcia')
  const ndaNode = sel.nodes.find((n) => n.id === 'nda')
  if (g && ndaNode && keep('nda')) {
    const w = layout.gap
    const h = layout.gap * 2
    const x0 = vertical ? g.x0 : g.x1 + layout.tap * 2
    const y0 = vertical ? g.y1 + layout.tap : (g.y0 + g.y1) / 2 - h / 2
    geoNodes.push({ id: 'nda', x0, x1: x0 + w, y0, y1: y0 + h, depth: g.depth + 1 })
    const d = vertical
      ? `M${(g.x0 + g.x1) / 2},${g.y1}L${(g.x0 + g.x1) / 2},${y0 + h / 2}L${x0},${y0 + h / 2}`
      : `M${g.x1},${(g.y0 + g.y1) / 2}L${x0},${(g.y0 + g.y1) / 2}`
    geoLinks.push({ id: 'garcia-nda', source: 'garcia', target: 'nda', d, width: layout.stroke.mark, level: ndaNode.level, money: false })
  }
  const money = geoNodes.filter((n) => n.id !== 'nda')
  return { width, height, vertical, nodes: geoNodes, links: geoLinks, maxDepth: Math.max(...money.map((n) => n.depth)) }
}
