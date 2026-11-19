'use client'
// Day 7: the money path on a December calendar. Two lanes (the Ventura family; a Combs-related account) and one
// token that moves along them day by day. Desktop draws a 31-day strip; a phone gets a month grid. The build-time
// HTML (and quiet mode) shows the finished path with every station labelled.
import { scaleBand } from 'd3'
import { useEffect, useState } from 'react'
import { layout } from '@/lib/viz/layout'
import { useQuietMotion } from '@/lib/viz/motion'
import { Calculated, Sourced } from '@/viz/kits/days-01-07/Parts'
import type { BankEntry, ContextMark } from './select'
import s from './day07.module.css'

export interface PathProps {
  amountText: string
  monthName: string
  /** 0-11 */
  month: number
  year: number
  daysInMonth: number
  firstWeekday: number
  bank: BankEntry[]
  bankDay: number | null
  context: ContextMark[]
  labels: Record<string, string>
}

type Stage = 'family' | 'account' | 'back'

export function MoneyPath(p: PathProps) {
  const quiet = useQuietMotion()
  const [d, setD] = useState(p.daysInMonth) // final frame first
  const [playing, setPlaying] = useState(false)
  const wire = p.bank.find((b) => b.kind === 'in') ?? null
  const ret = p.bank.find((b) => b.kind === 'out') ?? null

  useEffect(() => {
    if (!playing || quiet) return
    if (d >= p.daysInMonth) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(() => setD((x) => x + 1), layout.stepMs / 2)
    return () => window.clearTimeout(t)
  }, [playing, quiet, d, p.daysInMonth])

  const stage: Stage = ret && d >= ret.date ? 'back' : wire && d >= wire.date ? 'account' : 'family'
  const held = wire && ret ? ret.date - wire.date : null
  const status =
    stage === 'family'
      ? `${p.amountText} with the Ventura family (home-equity loan; date not reported)`
      : stage === 'account'
        ? `${p.amountText} in a Combs-related account since ${p.monthName} ${wire?.date}`
        : `${p.amountText} returned on ${p.monthName} ${ret?.date}`

  // ---- desktop strip geometry ----
  const W = layout.chartWidth
  const labelW = layout.margin.left * 2 + layout.margin.right * 2
  const pocketW = layout.tap + layout.gap
  const pocketL = labelW + layout.gap
  const pocketX = pocketL + pocketW / 2
  const days = Array.from({ length: p.daysInMonth }, (_, i) => i + 1)
  const x = scaleBand<number>().domain(days).range([pocketL + pocketW + layout.gap, W - layout.margin.right]).paddingInner(layout.stroke.mark / layout.gap)
  const bw = x.bandwidth()
  const cx = (n: number) => (x(n) ?? 0) + bw / 2
  const top = layout.margin.top + layout.gap
  const familyY = top + layout.gap * 2
  const accountY = familyY + layout.tap + layout.gap
  const stripY = accountY + layout.tap
  const cellH = layout.tap / 2 + layout.dot
  const stampY = stripY + cellH + layout.dot
  const stampH = layout.gap * 2
  const ctxY = stampY + stampH + layout.gap * 2
  const H = ctxY + Math.max(0, p.context.length - 1) * layout.gap * 2 + layout.margin.bottom / 2
  const tokenX = stage === 'family' ? pocketX : stage === 'account' ? cx(Math.min(d, ret ? ret.date : d)) : ret ? cx(ret.date) + bw : pocketX
  const tokenY = stage === 'account' ? accountY : familyY
  const r = layout.dot * 2 + layout.stroke.mark

  return (
    <div className={s.pathWrap}>
      <div className={s.controls}>
        <p className={s.status} aria-live="polite">
          <span className={s.statusDay}>{d === 0 ? 'Before the dated records' : `${p.monthName} ${d}, ${p.year}`}</span>
          <span>{status}</span>
        </p>
        <div className={s.buttons}>
          {quiet ? null : (
            <button
              type="button"
              className={s.btn}
              aria-pressed={playing}
              onClick={() => {
                if (!playing && d >= p.daysInMonth) setD(0)
                setPlaying(!playing)
              }}
            >
              {playing ? 'Pause' : 'Play the month'}
            </button>
          )}
          <button type="button" className={s.btn} onClick={() => setD((v) => Math.max(0, v - 1))} disabled={d <= 0}>
            Previous day
          </button>
          <button type="button" className={s.btn} onClick={() => setD((v) => Math.min(p.daysInMonth, v + 1))} disabled={d >= p.daysInMonth}>
            Next day
          </button>
        </div>
      </div>

      {/* desktop: the strip */}
      <svg viewBox={`0 0 ${W} ${H}`} className={s.strip} role="img" aria-label={`${p.monthName} ${p.year}, day by day. ${status}.`}>
        <text x={0} y={familyY} dominantBaseline="central" className={s.laneLabel}>Ventura family</text>
        <text x={0} y={accountY - layout.dot - layout.stroke.mark} className={s.laneLabel}>Combs-related</text>
        <text x={0} y={accountY + layout.gap - layout.stroke.mark} className={s.laneLabel}>account</text>
        <line x1={pocketL} x2={W} y1={familyY} y2={familyY} className={s.lane} />
        <line x1={pocketL} x2={W} y1={accountY} y2={accountY} className={s.lane} />
        {/* the undated pocket */}
        <rect x={pocketL} y={top} width={pocketW} height={accountY - top + layout.gap} className={s.pocket} />
        <text x={pocketX} y={top - layout.dot} textAnchor="middle" className={s.pocketLabel}>no date reported</text>
        <circle cx={pocketX} cy={familyY} r={r} className={s.station} />
        <text x={pocketX} y={familyY + r + layout.gap} textAnchor="middle" className={s.stationLabel}>loan</text>
        {/* path segments */}
        {wire ? <path d={`M${pocketX + r} ${familyY} H${cx(wire.date)} V${accountY}`} className={`${s.route} ${stage !== 'family' ? s.routeOn : ''}`} /> : null}
        {wire && ret ? <line x1={cx(wire.date)} x2={cx(ret.date)} y1={accountY} y2={accountY} className={`${s.held} ${stage !== 'family' ? s.heldOn : ''}`} /> : null}
        {ret ? <path d={`M${cx(ret.date)} ${accountY} V${familyY} H${cx(ret.date) + bw * 2}`} className={`${s.route} ${stage === 'back' ? s.routeOn : ''}`} /> : null}
        {wire ? (
          <g>
            <circle cx={cx(wire.date)} cy={accountY} r={r} className={s.station} />
            <text x={cx(wire.date)} y={familyY - r} textAnchor="middle" className={s.stationLabel}>wired in</text>
          </g>
        ) : null}
        {ret ? (
          <g>
            <circle cx={cx(ret.date)} cy={familyY} r={r} className={s.station} />
            <text x={cx(ret.date) + r + layout.dot} y={familyY - r - layout.dot} textAnchor="start" className={s.stationLabel}>returned</text>
          </g>
        ) : null}
        {held !== null && wire && ret ? (
          <text x={cx(ret.date) - r} y={accountY + r + layout.gap} textAnchor="end" className={s.heldLabel}>
            held {held} days (calculated)
          </text>
        ) : null}
        {/* bank-record stamps, under the matching dates */}
        {p.bank.map((b) =>
          d >= b.date ? (
            <g key={b.date} transform={`translate(${cx(b.date)},${stampY})`}>
              <line x1={0} x2={0} y1={-layout.dot} y2={0} className={s.stampStem} />
              <rect x={-bw * 2} width={bw * (2 + 2)} height={stampH} className={s.stamp} />
              <text y={layout.gap - layout.stroke.mark} textAnchor="middle" className={s.stampText}>BANK</text>
              <text y={stampH - layout.dot} textAnchor="middle" className={s.stampText}>MATCH{p.bankDay ? ` · D${p.bankDay}` : ''}</text>
            </g>
          ) : null,
        )}
        {/* the day strip */}
        {days.map((n) => (
          <g key={n}>
            <rect x={x(n)} y={stripY} width={bw} height={cellH} className={`${s.cell} ${n === d ? s.cellNow : ''} ${n < d ? s.cellPast : ''}`} />
            <text x={cx(n)} y={stripY + cellH / 2} textAnchor="middle" dominantBaseline="central" className={`${s.cellNum} ${n === d ? s.cellNumNow : ''}`}>{n}</text>
          </g>
        ))}
        <text x={0} y={stripY + cellH / 2} textAnchor="start" dominantBaseline="central" className={s.laneLabel}>{p.monthName}</text>
        {/* context marks: dates only */}
        {p.context.map((c, i) => (
          <g key={c.id}>
            <line x1={cx(c.date)} x2={cx(c.date)} y1={stripY + cellH} y2={ctxY + i * layout.gap * 2} className={s.ctxStem} />
            <circle cx={cx(c.date)} cy={ctxY + i * layout.gap * 2} r={layout.stroke.emphasis + 1} className={s.ctxDot} />
            <text x={cx(c.date) - layout.gap / 2} y={ctxY + i * layout.gap * 2} dominantBaseline="central" textAnchor="end" className={s.ctxLabel}>
              {p.monthName.slice(0, 2 + 1)} {c.date}: {c.short}
            </text>
          </g>
        ))}
        {/* the token */}
        <g className={s.token} style={{ transform: `translate(${tokenX}px, ${tokenY}px)` }}>
          <circle r={r - layout.stroke.emphasis} className={s.tokenDot} />
        </g>
      </svg>

      {/* phone: a month grid */}
      <div className={s.month}>
        <div className={s.pocketRow}>
          <span className={`${s.badge} ${s.badgeFamily}`}>Loan</span> No date reported: the family took a home-equity loan
        </div>
        <div className={s.weekdays} aria-hidden="true">
          {days
            .slice(0, layout.dot + 2)
            .map((n) => new Date(Date.UTC(p.year, p.month, n)))
            .sort((a, b) => a.getUTCDay() - b.getUTCDay())
            .map((dt) => (
              <span key={dt.getUTCDay()}>{dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}</span>
            ))}
        </div>
        <ol className={s.grid} aria-label={`${p.monthName} ${p.year}`}>
          {days.map((n) => {
            const b = p.bank.find((x) => x.date === n)
            const c = p.context.filter((x) => x.date === n)
            return (
              <li key={n} className={`${s.day} ${n === d ? s.dayNow : ''} ${b ? s.dayBank : ''}`} style={n === 1 ? { gridColumnStart: p.firstWeekday + 1 } : undefined}>
                <span className={s.dayNum}>{n}</span>
                {b ? <span className={`${s.badge} ${b.kind === 'in' ? s.badgeIn : s.badgeOut}`}>{b.kind === 'in' ? 'In' : 'Back'}</span> : null}
                {c.map((m) => (
                  <span key={m.id} className={s.ctxBadge} title={m.label}>
                    {m.id === 'email' ? 'Email' : m.id === 'photos' ? 'Photos' : 'Out'}
                  </span>
                ))}
                {b && d >= b.date ? <span className={s.miniStamp}>bank match</span> : null}
              </li>
            )
          })}
        </ol>
        {held !== null ? (
          <p className={s.heldText}>
            Held in the account {held} days <Calculated formula={`${p.monthName} ${ret?.date} minus ${p.monthName} ${wire?.date}`} />
          </p>
        ) : null}
      </div>

      <ol className={s.ledger} aria-label="Each dated step, with its source">
        {p.bank.map((b) => (
          <li key={`b${b.date}`}>
            <span className={s.ledgerDate}>{p.monthName} {b.date}</span> {p.amountText} {b.text}. <span className={s.matched}>Bank records{p.bankDay ? `, Day ${p.bankDay}` : ''}</span> <Sourced level={b.level} refs={b.refs} labels={p.labels} />
          </li>
        ))}
        {p.context.map((c) => (
          <li key={c.id}>
            <span className={s.ledgerDate}>{p.monthName} {c.date}</span> {c.label}. <Sourced level={c.level} refs={c.refs} labels={p.labels} />
          </li>
        ))}
      </ol>
    </div>
  )
}
