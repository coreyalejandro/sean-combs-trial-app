'use client'
// Day 28 interaction: select a star (click, or Tab then arrows and Enter) for a one-line card with links to
// that witness's days; filter the sky by role. Pseudonymous witnesses show only their pseudonym.
import { useState, type ReactNode } from 'react'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import type { SkyGeometry } from './sky'
import styles from './day28.module.css'

function Sky({ g, filter, selected, onSelect, roving, id }: {
  g: SkyGeometry
  filter: string | null
  selected: string | null
  onSelect: (i: number) => void
  roving: ReturnType<typeof useRovingFocus>
  id: string
}) {
  const { fontSize, stroke } = layout
  const glow = `glow-${id}`
  return (
    <svg className={g.narrow ? styles.narrow : styles.wide} viewBox={`0 0 ${g.width} ${g.height}`} role="group" aria-label="Constellation of the prosecution's witnesses. Use arrow keys to move between stars; Enter opens a card." onKeyDown={roving.onKeyDown}>
      <defs>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="var(--paper)" stopOpacity={1 / 2} />
          <stop offset="1" stopColor="var(--paper)" stopOpacity={0} />
        </radialGradient>
      </defs>
      {g.bands.map((b) => (
        <g key={b.group} aria-hidden="true">
          <line x1={0} x2={g.width} y1={b.y} y2={b.y} className={styles.band} />
          <text x={layout.margin.right / 2} y={b.y - (g.narrow ? layout.gap - 2 : layout.dot)} fontSize={fontSize.small} className={filter && filter !== b.group ? styles.bandLabelOff : styles.bandLabel}>{b.label}</text>
        </g>
      ))}
      {g.lines.map((l) => (
        <path key={l.key} d={l.d} className={styles.line} aria-hidden="true" />
      ))}
      {g.ticks.map((t) => (
        <text key={t.label} x={t.x} y={g.axisY} textAnchor="middle" fontSize={fontSize.small} className={styles.tick} aria-hidden="true">{t.label}</text>
      ))}
      {g.stars.map((s, i) => {
        const dim = filter !== null && filter !== s.group
        const on = selected === s.id
        return (
          <g
            key={s.id}
            role="button"
            aria-label={s.aria}
            aria-pressed={on}
            tabIndex={roving.tabIndexFor(i)}
            data-roving-index={i}
            className={styles.star}
            opacity={dim ? 1 / (2 + 2) : 1}
            onClick={() => onSelect(i)}
          >
            <circle cx={s.x} cy={s.y} r={s.r * (2 + 1)} fill={`url(#${glow})`} className={styles.glow} />
            <circle cx={s.x} cy={s.y} r={s.r} className={on ? styles.coreOn : styles.core} strokeWidth={on ? stroke.emphasis : 0} />
            <circle cx={s.x} cy={s.y} r={layout.dot + 2 + 1} className={styles.hit} />
          </g>
        )
      })}
    </svg>
  )
}

export function SkyInteractive({ wide, narrow, cards, groups, defense }: {
  wide: SkyGeometry
  narrow: SkyGeometry
  cards: ReactNode[]
  groups: Array<{ id: string; label: string; count: number }>
  defense: ReactNode
}) {
  const [filter, setFilter] = useState<string | null>(null)
  const [sel, setSel] = useState<number | null>(null)
  const roving = useRovingFocus(wide.stars.length, { onSelect: (i) => setSel(i), onExit: () => setSel(null) })
  const pick = (i: number) => { roving.setActive(i); setSel(sel === i ? null : i) }
  const selectedId = sel === null ? null : wide.stars[sel]?.id ?? null
  return (
    <div className={styles.root} data-testid="day28-sky">
      <div className={styles.filters} role="group" aria-label="Show one role">
        <button type="button" className={styles.fbtn} aria-pressed={filter === null} onClick={() => setFilter(null)}>All roles</button>
        {groups.map((g) => (
          <button key={g.id} type="button" className={styles.fbtn} aria-pressed={filter === g.id} onClick={() => setFilter(filter === g.id ? null : g.id)}>
            {g.label} <span className="num">{g.count}</span>
          </button>
        ))}
      </div>
      <div className={styles.skies}>
        <div className={styles.prosecution}>
          <p className={styles.sideHead}>Prosecution</p>
          <Sky g={wide} id="w" filter={filter} selected={selectedId} onSelect={pick} roving={roving} />
          <Sky g={narrow} id="n" filter={filter} selected={selectedId} onSelect={pick} roving={roving} />
        </div>
        <div className={styles.defense}>{defense}</div>
      </div>
      <div className={styles.card} aria-live="polite">
        {sel === null ? <p className={styles.hint}>Select a star for a one-line card about that witness.</p> : (
          <>
            {cards[sel]}
            <button type="button" className="btn" onClick={() => setSel(null)}>Close card</button>
          </>
        )}
      </div>
    </div>
  )
}
