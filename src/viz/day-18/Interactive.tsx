'use client'
// Day 18 interaction: focus a range for the testimony figure and its source; switch the axis between hours and days.
import { useState } from 'react'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import type { Source } from '@/lib/data'
import { formatInt } from '@/lib/viz/format'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import { Hatch } from '@/viz/kits/days-15-21/marks'
import { Calc, SrcTags, levelWords } from '@/viz/kits/days-15-21/sources'
import { spanText, type SpanUnit } from './format'
import k from '@/viz/kits/days-15-21/kit.module.css'
import type { Day18Geo } from './geometry'
import type { Group, Span, Who } from './select'
import s from './day18.module.css'

type Unit = SpanUnit

const COLOR: Record<Who, string> = { ventura: 'var(--ink)', jane: 'var(--prosecution)', recovery: 'var(--neutral)' }

function Chart({ g, spans, groups, unit, active, onPick, prefix, overlapText }: {
  g: Day18Geo; spans: Span[]; groups: Group[]; unit: Unit; active: string; onPick: (id: string) => void; prefix: string; overlapText: string | null
}) {
  const roving = useRovingFocus(g.rows.length, { onSelect: (i) => onPick(g.rows[i].id) })
  const hatch = `dur-hatch-${prefix}`
  const capH = layout.gap - layout.stroke.mark
  const fs = layout.fontSize
  return (
    <svg className={k.chart} viewBox={`0 0 ${g.width} ${g.height}`} role="group" aria-label="Durations as testified: select a range for its figure and source" onKeyDown={roving.onKeyDown}>
      <defs>
        <Hatch id={`${hatch}-ventura`} color="var(--ink)" />
        <Hatch id={`${hatch}-jane`} color="var(--prosecution)" />
        <Hatch id={`${hatch}-recovery`} color="var(--neutral)" />
      </defs>
      {g.overlap ? (
        <g aria-hidden="true">
          <rect x={g.overlap.x0} y={g.overlap.y0} width={g.overlap.x1 - g.overlap.x0} height={g.overlap.y1 - g.overlap.y0} className={s.overlap} />
          {overlapText && !g.stacked ? (
            <text x={g.overlap.x1 - layout.stroke.emphasis} y={g.overlap.y1 - layout.dot} textAnchor="end" className={s.overlapLabel}>{overlapText}</text>
          ) : null}
        </g>
      ) : null}
      {g.panels.map((p, i) => (
        <g key={i} aria-hidden="true">
          {p.title ? <text x={g.plotX0} y={p.top + fs.label} className={s.panelTitle}>{p.title}</text> : null}
          {p.dayLines.map((x) => <line key={x} x1={x} x2={x} y1={p.top + layout.gap} y2={p.bottom} className={s.dayLine} />)}
          {p.ticks[unit].map((t) => (
            <g key={t.label}>
              <line x1={t.x} x2={t.x} y1={p.top + layout.gap + (p.title ? layout.gap : 0)} y2={p.bottom} className={s.grid} />
              <text x={t.x} y={p.top + layout.gap - layout.stroke.emphasis + (p.title ? layout.gap : 0)} textAnchor="middle" className={s.tick}>{t.label}</text>
            </g>
          ))}
        </g>
      ))}
      {g.headers.map((h) => {
        const grp = groups.find((x) => x.who === h.who)
        if (!grp) return null
        return (
          <text key={h.who} x={layout.stroke.mark} y={h.y} className={s.groupName}>
            {grp.name}
            {grp.years ? <tspan className={s.groupYears}> · {grp.years}</tspan> : null}
          </text>
        )
      })}
      {g.rows.map((r, i) => {
        const sp = spans.find((x) => x.id === r.id)
        if (!sp) return null
        const isActive = active === r.id
        const color = COLOR[sp.who]
        const point = r.x1 - r.x0 < capH
        const fill = sp.level === 'high' ? color : sp.level === 'medium' ? 'var(--paper)' : `url(#${hatch}-${sp.who})`
        const valueX = Math.max(r.x1, r.x0 + capH) + layout.dot + 1
        const roomRight = g.plotX1 - valueX > layout.tap * 2
        return (
          <g
            key={r.id}
            className={`${k.mark} ${isActive ? k.isActive : ''}`}
            role="button"
            aria-pressed={isActive}
            aria-label={`${groups.find((x) => x.who === sp.who)?.name}: ${sp.label}, ${spanText(sp, unit)}, ${levelWords(sp.level)}`}
            tabIndex={roving.tabIndexFor(i)}
            data-roving-index={i}
            onClick={() => { roving.setActive(i); onPick(r.id) }}
            onFocus={() => roving.setActive(i)}
          >
            <text x={r.labelX} y={r.labelY} className={`${s.rowLabel} ${isActive ? s.rowOn : ''}`}>{sp.label}</text>
            {point ? (
              <circle cx={(r.x0 + r.x1) / 2} cy={r.y} r={capH / 2} fill={fill} stroke={color} strokeWidth={layout.stroke.mark} strokeDasharray={sp.level === 'low' ? layout.dashUnconfirmed : undefined} />
            ) : (
              <rect x={r.x0} y={r.y - capH / 2} width={r.x1 - r.x0} height={capH} rx={capH / 2} fill={fill} stroke={color} strokeWidth={layout.stroke.mark} strokeDasharray={sp.level === 'low' ? layout.dashUnconfirmed : undefined} />
            )}
            <text x={roomRight ? valueX : Math.min(r.x0, g.plotX1) - layout.dot - 1} y={r.y + layout.dot - 1} textAnchor={roomRight ? 'start' : 'end'} className={s.value}>{spanText(sp, unit)}</text>
            <rect className={k.focusRing} x={r.x0 - layout.dot} y={r.y - capH / 2 - layout.dot} width={Math.max(r.x1 - r.x0, capH) + layout.dot * 2} height={capH + layout.dot * 2} />
          </g>
        )
      })}
    </svg>
  )
}

