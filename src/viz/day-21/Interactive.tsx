'use client'
// Day 21 interaction: select any amount for what it was and who reported it; "Show only amounts reported by two
// or more outlets" hides everything a single outlet reported.
import { useState } from 'react'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import type { Source } from '@/lib/data'
import { formatUSD } from '@/lib/viz/format'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import { Hatch } from '../day-15/kit/marks'
import { Calc, SrcTags, levelWords } from '../day-15/kit/sources'
import k from '../day-15/kit/kit.module.css'
import type { Day21Geo } from './geometry'
import type { Money } from './select'
import { amountText } from './format'
import s from './day21.module.css'

const paint = (m: Money, hatch: string) =>
  m.level === 'high' ? { fill: 'var(--ink)', fillOpacity: (layout.dot - 1) / layout.dot } : m.level === 'medium' ? { fill: 'var(--muted-ink)', fillOpacity: 1 / 2 } : { fill: `url(#${hatch})`, fillOpacity: 1 }

function Chart({ g, items, active, onPick, prefix }: { g: Day21Geo; items: Money[]; active: string; onPick: (id: string) => void; prefix: string }) {
  const marks = [...g.bands.map((b) => b.id), ...g.lines.map((l) => l.id), ...g.dots.map((d) => d.id)].filter((id) => items.some((i) => i.id === id))
  const roving = useRovingFocus(marks.length, { onSelect: (i) => onPick(marks[i]) })
  const byId = new Map(items.map((i) => [i.id, i]))
  const hatch = `pay-hatch-${prefix}`
  const fs = layout.fontSize
  const markProps = (id: string) => {
    const m = byId.get(id)
    const i = marks.indexOf(id)
    return {
      className: `${k.mark} ${active === id ? k.isActive : ''}`,
      role: 'button' as const,
      'aria-pressed': active === id,
      'aria-label': m ? `${m.label}: ${amountText(m)}, ${m.when}, ${levelWords(m.level)}` : id,
      tabIndex: roving.tabIndexFor(i),
      'data-roving-index': i,
      onClick: () => { roving.setActive(i); onPick(id) },
      onFocus: () => roving.setActive(i),
    }
  }
  return (
    <svg className={k.chart} viewBox={`0 0 ${g.width} ${g.height}`} role="group" aria-label="Money between Combs and Jane over time: select an amount for details" onKeyDown={roving.onKeyDown}>
      <defs><Hatch id={hatch} color="var(--muted-ink)" /></defs>
      <text x={g.x0} y={fs.small} className={s.panelTitle}>Money each month</text>
      {g.monthly.ticks.map((t) => (
        <g key={t.label} aria-hidden="true">
          <line x1={g.x0} x2={g.x1} y1={t.y} y2={t.y} className={s.grid} />
          <text x={g.x0 - layout.dot} y={t.y + layout.dot - 1} textAnchor="end" className={s.tick}>{t.label}</text>
        </g>
      ))}
      {g.years.map((yr) => (
        <g key={yr.label} aria-hidden="true">
          <line x1={yr.x} x2={yr.x} y1={g.monthly.top} y2={g.swarm.bottom} className={s.yearLine} />
          <text x={yr.x + layout.stroke.emphasis} y={g.monthly.bottom + fs.label + layout.stroke.emphasis} className={s.year}>{yr.label}</text>
        </g>
      ))}
      {g.bands.filter((b) => byId.has(b.id)).map((b) => {
        const m = byId.get(b.id)
        if (!m) return null
        const asked = m.kind === 'asked-monthly'
        const p = paint(m, hatch)
        return (
          <g key={b.id} {...markProps(b.id)}>
            {asked ? (
              <line x1={b.x0} x2={b.x1} y1={b.yHi} y2={b.yHi} stroke="var(--red)" strokeWidth={layout.stroke.emphasis} strokeDasharray={layout.dashUnconfirmed} />
            ) : (
              <>
                <rect x={b.x0} y={b.yLo} width={b.x1 - b.x0} height={b.y0 - b.yLo} fill={p.fill} fillOpacity={p.fillOpacity} stroke="var(--ink)" strokeWidth={layout.stroke.hairline} strokeDasharray={m.level === 'low' ? layout.dashUnconfirmed : undefined} />
                {b.yHi < b.yLo ? <rect x={b.x0} y={b.yHi} width={b.x1 - b.x0} height={b.yLo - b.yHi} fill={`url(#${hatch})`} stroke="var(--ink)" strokeWidth={layout.stroke.hairline} strokeDasharray={layout.dashUnconfirmed} /> : null}
                {m.open ? <path d={`M${b.x1} ${b.yLo}l${layout.dot * 2} ${(b.y0 - b.yLo) / 2}l${-layout.dot * 2} ${(b.y0 - b.yLo) / 2}`} fill={p.fill} fillOpacity={p.fillOpacity} stroke="var(--ink)" strokeWidth={layout.stroke.hairline} /> : null}
              </>
            )}
            <text
              x={asked ? b.x0 - layout.dot : b.x0 + layout.dot}
              y={asked ? b.yHi + layout.dot - 1 : m.level === 'high' ? b.yHi + layout.gap : b.yHi - layout.dot}
              textAnchor={asked ? 'end' : 'start'}
              className={asked ? s.askedLabel : m.level === 'high' ? s.bandLabelInside : s.bandLabel}
              style={!asked && m.level === 'high' ? { fill: 'var(--paper)' } : undefined}
            >
              {asked ? `asked ${amountText(m)}` : amountText(m)}
            </text>
            <rect className={k.focusRing} x={b.x0 - layout.stroke.emphasis} y={b.yHi - layout.stroke.emphasis} width={b.x1 - b.x0 + layout.stroke.emphasis * 2} height={Math.max(b.y0 - b.yHi, layout.dot) + layout.stroke.emphasis * 2} />
          </g>
        )
      })}
      {g.lines.filter((l) => byId.has(l.id)).map((l) => {
        const m = byId.get(l.id)
        if (!m) return null
        return (
          <g key={l.id} {...markProps(l.id)}>
            <line x1={l.x0} x2={l.x1} y1={l.y} y2={l.y} stroke="var(--prosecution)" strokeWidth={layout.stroke.mark} strokeDasharray={layout.dashUnconfirmed} />
            <line x1={l.x0} x2={l.x1} y1={l.y} y2={l.y} stroke="transparent" strokeWidth={layout.gap} />
            <rect className={k.focusRing} x={l.x0} y={l.y - layout.dot} width={l.x1 - l.x0} height={layout.dot * 2} />
          </g>
        )
      })}
      <text x={g.x0} y={g.swarm.top - layout.dot} className={s.panelTitle}>One-time payments (dot area = dollars)</text>
      <line x1={g.x0} x2={g.x1} y1={g.swarm.mid} y2={g.swarm.mid} className={s.grid} aria-hidden="true" />
      {[...g.dots].sort((a, b) => b.r - a.r).filter((d) => byId.has(d.id)).map((d) => {
        const m = byId.get(d.id)
        if (!m) return null
        const asked = m.kind === 'asked'
        const p = paint(m, hatch)
        return (
          <g key={d.id} {...markProps(d.id)}>
            {asked ? (
              <circle cx={d.x} cy={d.y} r={d.r} fill="none" stroke="var(--red)" strokeWidth={layout.stroke.mark} strokeDasharray={layout.dashUnconfirmed} />
            ) : (
              <circle cx={d.x} cy={d.y} r={d.r} fill={p.fill} fillOpacity={p.fillOpacity} stroke="var(--ink)" strokeWidth={layout.stroke.mark} strokeDasharray={m.level === 'low' ? layout.dashUnconfirmed : undefined} />
            )}
            <text x={asked ? d.x + d.r + layout.dot : d.x} y={asked ? d.y - d.r + fs.small : d.y + d.r + fs.small + layout.stroke.mark} textAnchor={asked ? 'start' : 'middle'} className={asked ? s.askedLabel : s.dotLabel}>
              {asked ? `asked ${formatUSD(m.hi)}` : formatUSD(m.hi)}
            </text>
            <circle className={k.focusRing} cx={d.x} cy={d.y} r={d.r + layout.stroke.emphasis} />
          </g>
        )
      })}
    </svg>
  )
}

