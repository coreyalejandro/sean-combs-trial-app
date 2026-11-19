'use client'
// Day 12 picture: small multiples of 24-hour clocks. Each dial is one former staff member's account;
// the red arc is the hours they testified to working, the thin grey arc a traditional 8-hour day for
// comparison. A figure given per week gets a week dial instead. Under each dial, one block per day
// for the longest stretch without sleep, where one was described. Select a dial for the person's
// own words and the sources.
import { useState } from 'react'
import { arc } from 'd3'
import { useRovingFocus } from '@/lib/viz/roving'
import { g, valueText } from '../day-08/kit/geom'
import { FactMeta, kit, Calc, dayList } from '../day-08/kit/ui'
import type { Fact, SourceBook } from '../day-08/kit/facts'
import { ALL_HOURS, DAYS_PER_WEEK, HOURS_PER_DAY, type Person } from './select'
import css from './day12.module.css'

export interface Day12View { people: Person[]; standardDay: Fact | null; standardWeek: Fact | null; book: SourceBook }

const TAU = Math.PI * 2
const S = g.tap * (2 + 2)
const C = S / 2
const R = C - g.gap

function hourLabel(h: number): string {
  const half = HOURS_PER_DAY / 2
  if (h === 0) return 'midnight'
  if (h === half) return 'noon'
  return `${h % half} ${h < half ? 'a.m.' : 'p.m.'}`
}

function Sector({ from, to, total, inner, outer, level, faint = false }: { from: number; to: number; total: number; inner: number; outer: number; level: Fact['confidence']; faint?: boolean }) {
  const d = arc()({ innerRadius: inner, outerRadius: outer, startAngle: (from / total) * TAU, endAngle: (to / total) * TAU }) ?? ''
  if (faint) return <path d={d} transform={`translate(${C},${C})`} className={css.faint} />
  const cls = level === 'high' ? css.arcSolid : level === 'medium' ? css.arcHollow : css.arcDashed
  return <path d={d} transform={`translate(${C},${C})`} className={cls} />
}

function Dial({ p, view }: { p: Person; view: Day12View }) {
  const week = p.span?.per === 'week'
  const total = week ? HOURS_PER_DAY * DAYS_PER_WEEK : HOURS_PER_DAY
  const ticks = week ? DAYS_PER_WEEK : HOURS_PER_DAY
  const start = p.span?.startHour ?? 0
  const std = week ? view.standardWeek : view.standardDay
  const stdHours = typeof std?.value === 'number' ? std.value : null
  const ring = g.gap - g.quarter
  const quarterDay = HOURS_PER_DAY / (2 + 2)
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className={css.dial} aria-hidden="true">
      <circle cx={C} cy={C} r={R - ring / 2} className={css.track} strokeWidth={ring} />
      {Array.from({ length: ticks }, (_, k) => {
        const a = (k / ticks) * TAU
        const major = week || k % quarterDay === 0
        return <line key={k} x1={C + Math.sin(a) * (R + 2)} y1={C - Math.cos(a) * (R + 2)} x2={C + Math.sin(a) * (R + (major ? g.half : g.quarter))} y2={C - Math.cos(a) * (R + (major ? g.half : g.quarter))} className={css.tick} />
      })}
      {stdHours !== null && p.span ? <Sector from={start} to={start + stdHours} total={total} inner={R - ring - g.half - 2} outer={R - ring - g.quarter} level="high" faint /> : null}
      {p.span ? <Sector from={start} to={start + p.span.hours} total={total} inner={R - ring} outer={R} level={p.span.fact.confidence} /> : null}
      {p.span?.hoursHigh ? <Sector from={start + p.span.hours} to={start + p.span.hoursHigh} total={total} inner={R - ring} outer={R} level="low" /> : null}
      {!week && p.span?.startHour !== null && p.span
        ? [0, 1, 2, 2 + 1].map((q) => {
            const h = q * quarterDay
            const a = (h / HOURS_PER_DAY) * TAU
            return <text key={q} x={C + Math.sin(a) * (R - ring - g.gap - g.half)} y={C - Math.cos(a) * (R - ring - g.gap - g.half) + g.quarter} textAnchor="middle" fontSize={g.font.small - 2} className={css.hourText}>{hourLabel(h)}</text>
          })
        : null}
      {p.always ? <circle cx={C} cy={C} r={R + g.half + 2} className={css.always} /> : null}
      <text x={C} y={C + (p.span?.startHour !== null && p.span && !week ? g.gap : g.half)} textAnchor="middle" className={p.span && !p.span.hoursHigh ? css.big : css.mid}>
        {p.span ? (p.span.hoursHigh ? `${p.span.hours} to ${p.span.hoursHigh}` : `${p.span.hours}`) : 'not stated'}
      </text>
      <text x={C} y={C + (p.span?.startHour !== null && p.span && !week ? g.gap * 2 : g.gap + g.half)} textAnchor="middle" className={css.small}>
        {p.span ? (week ? 'hours a week' : 'hours a day') : 'no hours figure'}
      </text>
    </svg>
  )
}

