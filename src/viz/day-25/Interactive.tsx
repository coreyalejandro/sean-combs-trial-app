'use client'
// Day 25 interaction: one bar per kind of evidence (review, Nov 2026: a bar per kind says more than a treemap
// whose tiles carried no labels). Select a bar (click, or Tab then arrows and Enter) to list its exhibits with
// day links. The sealed part of each bar is hatched. The static HTML shows every bar.
import { useState, type ReactNode } from 'react'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import styles from './day25.module.css'

export interface BarRow {
  kind: string
  label: string
  count: number
  sealed: number
  /** Exhibits of this kind named on this page's day. */
  today: number
}

/** The bar's drawing width: the chart width in SVG units (scaled to the row by CSS). */
const W = layout.chartWidth
const H = layout.gap

export function BarsInteractive({ rows, lists, legend, dayLabel }: { rows: BarRow[]; lists: ReactNode[]; legend: ReactNode; dayLabel: string }) {
  const [selected, setSelected] = useState<number | null>(null)
  const roving = useRovingFocus(rows.length, { onSelect: (i) => setSelected(i), onExit: () => setSelected(null) })
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div className={styles.root} data-testid="day25-bars">
      {legend}
      <ol className={styles.bars} onKeyDown={roving.onKeyDown} aria-label="Exhibits by kind. Use the arrow keys to move between kinds; Enter lists the exhibits.">
        {rows.map((r, i) => (
          <li key={r.kind} className={styles.barRow}>
            <button
              type="button"
              className={styles.kindBtn}
              aria-pressed={selected === i}
              data-roving-index={i}
              tabIndex={roving.tabIndexFor(i)}
              onClick={() => { roving.setActive(i); setSelected(selected === i ? null : i) }}
              onFocus={() => roving.setActive(i)}
            >
              <span className={styles.kindName}>{r.label}</span>
              <span className={styles.kindNums}>
                <span className="num">{r.count}</span>
                {r.sealed > 0 ? <span className={styles.sealedNote}>, {r.sealed} sealed</span> : null}
                {r.today > 0 ? <span className={styles.todayNote}>, {r.today} on {dayLabel}</span> : null}
              </span>
            </button>
            <svg className={styles.bar} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <defs>
                <pattern id={`hatch-${r.kind}`} width={layout.dot} height={layout.dot} patternUnits="userSpaceOnUse">
                  <rect width={layout.dot} height={layout.dot} fill="var(--paper)" />
                  <path d={`M0 ${layout.dot} L${layout.dot} 0`} stroke="var(--ink)" strokeWidth={layout.stroke.mark} />
                </pattern>
              </defs>
              <rect x={0} y={0} width={(r.count / max) * W} height={H} fill="var(--ink)" />
              {r.sealed > 0 ? <rect x={0} y={0} width={(r.sealed / max) * W} height={H} fill={`url(#hatch-${r.kind})`} stroke="var(--ink)" strokeWidth={layout.stroke.hairline} /> : null}
            </svg>
          </li>
        ))}
      </ol>
      <div className={styles.detail} aria-live="polite">
        {selected === null ? (
          <p className={styles.hint}>Select a kind to list its exhibits, each with a link to its day.</p>
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
