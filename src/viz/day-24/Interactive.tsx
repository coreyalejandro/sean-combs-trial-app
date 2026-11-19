'use client'
// Day 24 interaction: step or scrub through the reported jury events; the box redraws for each.
// "Play" steps through them on a timer (never under quiet mode or reduced motion).
import { useEffect, useState, type ReactNode } from 'react'
import { layout } from '@/lib/viz/layout'
import { useQuiet as useQuietMotion } from '@/viz/day-22/useQuiet'
import styles from './day24.module.css'

export interface SeatFrame {
  seat: 'seated' | 'at-issue' | 'removal-announced' | 'replaced'
  alternates: number
  unnamed: boolean
  label: string
  date: string
}

const SEAT_WORDS: Record<SeatFrame['seat'], string> = {
  seated: 'seated',
  'at-issue': 'removal requested',
  'removal-announced': 'removal announced',
  replaced: 'replaced by an alternate',
}

export function JuryBox({ jurors, alternatesStart, seat, frame }: {
  jurors: number
  alternatesStart: number
  seat: number | null
  frame: SeatFrame
  seatNote: string
}) {
  const { gap, margin, fontSize, stroke, dashUnconfirmed, phoneWidth, tap } = layout
  const W = phoneWidth
  const perRow = Math.ceil(jurors / 2)
  const seatW = (W - margin.right * 2 - (perRow - 1) * (gap / 2)) / perRow
  const seatH = tap
  const top = margin.top + fontSize.label
  const rowY = (r: number) => top + r * (seatH + gap / 2)
  const altTop = rowY(2) + gap * 2 + fontSize.label
  const altW = (W - margin.right * 2 - (alternatesStart - 1) * (gap / 2)) / Math.max(alternatesStart, 1)
  const H = altTop + seatH + gap / 2
  const seatX = (i: number) => margin.right + (i % perRow) * (seatW + gap / 2)
  const changed = frame.seat !== 'seated'
  return (
    <svg className={styles.box} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Jury box on ${frame.date}: ${jurors} juror seats, Juror ${seat ?? ''} ${SEAT_WORDS[frame.seat]}; ${frame.alternates} of ${alternatesStart} alternates remain.${frame.unnamed ? ' A juror whose seat was not reported is in the news this day.' : ''}`}>
      <text x={margin.right} y={margin.top} fontSize={fontSize.label} className={styles.boxHead}>The jury box</text>
      <rect x={margin.right / 2} y={top - gap / 2} width={W - margin.right} height={rowY(2) - top + gap / 2} rx={stroke.emphasis} className={frame.unnamed ? styles.railAlert : styles.rail} />
      {Array.from({ length: jurors }, (_, i) => {
        const n = i + 1
        const r = i < perRow ? 1 : 0 // front row seats 1..perRow drawn lower, back row above
        const isSeat = seat === n
        const cls = isSeat && changed ? styles[`seat_${frame.seat.replace(/-/g, '_')}`] : styles.seat
        return (
          <g key={n}>
            <rect x={seatX(i)} y={rowY(r)} width={seatW} height={seatH} rx={stroke.emphasis * 2} className={cls}
              strokeDasharray={isSeat && frame.seat === 'at-issue' ? dashUnconfirmed : undefined} />
            <text x={seatX(i) + seatW / 2} y={rowY(r) + seatH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize.value}
              className={isSeat && (frame.seat === 'replaced' || frame.seat === 'removal-announced') ? styles.seatNumOn : styles.seatNum}>
              {n}
            </text>
          </g>
        )
      })}
      <text x={margin.right} y={altTop - gap / 2} fontSize={fontSize.label} className={styles.boxHead}>
        Alternates ({frame.alternates} of {alternatesStart})
      </text>
      {Array.from({ length: alternatesStart }, (_, i) => {
        const filled = i < frame.alternates
        const x = margin.right + i * (altW + gap / 2)
        return (
          <g key={`a${i}`}>
            <rect x={x} y={altTop} width={altW} height={seatH} rx={stroke.emphasis * 2} className={filled ? styles.alt : styles.altEmpty}
              strokeDasharray={filled ? undefined : dashUnconfirmed} />
            <text x={x + altW / 2} y={altTop + seatH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize.small} className={styles.altText}>
              {filled ? 'alt.' : 'empty'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function JuryTracker({ jurors, alternatesStart, seat, frames, items, seatNotes }: {
  jurors: number
  alternatesStart: number
  seat: number | null
  frames: SeatFrame[]
  items: ReactNode[]
  seatNotes: string[]
}) {
  const last = frames.length - 1
  const [i, setI] = useState(last)
  const [playing, setPlaying] = useState(false)
  const quiet = useQuietMotion()
  useEffect(() => {
    if (!playing || quiet) return
    const t = window.setTimeout(() => {
      if (i >= last) setPlaying(false)
      else setI(i + 1)
    }, layout.stepMs * 2)
    return () => window.clearTimeout(t)
  }, [playing, quiet, i, last])
  const frame = frames[i]
  return (
    <div className={styles.tracker} data-testid="day24-tracker">
      <div className={styles.stage}>
        <div>
          <JuryBox jurors={jurors} alternatesStart={alternatesStart} seat={seat} frame={frame} seatNote={seatNotes[i]} />
          <p className={frame.seat !== 'seated' ? styles.noteOn : styles.note}>
            {frame.seat !== 'seated'
              ? `Seat ${seat}: ${SEAT_WORDS[frame.seat]}. ${seatNotes[i]}`
              : frame.unnamed
                ? 'A juror whose seat was not reported (the dashed red rail).'
                : 'Seats as sworn in. Who sat in which seat was not reported.'}
          </p>
        </div>
        <div className={styles.now} aria-live="polite">
          <p className={styles.nowDate}>{frame.date}</p>
          {items[i]}
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button" className="btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>Previous change</button>
        <label className={styles.scrub}>
          <span className="visually-hidden">Choose a moment in the trial</span>
          <input
            type="range"
            min={0}
            max={last}
            step={1}
            value={i}
            aria-valuetext={`${frame.date}: ${frame.label}`}
            onChange={(e) => setI(Number(e.target.value))}
          />
        </label>
        <button type="button" className="btn" onClick={() => setI(Math.min(last, i + 1))} disabled={i === last}>Next change</button>
        {!quiet ? (
          <button type="button" className="btn" aria-pressed={playing} onClick={() => { if (i === last) setI(0); setPlaying((p) => !p) }}>
            {playing ? 'Pause' : 'Play in order'}
          </button>
        ) : null}
      </div>
      <ol className={styles.timeline} aria-label="Every reported change, in order">
        {frames.map((f, k) => (
          <li key={`${f.date}-${k}`} aria-current={k === i ? 'step' : undefined} className={k === i ? styles.on : undefined}>
            <button type="button" className={styles.stepBtn} onClick={() => setI(k)}>
              <span className="mono">{f.date}</span> {f.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