export default function Day21Interactive({ items, geo, pool }: { items: Money[]; geo: { wide: Day21Geo; narrow: Day21Geo }; pool: Source[] }) {
  const [onlyConfirmed, setOnlyConfirmed] = useState(false)
  const [active, setActive] = useState(items.find((i) => i.id === 'rent')?.id ?? items[0]?.id ?? '')
  const shown = items.filter((i) => !onlyConfirmed || i.level === 'high')
  const current = shown.find((i) => i.id === active)
  const side = shown.filter((i) => i.kind === 'total' || i.kind === 'undated' || i.id === 'child')
  const hiddenCount = items.length - shown.length
  return (
    <div className={k.viz}>
      <div className={k.controls}>
        <button type="button" role="switch" aria-checked={onlyConfirmed} className={`${k.toggle} ${k.switch}`} onClick={() => setOnlyConfirmed((v) => !v)}>
          <span className={k.switchTrack} aria-hidden="true" />
          Show only amounts reported by two or more outlets
        </button>
      </div>
      <p className={s.note} aria-live="polite">
        {onlyConfirmed ? `${hiddenCount} of ${items.length} amounts are hidden: each rests on one outlet.` : 'Solid: two or more outlets. Grey: one outlet. Striped or dashed: one outlet, unconfirmed. Red dashes: what Jane asked for, not what was paid.'}
      </p>
      <div className={s.layout}>
        <div>
          <div className={k.wide}><Chart g={geo.wide} items={shown} active={active} onPick={setActive} prefix="w" /></div>
          <div className={k.narrow}><Chart g={geo.narrow} items={shown} active={active} onPick={setActive} prefix="n" /></div>
          <ul className={s.incomeKey} aria-label="Her own income (blue dashed lines)">
            {shown.filter((m) => m.kind === 'income' && m.id !== 'child').map((m) => (
              <li key={m.id}>
                <button type="button" className={s.keyBtn} aria-pressed={m.id === active} onClick={() => setActive(m.id)}>
                  <svg width={layout.tap / 2 + layout.gap} height={layout.gap} aria-hidden="true"><line x1={0} x2={layout.tap / 2 + layout.gap} y1={layout.gap / 2} y2={layout.gap / 2} stroke="var(--prosecution)" strokeWidth={layout.stroke.mark} strokeDasharray={layout.dashUnconfirmed} /></svg>
                  {m.id === 'prior' ? 'Her own income before the relationship' : 'Her own later income'}: {amountText(m)}{m.formula ? ' (calculated)' : ''}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <ul className={s.cards} aria-label="Amounts with no date">
          {side.map((m) => {
            const r = geo.wide.rFor[m.id] ?? layout.dot
            const size = r * 2 + layout.stroke.mark * 2
            return (
              <li key={m.id}>
                <button type="button" className={s.card} aria-pressed={m.id === active} onClick={() => setActive(m.id)}>
                  {m.id !== 'child' ? (
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className={s.cardDot}>
                      <circle cx={size / 2} cy={size / 2} r={r} fill={m.level === 'high' ? 'var(--ink)' : 'var(--paper)'} stroke="var(--ink)" strokeWidth={layout.stroke.mark} strokeDasharray={m.level === 'low' ? layout.dashUnconfirmed : undefined} />
                    </svg>
                  ) : null}
                  <span>
                    <span className={s.cardAmount}>{amountText(m)}</span>
                    <span className={s.cardLabel}>{m.label}</span>
                    <span className={s.cardWhen}>{m.when} · {levelWords(m.level)}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      {current ? (
        <div className={k.detail} aria-live="polite">
          <h3>{current.label}</h3>
          <p>
            <strong className="num">{amountText(current)}</strong> {current.formula ? <Calc formula={current.formula} /> : null} · {current.when}
          </p>
          {current.formula ? <p className={k.detailMeta}>Calculated: {current.formula}.</p> : null}
          <ul>{current.words.map((w) => <li key={w}>{w}{/[.)'"]$/.test(w) ? '' : '.'}</li>)}</ul>
          <p className={k.detailMeta}>
            <ConfidenceMark level={current.level} /> <SrcTags sources={current.sources} pool={pool} /> ·{' '}
            {current.fromDays.map((d, i) => (
              <span key={d}>{i > 0 ? ', ' : ''}<a href={`/day/${d}/`}>Day {d}</a></span>
            ))}
          </p>
        </div>
      ) : null}
    </div>
  )
}
