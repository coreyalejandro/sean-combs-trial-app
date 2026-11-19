'use client'
// Day 14 picture: a mirrored two-track timeline. Above the line, what was public or sent (posts, a
// scrapbook, texts, a video) as the defense showed them; below it, Mia's own account of the same
// years. Select any mark to draw a line through both tracks: what was happening in her account at
// that moment, and how she explained it. On phones the timeline scrolls inside its own frame.
import { useRef, useState } from 'react'
import { scaleUtc, utcYear } from 'd3'
import { useRovingFocus } from '@/lib/viz/roving'
import { g } from '../day-08/kit/geom'
import { ConfDot, FactMeta, kit, dayList } from '../day-08/kit/ui'
import { firstYear, isoToDate, type Fact, type SourceBook } from '../day-08/kit/facts'
import { whenLabel, type AccountItem, type Explanation, type Glyph, type PublicItem } from './select'
import css from './day14.module.css'

export interface Day14View {
  publicItems: PublicItem[]
  account: AccountItem[]
  explanations: Explanation[]
  repetitions: { count: number; fact: Fact } | null
  years: [number, number]
  book: SourceBook
}

const glyphWord: Record<Glyph, string> = { post: 'post', gift: 'scrapbook or gift', text: 'text or chat', video: 'video' }


function Mark({ glyph, x, y, r, level }: { glyph: Glyph; x: number; y: number; r: number; level: Fact['confidence'] }) {
  const fill = level === 'high' ? 'var(--ink)' : '#fff'
  const dash = level === 'low' ? g.dash : undefined
  const common = { fill, stroke: 'var(--ink)', strokeWidth: 2, strokeDasharray: dash }
  if (glyph === 'post') return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} {...common} />
  if (glyph === 'gift') return <path d={`M${x} ${y - r - 2} L${x + r + 2} ${y} L${x} ${y + r + 2} L${x - r - 2} ${y} Z`} {...common} />
  if (glyph === 'video') return <rect x={x - r - 2} y={y - r + 2} width={(r + 2) * 2} height={(r - 2) * 2} rx={2} {...common} />
  return <ConfDot cx={x} cy={y} r={r} level={level} />
}