function Sleep({ p, maxDays }: { p: Person; maxDays: number }) {
  if (!p.sleepDays) return <p className={css.sleepNone}>No stretch without sleep described in coverage</p>
  return (
    <div className={css.sleep}>
      <span className={css.sleepBlocks} aria-hidden="true">
        {Array.from({ length: maxDays }, (_, k) => (
          <span key={k} className={k < p.sleepDays!.days ? css.blockOn : css.blockOff} data-conf={p.sleepDays!.fact.confidence} />
        ))}
      </span>
      <span className={css.sleepText}>{p.sleepDays.days} days without sleep, at the longest</span>
    </div>
  )
}

export function Day12Interactive({ view }: { view: Day12View }) {
  const [sel, setSel] = useState<number | null>(null)
  const roving = useRovingFocus(view.people.length, { onSelect: (i) => setSel(i), onExit: () => setSel(null) })
  const maxDays = Math.max(0, ...view.people.map((p) => p.sleepDays?.days ?? 0))
  const p = sel !== null ? view.people[sel] : null
  return (
    <div>
      <ul className={css.grid} aria-label="Workdays as each person described them" onKeyDown={roving.onKeyDown}>
        {view.people.map((person, i) => (
          <li key={person.id}>
            <button
              type="button"
              className={css.card}
              data-roving-index={i}
              tabIndex={roving.tabIndexFor(i)}
              aria-pressed={sel === i}
              onClick={() => setSel(sel === i ? null : i)}
              onFocus={() => roving.setActive(i)}
              aria-label={`${person.name}${person.pseudonym ? ' (pseudonym)' : ''}, Day ${person.day}: ${person.span ? person.span.words : 'no hours figure in coverage'}${person.always ? `; described the job as ${ALL_HOURS}` : ''}${person.sleepDays ? `; ${person.sleepDays.days} days without sleep at the longest` : ''}.`}
            >
              <span className={css.name}>{person.name}{person.pseudonym ? <span className={css.pseudo}> (pseudonym)</span> : null}</span>
              <span className={css.role}>{person.role} · testified Day {person.day}</span>
              <Dial p={person} view={view} />
              {person.span?.startHour !== null && person.span ? <span className={css.note}>{person.span.words}, in the witness&apos;s words</span> : null}
              {person.always ? <span className={css.note}>Outer ring: she described the job as {ALL_HOURS}</span> : null}
              <Sleep p={person} maxDays={maxDays} />
            </button>
          </li>
        ))}
      </ul>
      <div className={kit.legendRow} aria-hidden="true">
        <span><span className={css.keySolid} /> hours testified (solid: two or more outlets; outline: one outlet; dashed: one outlet, unconfirmed)</span>
        <span><span className={css.keyFaint} /> {view.standardDay ? `a traditional ${view.standardDay.value}-hour day` : 'a traditional day'}{view.standardWeek ? ` or ${view.standardWeek.value}-hour week` : ''}, for comparison</span>
        <span><span className={css.keyBlock} /> one day without sleep</span>
        <span>Where no start time was given, the arc begins at the top of the dial.</span>
      </div>
      <div className={kit.panel} aria-live="polite">
        {p ? (
          <>
            <p className={kit.kicker}>{p.role} · Day {p.day}</p>
            <h3>{p.name}{p.pseudonym ? ' (pseudonym)' : ''}</h3>
            <ul>
              {p.span ? (
                <li>
                  <strong>Hours:</strong> {p.span.words}. {p.span.fact.text} <span className="muted">({dayList(p.span.fact.days)})</span> <FactMeta fact={p.span.fact} book={view.book} />
                  {p.span.calculated ? <> <Calc formula={p.span.calculated} /> <span className="muted">{p.span.calculated}</span></> : null}
                </li>
              ) : (
                <li><strong>Hours:</strong> not stated in coverage.</li>
              )}
              {p.always ? <li><strong>The job:</strong> {p.always.text} <FactMeta fact={p.always} book={view.book} /></li> : null}
              {p.sleepDays ? <li><strong>Without sleep:</strong> {p.sleepDays.fact.text}: {valueText(p.sleepDays.fact.value, p.sleepDays.fact.unit)} <span className="muted">({dayList(p.sleepDays.fact.days)})</span> <FactMeta fact={p.sleepDays.fact} book={view.book} /></li> : null}
              {p.pay.map((x) => (
                <li key={x.fact.key}><strong>{x.label}:</strong> {valueText(x.fact.value, x.fact.unit)} <span className="muted">({x.fact.text}; {dayList(x.fact.days)})</span> <FactMeta fact={x.fact} book={view.book} /></li>
              ))}
            </ul>
          </>
        ) : (
          <p className={kit.panelHint}>
            Select a clock for the person&apos;s own words, their pay where it was reported, and the sources.
            {view.standardDay ? <> Comparison: {view.standardDay.text} <FactMeta fact={view.standardDay} book={view.book} /></> : null}
          </p>
        )}
      </div>
    </div>
  )
}
