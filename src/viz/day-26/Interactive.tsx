'use client'
// Day 26 interaction: a person-by-task grid at every width. Select a person or a task to read the reported words
// behind each link.
import { useState, type ReactNode } from 'react'
import styles from './day26.module.css'

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
                {r.directedBy.length > 0 ? <span className={styles.dirBy}>instructions from, as testified: {r.directedBy.join(', ')}</span> : null}
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

export function HiveInteractive({ details, matrix }: { details: Record<string, ReactNode>; matrix: MatrixData }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className={styles.root} data-testid="day26-hive">
      <div className={styles.matrixWrap}><Matrix m={matrix} selected={selected} onSelect={(id) => setSelected(selected === id ? null : id)} /></div>
      <div className={styles.detail} aria-live="polite">
        {selected === null ? <p className={styles.hint}>Select a name or a task to read the reported words behind each link.</p> : (
          <>
            {details[selected]}
            <button type="button" className="btn" onClick={() => setSelected(null)}>Close</button>
          </>
        )}
      </div>
    </div>
  )
}
