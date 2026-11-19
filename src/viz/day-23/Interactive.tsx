'use client'
// Day 23 interaction: "Show as a table" swaps the grids for the same figures as a table;
// "Fill the grids again" replays the fill (never under quiet mode or reduced motion).
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useQuietMotion } from '@/lib/viz/motion'
import styles from './day23.module.css'

export function WaffleStage({ grids, table }: { grids: ReactNode; table: ReactNode }) {
  const quiet = useQuietMotion()
  const [asTable, setAsTable] = useState(false)
  const [run, setRun] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (quiet || !ref.current || typeof IntersectionObserver === 'undefined') return
    const el = ref.current
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setRun((r) => (r === 0 ? 1 : r))
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [quiet])

  return (
    <div className={styles.stage} data-testid="day23-waffle">
      <div className={styles.controls}>
        <button type="button" className="btn" aria-pressed={asTable} onClick={() => setAsTable((v) => !v)}>
          {asTable ? 'Show as grids' : 'Show as a table'}
        </button>
        {!quiet && !asTable ? (
          <button type="button" className="btn" onClick={() => setRun((r) => r + 1)}>
            Fill the grids again
          </button>
        ) : null}
      </div>
      <div ref={ref} key={run} className={`${styles.grids} ${run > 0 && !quiet ? styles.play : ''}`} hidden={asTable}>
        {grids}
      </div>
      {asTable ? table : null}
    </div>
  )
}
