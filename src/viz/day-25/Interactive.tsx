'use client'
// Day 25 interaction: select a block (click, or Tab then arrows and Enter) to list its exhibits with day links;
// the side buttons highlight exhibits by who the coverage says presented them.
import { useState, type ReactNode } from 'react'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import { SIDE_WORDS, type Side } from './select'
import type { TreemapGeometry } from './treemap'
import styles from './day25.module.css'

const SIDE_FILL: Record<Side, string> = {
  prosecution: 'var(--prosecution)',
  defense: 'var(--defense)',
  unstated: 'var(--rule-paper)',
}


function TileMap({ g, id, filter, selected, onSelect, roving }: {
  g: TreemapGeometry
  id: string
  filter: Side | 'all'
  selected: number | null
  onSelect: (i: number) => void
  roving: ReturnType<typeof useRovingFocus>
}) {
  const { fontSize, stroke, dot } = layout
  const hatch = `exhibit-hatch-${id}`
  const p = dot + 1
  return (
    <svg
      className={g.narrow ? styles.narrow : styles.wide}
      viewBox={`0 0 ${g.width} ${g.height}`}
      role="group"
      aria-label="Exhibits by kind. Use arrow keys to move between blocks; Enter lists the exhibits."
      onKeyDown={roving.onKeyDown}
    >
      <defs>
        <pattern id={hatch} width={p} height={p} patternUnits="userSpaceOnUse">
          <path d={`M0 ${p} L${p} 0`} stroke="var(--ink)" strokeWidth={stroke.mark} />
        </pattern>
      </defs>
      {g.groups.map((gr, i) => (
        <g
          key={gr.kind}
          role="button"
          aria-label={gr.aria}
          aria-pressed={selected === i}
          tabIndex={roving.tabIndexFor(i)}
          data-roving-index={i}
          className={styles.group}
          onClick={() => { roving.setActive(i); onSelect(i) }}
        >
          <rect x={gr.x} y={gr.y} width={gr.w} height={gr.h} className={selected === i ? styles.groupBoxOn : styles.groupBox} />
          {gr.tiles.map((t) => {
            const dim = filter !== 'all' && t.side !== filter
            return (
              <g key={t.id} opacity={dim ? 1 / (2 * 2) : 1}>
                <rect x={t.x} y={t.y} width={t.w} height={t.h} fill={SIDE_FILL[t.side]} />
                {t.sealed ? <rect x={t.x} y={t.y} width={t.w} height={t.h} fill={`url(#${hatch})`} /> : null}
                {t.today ? <rect x={t.x + 1} y={t.y + 1} width={Math.max(t.w - 2, 1)} height={Math.max(t.h - 2, 1)} className={styles.today} /> : null}
              </g>
            )
          })}
          <text x={gr.x + stroke.emphasis + 1} y={gr.y + fontSize.label + 1} fontSize={gr.w > layout.tap * (2 + 1) ? fontSize.label : fontSize.small} className={styles.groupLabel}>
            {gr.w > layout.tap * (2 + 1) ? `${gr.label} ${gr.count}` : `${gr.count}`}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function TreemapInteractive({ wide, narrow, lists, legend }: {
  wide: TreemapGeometry
  narrow: TreemapGeometry
  lists: ReactNode[]
  legend: ReactNode
}) {
  const [filter, setFilter] = useState<Side | 'all'>('all')
  const [selected, setSelected] = useState<number | null>(null)
  const roving = useRovingFocus(wide.groups.length, { onSelect: (i) => setSelected(i), onExit: () => setSelected(null) })
  const narrowRoving = useRovingFocus(narrow.groups.length, { onSelect: (i) => setSelected(narrow.groups[i] ? wide.groups.findIndex((g) => g.kind === narrow.groups[i].kind) : null), onExit: () => setSelected(null) })
  const narrowSelected = selected === null ? null : narrow.groups.findIndex((g) => g.kind === wide.groups[selected]?.kind)
  return (
    <div className={styles.root} data-testid="day25-treemap">
      {legend}
      <div className={styles.filters} role="group" aria-label="Highlight exhibits by side">
        {(['all', 'prosecution', 'defense', 'unstated'] as const).map((s) => (
          <button key={s} type="button" className="btn" aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {SIDE_WORDS[s]}
          </button>
        ))}
      </div>
      <TileMap g={wide} id="w" filter={filter} selected={selected} onSelect={setSelected} roving={roving} />
      <TileMap
        g={narrow}
        id="n"
        filter={filter}
        selected={narrowSelected}
        onSelect={(i) => setSelected(wide.groups.findIndex((g) => g.kind === narrow.groups[i]?.kind))}
        roving={narrowRoving}
      />
      <ul className={styles.kinds} aria-label="Blocks by kind">
        {wide.groups.map((g, i) => (
          <li key={g.kind}>
            <button type="button" className={styles.kindBtn} aria-pressed={selected === i} onClick={() => setSelected(selected === i ? null : i)}>
              {g.label} <span className="num">{g.count}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.detail} aria-live="polite">
        {selected === null ? (
          <p className={styles.hint}>Select a block to list its exhibits, each with a link to its day.</p>
        ) : (
          <>
            {lists[selected]}
            <button type="button" className="btn" onClick={() => setSelected(null)}>Close list</button>
          </>
        )}
      </div>
    </div>
  )
}
