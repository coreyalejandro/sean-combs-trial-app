'use client'
// Day 22 interaction: select a bar (click, tap, or Tab then arrow keys and Enter) to read that session's
// times, who was asking, and the topics the record lists. Escape closes the detail.
import { useState, type ReactNode } from 'react'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import type { GanttGeometry } from './geometry'
import styles from './day22.module.css'

const FILL: Record<string, string> = {
  direct: 'var(--prosecution)',
  redirect: 'var(--prosecution)',
  cross: 'var(--defense)',
  're-cross': 'var(--defense)',
  closed: 'var(--neutral)',
}

function Chart({ g, id, selected, tabIndexFor, onKeyDown, onSelect }: {
  g: GanttGeometry
  id: string
  active: number
  selected: number | null
  tabIndexFor: (i: number) => number
  onKeyDown: (e: React.KeyboardEvent<Element>) => void
  onSelect: (i: number) => void
}) {
  const { fontSize, stroke, dashUnconfirmed, dot } = layout
  const hatch = `hatch-${id}`
  const hatchOpen = `hatch-open-${id}`
  return (
    <svg
      className={g.narrow ? styles.narrow : styles.wide}
      viewBox={`0 0 ${g.width} ${g.height}`}
      role="group"
      aria-label="Jane's testimony, one row per court day, along the clock. Use arrow keys to move between sessions; Enter shows details."
      onKeyDown={onKeyDown}
    >
      <defs>
        <pattern id={hatch} width={dot + 1} height={dot + 1} patternUnits="userSpaceOnUse">
          <rect width={dot + 1} height={dot + 1} fill="var(--paper)" />
          <path d={`M0 ${dot + 1} L${dot + 1} 0`} stroke="currentColor" strokeWidth={stroke.mark} />
        </pattern>
        <pattern id={hatchOpen} width={dot + 1} height={dot + 1} patternUnits="userSpaceOnUse">
          <path d={`M0 0 L${dot + 1} ${dot + 1}`} stroke="var(--rule-paper)" strokeWidth={stroke.mark} />
        </pattern>
      </defs>
      <g aria-hidden="true" className={styles.axis}>
        {g.ticks.map((t) => (
          <g key={t.label} transform={`translate(${t.x},0)`}>
            <line y1={g.axisY + 2} y2={g.plotBottom} stroke="var(--rule-paper)" strokeWidth={stroke.hairline} />
            <text y={g.axisY} textAnchor="middle" fontSize={fontSize.small}>{t.label}</text>
          </g>
        ))}
      </g>
      {g.narrow ? null : (
        <text x={g.durationHeadX} y={g.durationHeadY} textAnchor="end" fontSize={fontSize.small} className={styles.duration}>
          time questioned (calculated)
        </text>
      )}
      {g.rows.map((r) => (
        <g key={r.row}>
          <text x={r.labelX} y={r.labelY} dominantBaseline={g.narrow ? 'auto' : 'middle'} fontSize={fontSize.label} className={styles.rowLabel}>
            <tspan fontWeight="bold">{r.dayLabel}</tspan>
            <tspan dx={layout.dot}>{r.dateLabel}</tspan>
          </text>
          <text
            x={r.durationX}
            y={r.durationY}
            textAnchor="end"
            dominantBaseline={g.narrow ? 'auto' : 'middle'}
            fontSize={fontSize.small}
            className={styles.duration}
            data-source-ids={r.sourceIds}
          >
            {r.durationText}
            {r.calculated && g.narrow ? ' (calc.)' : ''}
          </text>
        </g>
      ))}
      {g.bars.map((b, i) => {
        const isSel = selected === i
        const hatched = b.exam === 'redirect' || b.exam === 're-cross' || b.exam === 'closed'
        const color = FILL[b.exam]
        return (
          <g
            key={b.key}
            role="button"
            aria-pressed={isSel}
            aria-label={b.aria}
            data-roving-index={i}
            data-source-ids={b.sourceIds}
            tabIndex={tabIndexFor(i)}
            className={styles.bar}
            onClick={() => onSelect(i)}
            style={{ color }}
          >
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              fill={b.notReported ? `url(#${hatchOpen})` : hatched ? `url(#${hatch})` : color}
              stroke={isSel ? 'var(--ink)' : b.approximate ? color : 'none'}
              strokeWidth={isSel ? stroke.emphasis : stroke.mark}
              strokeDasharray={b.approximate && !isSel ? dashUnconfirmed : undefined}
            />
            {b.w > b.label.length * layout.fontSize.small * (1 / 2 + 1 / (2 * 2)) ? (
              <text x={b.x + layout.dot} y={b.y + b.h / 2} dominantBaseline="middle" fontSize={fontSize.small} className={b.notReported || hatched ? styles.inkLabel : styles.barLabel}>
                {b.label}
              </text>
            ) : null}
          </g>
        )
      })}
      {g.gaps.map((gp) => (
        <g key={gp.key} aria-hidden="true">
          <rect x={gp.x} y={gp.y - 1} width={gp.w} height={gp.h + 2} fill="var(--paper)" />
          <line x1={gp.x} x2={gp.x + gp.w} y1={gp.y + gp.h / 2} y2={gp.y + gp.h / 2} stroke="var(--muted-ink)" strokeWidth={stroke.hairline} strokeDasharray={dashUnconfirmed} />
          {gp.w > layout.tap ? (
            <text x={gp.x + gp.w / 2} y={gp.y + gp.h / 2 - layout.dot} textAnchor="middle" fontSize={fontSize.small} className={styles.mutedLabel}>{gp.label}</text>
          ) : null}
        </g>
      ))}
      {g.ticksBack.map((t) => (
        <g key={t.key} aria-hidden="true">
          <line x1={t.x} x2={t.x} y1={t.y - 2} y2={t.y + t.h + 2} stroke="var(--paper)" strokeWidth={stroke.emphasis} />
          <line x1={t.x} x2={t.x} y1={t.y - 2} y2={t.y + t.h + 2} stroke="var(--ink)" strokeWidth={stroke.hairline} />
        </g>
      ))}
      {g.endMark ? (
        <g aria-hidden="true">
          <circle cx={g.endMark.x} cy={g.endMark.y} r={dot + 1} fill="var(--red)" stroke="var(--paper)" strokeWidth={stroke.mark} />
        </g>
      ) : null}
    </svg>
  )
}

export function GanttInteractive({ wide, narrow, details, legend }: {
  wide: GanttGeometry
  narrow: GanttGeometry
  details: ReactNode[]
  legend: ReactNode
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const roving = useRovingFocus(wide.bars.length, {
    onSelect: (i) => setSelected(i),
    onExit: () => setSelected(null),
  })
  const props = { active: roving.active, selected, tabIndexFor: roving.tabIndexFor, onKeyDown: roving.onKeyDown, onSelect: (i: number) => { roving.setActive(i); setSelected(i) } }
  return (
    <div className={styles.root} data-testid="day22-gantt">
      {legend}
      <Chart g={wide} id="w" {...props} />
      <Chart g={narrow} id="n" {...props} />
      <div className={styles.detail} aria-live="polite">
        {selected === null ? (
          <p className={styles.hint}>Select a bar to see that session&apos;s times, who was asking and the topics the record lists.</p>
        ) : (
          <>
            {details[selected]}
            <button type="button" className="btn" onClick={() => setSelected(null)}>Close details</button>
          </>
        )}
      </div>
    </div>
  )
}