export default function Day18Interactive({ spans, groups, geo, pool, overlap }: {
  spans: Span[]; groups: Group[]; geo: { wide: Day18Geo; narrow: Day18Geo }; pool: Source[]; overlap: { lo: number; hi: number } | null
}) {
  const [unit, setUnit] = useState<Unit>('hours')
  const [active, setActive] = useState(spans[0]?.id ?? '')
  const current = spans.find((x) => x.id === active)
  const group = current ? groups.find((x) => x.who === current.who) : undefined
  const overlapText = overlap ? `both accounts: ${spanText(overlap, unit)}` : null
  return (
    <div className={k.viz}>
      <div className={k.controls} role="group" aria-label="Axis unit">
        <span className={k.controlLabel}>Axis</span>
        {(['hours', 'days'] as Unit[]).map((u) => (
          <button key={u} type="button" className={k.toggle} aria-pressed={unit === u} onClick={() => setUnit(u)}>
            {u === 'hours' ? 'Hours' : 'Days'}
          </button>
        ))}
      </div>
      <div className={k.wide}><Chart g={geo.wide} spans={spans} groups={groups} unit={unit} active={active} onPick={setActive} prefix="w" overlapText={overlapText} /></div>
      <div className={k.narrow}><Chart g={geo.narrow} spans={spans} groups={groups} unit={unit} active={active} onPick={setActive} prefix="n" overlapText={overlapText} /></div>
      {overlap ? (
        <p className={s.overlapNote}>
          The shaded band is where both women&apos;s figures overlap: {spanText(overlap, unit)} <Calc formula="the hours covered by both women's ranges" />.
        </p>
      ) : null}
      {current ? (
        <div className={k.detail} aria-live="polite">
          <h3>{group?.name}: {current.label}</h3>
          <p>
            As testified: <strong className="num">{current.reported}</strong>
            {current.reported !== spanText(current, unit) ? <> · on this axis {spanText(current, unit)} <Calc formula="converted from the unit reported" /></> : null}
          </p>
          <p className={k.detailMeta}>
            <ConfidenceMark level={current.level} /> <SrcTags sources={current.sources} pool={pool} /> · <a href={`/day/${current.fromDay}/`}>Day {current.fromDay}</a>
          </p>
        </div>
      ) : null}
    </div>
  )
}
