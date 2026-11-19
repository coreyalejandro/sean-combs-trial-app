'use client'
// Day 11 picture: a chain of evidence. Each step of an investigation is a card, joined by a chain
// link: whole where testimony says the step happened, broken where it says it did not. Under the
// chain, a court lane holds what the judge did with this testimony. Left to right on a wide screen,
// top to bottom on a phone.
import { useState } from 'react'
import { useRovingFocus } from '@/lib/viz/roving'
import { g } from '../day-08/kit/geom'
import { FactMeta, kit } from '../day-08/kit/ui'
import type { SourceBook } from '../day-08/kit/facts'
import type { CourtNote, Step } from './select'
import css from './day11.module.css'

export interface Day11View { steps: Step[]; court: CourtNote[]; stoppedAfter: number; book: SourceBook }

/** A chain link drawn whole or broken; turns to run downwards on phones (CSS rotates the box). */
function Link({ broken }: { broken: boolean }) {
  const w = g.tap
  const h = g.gap + g.half
  const r = h / 2
  const half = w / 2
  return (
    <svg className={css.linkSvg} viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      {broken ? (
        <>
          <rect x={2} y={2} width={half - g.quarter - 2} height={h - 2 - 2} rx={r - 2} fill="none" stroke="var(--muted-ink)" strokeWidth={g.stroke.mark} strokeDasharray={g.dash} />
          <rect x={half + g.quarter} y={2} width={half - g.quarter - 2} height={h - 2 - 2} rx={r - 2} fill="none" stroke="var(--muted-ink)" strokeWidth={g.stroke.mark} strokeDasharray={g.dash} />
          <path d={`M${half - 2} ${h} L${half + 2} 0`} stroke="var(--red)" strokeWidth={g.stroke.emphasis} />
        </>
      ) : (
        <>
          <rect x={2} y={2} width={half + g.quarter} height={h - 2 - 2} rx={r - 2} fill="none" stroke="var(--ink)" strokeWidth={g.stroke.emphasis} />
          <rect x={half - g.quarter - 2} y={2} width={half + g.quarter} height={h - 2 - 2} rx={r - 2} fill="none" stroke="var(--ink)" strokeWidth={g.stroke.emphasis} />
        </>
      )}
    </svg>
  )
}

export function Day11Interactive({ view }: { view: Day11View }) {
  const [sel, setSel] = useState<number | null>(null)
  const roving = useRovingFocus(view.steps.length, { onSelect: (i) => setSel(i), onExit: () => setSel(null) })
  const step = sel !== null ? view.steps[sel] : null
  return (
    <div>
      <ol className={css.chain} aria-label="Investigation steps, in order" onKeyDown={roving.onKeyDown}>
        {view.steps.map((s, i) => {
          const notes = view.court.filter((c) => c.stepId === s.id)
          const brokenBefore = i > 0 && (s.status === 'not-done' || view.steps[i - 1].status === 'not-done')
          return (
            <li key={s.id} className={css.stepItem} data-status={s.status}>
              {i > 0 ? (
                <span className={css.joint} data-broken={brokenBefore}>
                  <Link broken={brokenBefore} />
                  {i === view.stoppedAfter ? <span className={css.stopLabel}>The trail stopped here</span> : null}
                </span>
              ) : null}
              <button
                type="button"
                className={css.card}
                data-roving-index={i}
                tabIndex={roving.tabIndexFor(i)}
                aria-pressed={sel === i}
                onClick={() => setSel(sel === i ? null : i)}
                onFocus={() => roving.setActive(i)}
              >
                <span className={css.stepNo}>Step {i + 1}</span>
                <span className={css.stepTitle}>{s.title}</span>
                <span className={css.stamp}>{s.status === 'done' ? 'Happened' : 'Did not happen'}</span>
                <span className={css.stepSummary}>{s.summary}</span>
              </button>
              {notes.length > 0 && (
                <ul className={css.court} aria-label={`In court, about ${s.title.toLowerCase()}`}>
                  {notes.map((c) => (
                    <li key={c.fact.key}>
                      <span className={css.courtTag}>In court</span> {c.text} <FactMeta fact={c.fact} book={view.book} compact />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
      <div className={kit.legendRow} aria-hidden="true">
        <span><Link broken={false} /> whole link: testimony says the step happened</span>
        <span><Link broken /> broken link: testimony says it did not</span>
      </div>
      <div className={kit.panel} aria-live="polite">
        {step ? (
          <>
            <p className={kit.kicker}>Step {(sel ?? 0) + 1} · {step.status === 'done' ? 'Happened' : 'Did not happen'}</p>
            <h3>{step.title}</h3>
            <ul>
              {step.evidence.map((e) => (
                <li key={e.fact.key}><strong>{e.who}:</strong> {e.said} <FactMeta fact={e.fact} book={view.book} /></li>
              ))}
            </ul>
          </>
        ) : (
          <p className={kit.panelHint}>Select a step (or Tab to the chain, then use the arrow keys and Enter) to read what each witness said about it and where it was reported.</p>
        )}
      </div>
    </div>
  )
}
