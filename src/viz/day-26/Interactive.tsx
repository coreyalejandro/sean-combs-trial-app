'use client'
// Day 26 interaction: select a person, task or director (click, or Tab then arrows and Enter) to light up
// their links and read the record behind each one. On phones the same links are a person-by-task grid.
import { useState, type ReactNode } from 'react'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import type { HiveGeometry } from './hive'
import styles from './day26.module.css'

/** Task nodes sit closer together along their slanted axis, so their hit areas are shorter. */
const hitH = (axis: string) => (axis === 'tasks' ? layout.fontSize.label + layout.dot + 2 : layout.tap)

export interface MatrixData {
  columns: Array<{ id: string; short: string; label: string }>
  rows: Array<{ id: string; label: string; cells: boolean[]; directedBy: string[] }>
}

function Matrix({ m, selected, onSelect }: { m: MatrixData; selected: string | null; onSelect: (id: string) => void }) {
  // A person-by-task grid built from lists (the page keeps one data table, in the text version).
  return (
    <div className={styles.matrix} style={{ '--cols': m.columns.length } as React.CSSProperties}>
      <div className={styles.mHead}>
        <span className={styles.mCorner}>Task</span>
        {m.columns.map((c) => (
          <button key={c.id} type="button" className={styles.colBtn} aria-pressed={selected === c.id} aria-label={`Task: ${c.label}`} onClick={() => onSelect(c.id)}>
            {c.short}
          </button>
        ))}
      </div>
      <ul className={styles.mRows} aria-label="Who said they did each task">
        {m.rows.map((r) => {
          const did = m.columns.filter((_, i) => r.cells[i]).map((c) => c.label)
          return (
            <li key={r.id} className={`${styles.mRow} ${selected === r.id ? styles.rowOn : ''}`}>
              <span className={styles.mName}>
                <button type="button" className={styles.rowBtn} aria-pressed={selected === r.id} onClick={() => onSelect(r.id)}>{r.label}</button>
                {r.directedBy.length > 0 ? <span className={styles.dirBy}>directed: {r.directedBy.join(', ')}</span> : null}
                <span className="visually-hidden">{did.length ? `Tasks: ${did.join('; ')}.` : 'No task from this list.'}</span>
              </span>
              {r.cells.map((on, i) => (
                <span key={m.columns[i].id} className={on ? styles.cellOn : styles.cell} aria-hidden="true">{on ? '●' : ''}</span>
              ))}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function HiveInteractive({ g, details, matrix }: { g: HiveGeometry; details: Record<string, ReactNode>; matrix: MatrixData }) {
  const [selected, setSelected] = useState<string | null>(null)
  const roving = useRovingFocus(g.nodes.length, {
    onSelect: (i) => setSelected(g.nodes[i]?.id ?? null),
    onExit: () => setSelected(null),
  })
  const lit = (from: string, to: string) => selected !== null && (from === selected || to === selected)
  const { fontSize, stroke, dot, dashUnconfirmed } = layout
  return (
    <div className={styles.root} data-testid="day26-hive">
      <svg className={styles.hive} viewBox={`0 0 ${g.width} ${g.height}`} role="group" aria-label="Hive plot of people, tasks and who directed them. Use arrow keys to move between names; Enter shows their links." onKeyDown={roving.onKeyDown}>
        {g.axes.map((a) => (
          <g key={a.axis} aria-hidden="true">
            <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} className={styles.axis} />
            <text x={a.lx} y={a.ly} textAnchor={a.anchor} fontSize={fontSize.label} className={styles.axisLabel}>{a.label}</text>
          </g>
        ))}
        <g aria-hidden="true">
          {g.links.map((l) => (
            <path
              key={l.key}
              d={l.d}
              className={`${l.kind === 'did' ? styles.linkDid : styles.linkDir} ${selected === null ? '' : lit(l.from, l.to) ? styles.on : styles.off}`}
              strokeDasharray={l.kind === 'did' ? undefined : dashUnconfirmed}
            />
          ))}
        </g>
        {g.nodes.map((n, i) => (
          <g
            key={n.id}
            role="button"
            aria-pressed={selected === n.id}
            aria-label={`${n.label}: ${n.degree} ${n.degree === 1 ? 'link' : 'links'} in the record.`}
            tabIndex={roving.tabIndexFor(i)}
            data-roving-index={i}
            className={styles.node}
            onClick={() => { roving.setActive(i); setSelected(selected === n.id ? null : n.id) }}
          >
            <rect x={n.anchor === 'end' ? n.lx - layout.chartWidth / (2 + 2) : n.x - dot * 2} y={n.y - hitH(n.axis) / 2} width={layout.chartWidth / (2 + 2) + dot * (2 + 2)} height={hitH(n.axis)} className={styles.hit} />
            {n.axis === 'tasks' ? (
              <path d={`M${n.x} ${n.y - dot - 1} L${n.x + dot + 1} ${n.y} L${n.x} ${n.y + dot + 1} L${n.x - dot - 1} ${n.y} Z`} className={n.degree ? styles.task : styles.empty} />
            ) : (
              <circle cx={n.x} cy={n.y} r={n.axis === 'directors' ? dot + 2 : dot + 1} className={n.axis === 'directors' ? styles.director : n.degree ? styles.person : styles.empty} strokeWidth={stroke.mark} />
            )}
            <text x={n.lx} y={n.ly} textAnchor={n.anchor} fontSize={n.axis === 'directors' ? fontSize.value : fontSize.label} className={selected === n.id ? styles.labelOn : styles.label}>
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className={styles.matrixWrap}><Matrix m={matrix} selected={selected} onSelect={(id) => setSelected(selected === id ? null : id)} /></div>
      <div className={styles.detail} aria-live="polite">
        {selected === null ? <p className={styles.hint}>Select a name or a task to see the record behind each link.</p> : (
          <>
            {details[selected]}
            <button type="button" className="btn" onClick={() => setSelected(null)}>Close</button>
          </>
        )}
      </div>
    </div>
  )
}
