// Day 23 waffle geometry: one square = one bottle, the same square size in every grid.
// Each kind of bottle starts on a new row so the two kinds read as two blocks.
import { layout } from '@/lib/viz/layout'
import type { BottleKind, Site } from './select'

export interface WaffleRow {
  y: number
  kind: BottleKind
  d: string
  count: number
}

export interface WaffleBlockLabel {
  kind: BottleKind
  y: number
  count: number
  sourceIds: string
  confidence: string
}

export interface WaffleGrid {
  width: number
  height: number
  cell: number
  rows: WaffleRow[]
  labels: WaffleBlockLabel[]
}

/** Columns shared by every grid in one layout, so equal squares mean equal counts. */
export function waffleColumns(colWidth: number, pitch: number): number {
  return Math.max(1, Math.floor(colWidth / pitch))
}

export function waffle(site: Site, colWidth: number, narrow: boolean): WaffleGrid {
  const pitch = narrow ? layout.dot + 1 : layout.dot + 2
  const cell = pitch - 1
  const cols = waffleColumns(colWidth, pitch)
  const labelH = layout.fontSize.small + layout.dot
  const rows: WaffleRow[] = []
  const labels: WaffleBlockLabel[] = []
  let y = 0
  for (const b of site.bottles) {
    labels.push({ kind: b.kind, y: y + layout.fontSize.small, count: b.count, sourceIds: b.sources.map((s) => s.id).join(' '), confidence: b.confidence })
    y += labelH
    const full = Math.floor(b.count / cols)
    const rest = b.count % cols
    const lines = full + (rest > 0 ? 1 : 0)
    for (let r = 0; r < lines; r += 1) {
      const n = r < full ? cols : rest
      let d = ''
      for (let c = 0; c < n; c += 1) d += `M${c * pitch} ${y}h${cell}v${cell}h-${cell}Z`
      rows.push({ y, kind: b.kind, d, count: n })
      y += pitch
    }
    y += pitch
  }
  return { width: colWidth, height: Math.max(y, labelH), cell, rows, labels }
}