export function Day14Interactive({ view }: { view: Day14View }) {
  const [sel, setSel] = useState<string | null>(null)
  const frame = useRef<HTMLDivElement>(null)
  const dated = view.publicItems.filter((p) => p.date)
  const undated = view.publicItems.filter((p) => !p.date)
  const order = [...dated.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')), ...undated, ...view.account]
  const ids = order.map((o) => o.id)
  const roving = useRovingFocus(ids.length, { onSelect: (i) => setSel(ids[i]), onExit: () => setSel(null) })

  const W = g.wideW
  const start = new Date(Date.UTC(view.years[0], 0, 1))
  const end = utcYear.offset(new Date(Date.UTC(view.years[1], 0, 1)), 1)
  const undatedW = g.tap * 2
  const x = scaleUtc().domain([start, end]).range([g.gap, W - g.gap - undatedW])
  const r = g.dot + 1
  const step = g.gap + g.half
  const levelsUp = 2 + 2 + 1
  const axisY = g.top + g.gap * 2 + step * levelsUp

  // dodge public marks into levels
  const placedPublic: Array<{ p: PublicItem; px: number; level: number }> = []
  const lastX: number[] = []
  for (const p of dated) {
    if (p.end) continue
    const px = x(isoToDate(p.date as string))
    let level = lastX.findIndex((lx) => px - lx > r * 2 + g.quarter)
    if (level < 0) level = lastX.length
    lastX[level] = px
    placedPublic.push({ p, px, level })
  }
  const ranges = dated.filter((p) => p.end)
  const employed = view.account.find((a) => a.end)
  const events = view.account.filter((a) => !a.end)
  const placedAcc: Array<{ a: AccountItem; px: number; level: number }> = []
  const taken: Array<Array<[number, number]>> = []
  const flip = (px: number) => px > W * (2 / (2 + 1))
  for (const a of events) {
    const px = x(isoToDate(a.date))
    const w = a.text.split(';')[0].length * (g.font.label / 2 + 1) + r * 2
    const span: [number, number] = flip(px) ? [px - w, px + r] : [px - r, px + w]
    let level = taken.findIndex((spans) => spans.every(([s0, s1]) => span[1] < s0 || span[0] > s1))
    if (level < 0) level = taken.length
    ;(taken[level] ??= []).push(span)
    placedAcc.push({ a, px, level })
  }
  const below = g.gap * (2 + 2) + step * (Math.max(1, taken.length) + 1)
  const repY = axisY + below + g.gap
  const H = repY + (view.repetitions ? g.tap + g.gap : 0)
  const selPublic = view.publicItems.find((p) => p.id === sel) ?? null
  const selAcc = view.account.find((a) => a.id === sel) ?? null
  const selDate = selPublic?.date ?? selAcc?.date ?? null
  const selX = selDate ? x(isoToDate(selDate)) : null
  const leftYear = view.account.find((a) => a.id === 'left')?.date
  const stateAt = (d: string | null) => {
    if (!d || !employed) return null
    return employed.end && (firstYear(d) ?? 0) <= Number(employed.end) ? `By her account she was working for Combs then (${employed.date} to ${employed.end}).` : `By her account she had already left the job${leftYear ? ` (${leftYear})` : ''}.`
  }
  const idx = (id: string) => ids.indexOf(id)
  const markProps = (id: string, label: string) => ({
    'data-roving-index': idx(id),
    tabIndex: roving.tabIndexFor(idx(id)),
    role: 'button' as const,
    'aria-pressed': sel === id,
    'data-selected': sel === id,
    'aria-label': label,
    onClick: () => setSel(sel === id ? null : id),
    onFocus: () => roving.setActive(idx(id)),
    className: css.markG,
  })
  const scrollBy = (dir: number) => frame.current?.scrollBy({ left: dir * g.tap * (2 + 2), behavior: 'smooth' })

  return (
    <div>
      <p className={`${kit.note} ${kit.narrow}`} aria-hidden="true">Drag the timeline sideways to see more, or use the buttons.</p>
      <div className={`${kit.controls} ${kit.narrow}`}>
        <button type="button" className={kit.chipBtn} onClick={() => scrollBy(-1)}>Earlier years</button>
        <button type="button" className={kit.chipBtn} onClick={() => scrollBy(1)}>Later years</button>
      </div>
      <div className={css.frame} ref={frame} tabIndex={0} role="region" aria-label="Timeline (scrolls sideways on small screens)">
        <svg className={`${kit.svg} ${css.svg}`} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Mirrored timeline: public posts and texts above the line, Mia's account below. Tab in, use the arrow keys to move, and Enter to see a mark's counterpart." onKeyDown={roving.onKeyDown}>
          <text x={g.gap} y={g.top} className={css.trackLabel}>WHAT WAS POSTED OR SENT (as the defense showed it)</text>
          <text x={g.gap} y={axisY + g.gap * (2 + 2) + g.half} className={css.trackLabel}>HER ACCOUNT OF THE SAME YEARS</text>
          {/* axis */}
          <line x1={g.gap} x2={W - g.gap - undatedW} y1={axisY} y2={axisY} stroke="var(--ink)" strokeWidth={g.stroke.mark} />
          {utcYear.range(start, end).map((yr) => (
            <g key={+yr} aria-hidden="true">
              <line x1={x(yr)} x2={x(yr)} y1={axisY - g.quarter} y2={axisY + g.quarter} stroke="var(--ink)" />
              <text x={x(yr)} y={axisY + g.gap} textAnchor="middle" className={css.year}>{yr.getUTCFullYear()}</text>
            </g>
          ))}
          {selX !== null ? <line x1={selX} x2={selX} y1={g.top + g.half} y2={axisY + below - g.gap} className={css.selLine} aria-hidden="true" /> : null}
          {/* ranges above (posts over several years) */}
          {ranges.map((p) => {
            const x0 = x(isoToDate(p.date as string))
            const x1 = x(utcYear.offset(isoToDate(p.end as string), 1))
            const y = g.top + g.gap
            return (
              <g key={p.id} {...markProps(p.id, `${p.text}, ${whenLabel(p.date, p.end)}`)}>
                <rect className={kit.focusRing} x={x0 - 2} y={y - g.half - 2} width={x1 - x0 + 2 + 2} height={g.gap + 2 + 2} />
                <rect x={x0} y={y - g.quarter} width={x1 - x0} height={g.half} className={p.fact.confidence === 'high' ? css.rangeSolid : css.rangeHollow} />
                <text x={x1 + g.half} y={y + g.quarter} className={css.rangeText}>Posts praising Combs, {p.date} to {p.end}</text>
              </g>
            )
          })}
          {placedPublic.map(({ p, px, level }) => {
            const y = axisY - step * (level + 1)
            return (
              <g key={p.id} {...markProps(p.id, `${p.text}, ${whenLabel(p.date)}`)}>
                <line x1={px} x2={px} y1={axisY} y2={y} stroke="var(--muted-ink)" strokeWidth={1} />
                <circle className={kit.focusRing} cx={px} cy={y} r={r + g.quarter} />
                <Mark glyph={p.glyph} x={px} y={y} r={r} level={p.fact.confidence} />
              </g>
            )
          })}
          {undated.map((p, k) => {
            const px = W - undatedW / 2
            const y = axisY - step * (k + 1)
            return (
              <g key={p.id} {...markProps(p.id, `${p.text}, date not stated`)}>
                <circle className={kit.focusRing} cx={px} cy={y} r={r + g.quarter} />
                <Mark glyph={p.glyph} x={px} y={y} r={r} level={p.fact.confidence} />
                <text x={px} y={axisY + g.gap} textAnchor="middle" className={css.year}>no date</text>
              </g>
            )
          })}
          {/* her account below */}
          {employed ? (
            <g {...markProps(employed.id, `${employed.text}, ${employed.date} to ${employed.end}`)}>
              <rect className={kit.focusRing} x={x(isoToDate(employed.date)) - 2} y={axisY + g.gap + g.quarter} width={x(utcYear.offset(isoToDate(employed.end as string), 1)) - x(isoToDate(employed.date)) + 2 + 2} height={g.gap + g.half} />
              <rect x={x(isoToDate(employed.date))} y={axisY + g.gap + g.half} width={x(utcYear.offset(isoToDate(employed.end as string), 1)) - x(isoToDate(employed.date))} height={g.gap} className={css.employed} />
              <text x={x(isoToDate(employed.date))} y={axisY + g.gap * 2 + g.half + g.font.label + 2} className={css.employedText}>{employed.text}, {employed.date} to {employed.end}</text>
            </g>
          ) : null}
          {placedAcc.map(({ a, px, level }) => {
            const y = axisY + g.gap * 2 + g.half + step * (level + 1)
            return (
              <g key={a.id} {...markProps(a.id, `${a.text}, ${whenLabel(a.date)}`)}>
                <line x1={px} x2={px} y1={axisY + g.gap * 2 + g.half} y2={y} stroke="var(--red)" strokeWidth={1} />
                <circle className={kit.focusRing} cx={px} cy={y} r={r + g.quarter} />
                <ConfDot cx={px} cy={y} r={r} level={a.fact.confidence} color="var(--red)" />
                <text x={flip(px) ? px - r - g.quarter : px + r + g.quarter} y={y + g.quarter} textAnchor={flip(px) ? 'end' : 'start'} className={css.accText}>{a.text.split(';')[0]}</text>
              </g>
            )
          })}
          {view.repetitions ? (
            <g aria-hidden="true">
              {Array.from({ length: view.repetitions.count }, (_, k) => {
                const tw = (W - g.gap * 2) / view.repetitions!.count
                return <line key={k} x1={g.gap + k * tw + tw / 2} x2={g.gap + k * tw + tw / 2} y1={repY} y2={repY + g.gap} stroke="var(--ink)" strokeWidth={1} />
              })}
              <text x={g.gap} y={repY + g.gap * 2 + g.quarter} className={css.repText}>
                Each tick is one time the defense asked her a version of the same question about her posts: {view.repetitions.fact.value}, by NPR&apos;s count (one outlet).
              </text>
            </g>
          ) : null}
        </svg>
      </div>
      <div className={kit.legendRow} aria-hidden="true">
        <span>square = post · diamond = scrapbook · circle = text or chat · wide box = video</span>
        <span>filled = two or more outlets; hollow = one outlet; dashed = one outlet, unconfirmed; half-filled = outlets disagree</span>
      </div>
      <div className={kit.panel} aria-live="polite">
        {selPublic ? (
          <>
            <p className={kit.kicker}>Above the line · {glyphWord[selPublic.glyph]} · {whenLabel(selPublic.date, selPublic.end)}</p>
            <h3>{selPublic.text}</h3>
            <p><span className="muted">({dayList(selPublic.fact.days)})</span> <FactMeta fact={selPublic.fact} book={view.book} /></p>
            {stateAt(selPublic.date) ? <p><strong>Across the line:</strong> {stateAt(selPublic.date)}</p> : null}
            <p><strong>How she explained it:</strong></p>
            <ul>
              {view.explanations.filter((e) => e.id === selPublic.why || (selPublic.why !== 'fear' && e.id === 'fear')).map((e) => (
                <li key={e.fact.key}>{e.text} <span className="muted">({dayList(e.fact.days)})</span> <FactMeta fact={e.fact} book={view.book} /></li>
              ))}
            </ul>
            <p className="muted">The defense said posts like this showed real affection.</p>
          </>
        ) : selAcc ? (
          <>
            <p className={kit.kicker}>Below the line · her account · {selAcc.end ? `${selAcc.date} to ${selAcc.end}` : whenLabel(selAcc.date)}</p>
            <h3>{selAcc.text}</h3>
            <p>{selAcc.fact.text !== selAcc.text ? selAcc.fact.text : null} <span className="muted">({dayList(selAcc.fact.days)})</span> <FactMeta fact={selAcc.fact} book={view.book} /></p>
            {selAcc.conflict ? <p>Outlets disagree: {selAcc.conflict.replace(/^Disclosure timing:\s*/i, '')}</p> : null}
            <p><strong>Above the line in these years:</strong> {view.publicItems.filter((p) => p.date && firstYear(p.date) === firstYear(selAcc.date)).map((p) => p.text.toLowerCase()).join('; ') || 'nothing shown from that year'}.</p>
          </>
        ) : (
          <p className={kit.panelHint}>Select any mark to draw a line through both tracks: what was posted or sent, what was happening in her account at the time, and how she explained it.</p>
        )}
      </div>
    </div>
  )
}
