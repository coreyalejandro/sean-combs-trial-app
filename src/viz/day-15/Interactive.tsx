'use client'
// Day 15 interaction: select a node for the witness's words and its sources; the confidence switch.
import { useState } from 'react'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import type { Source } from '@/lib/data'
import { formatInt, formatUSD, formatUSDShort } from '@/lib/viz/format'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import { Calc, SrcTags, levelWords, type Level } from '@/viz/kits/days-15-21/sources'
import { Hatch } from '@/viz/kits/days-15-21/marks'
import k from '@/viz/kits/days-15-21/kit.module.css'
import s from './day15.module.css'
import type { FlowGeo, NodeGeo } from './geometry'
import type { NodeId } from './select'

export interface NodeView {
  id: NodeId
  name: string
  shortName: string
  amount: number | null
  level: Level
  sources: Source[]
  words: string[]
  formula?: string
  note?: string
}

export interface RulerGeo { width: number; height: number; barEnd: number; ticks: Array<{ x: number; label: string }>; x0: number }

export interface Day15View {
  nodes: NodeView[]
  steps: string[]
  pool: Source[]
  geo: { wide: { full: FlowGeo; confirmed: FlowGeo }; narrow: { full: FlowGeo; confirmed: FlowGeo } }
  pay: null | { hours: number; level: Level; formula: string; wageText: string; wageSources: Source[]; ruler: { wide: RulerGeo; narrow: RulerGeo } }
  dateText: string | null
}

const HATCH = 'flow-hatch'
const bandColor = (id: string) => (id.endsWith('garcia') ? 'var(--red)' : id.endsWith('nda') ? 'var(--ink)' : 'var(--neutral)')

function amountLine(n: NodeView): string {
  if (n.amount === null) return levelWords(n.level)
  return n.id === 'nda' ? `${formatUSDShort(n.amount)} penalty` : formatUSD(n.amount)
}

function Flow({ geo, view, active, onPick, idPrefix }: { geo: FlowGeo; view: Day15View; active: NodeId; onPick: (id: NodeId) => void; idPrefix: string }) {
  const order = geo.nodes.map((n) => n.id)
  const roving = useRovingFocus(order.length, { onSelect: (i) => onPick(order[i]) })
  const byId = new Map(view.nodes.map((n) => [n.id, n]))
  const fs = layout.fontSize
  const labelFor = (g: NodeGeo) => {
    const n = byId.get(g.id)
    if (!n) return null
    const name = geo.vertical ? n.shortName : n.name
    if (g.id === 'nda') {
      // beside the document, two lines
      const x = g.x1 + layout.stroke.emphasis * 2
      const y = (g.y0 + g.y1) / 2
      return (
        <text x={x} y={y} className={s.label}>
          <tspan x={x} dy={-layout.stroke.emphasis} className={s.labelName}>{name}</tspan>
          <tspan x={x} dy={fs.value} className={s.labelValue}>{amountLine(n)}{geo.vertical ? '' : ` · ${levelWords(n.level)}`}</tspan>
        </text>
      )
    }
    const last = g.depth === geo.maxDepth
    const anchor = !geo.vertical && last ? 'end' : geo.vertical && g.x1 > geo.width - layout.margin.left ? 'end' : 'start'
    const x = anchor === 'end' ? g.x1 : g.x0
    const y = g.y0 - fs.small
    return (
      <text x={x} y={y} textAnchor={anchor} className={s.label}>
        <tspan x={x} dy={-fs.value} className={s.labelName}>{name}</tspan>
        <tspan x={x} dy={fs.value} className={s.labelValue}>
          {amountLine(n)}
          {n.formula ? ' (calculated)' : ''}
          {!geo.vertical && n.level !== 'high' ? ` · ${levelWords(n.level)}` : ''}
        </tspan>
      </text>
    )
  }
  return (
    <svg className={k.chart} viewBox={`0 0 ${geo.width} ${geo.height}`} role="group" aria-label="Where the cash went: select a part to read the testimony and its sources" onKeyDown={roving.onKeyDown}>
      <defs>
        <Hatch id={`${HATCH}-${idPrefix}`} color="var(--muted-ink)" />
      </defs>
      <g aria-hidden="true">
        {geo.links.map((l) => {
          const hatch = l.level !== 'high'
          const on = active === l.target || active === l.source
          return (
            <path
              key={l.id}
              d={l.d}
              fill="none"
              stroke={hatch && l.money ? `url(#${HATCH}-${idPrefix})` : bandColor(l.id)}
              strokeWidth={l.money ? l.width : layout.stroke.mark}
              strokeDasharray={l.money ? undefined : layout.dashUnconfirmed}
              className={`${s.band} ${on ? s.bandOn : ''}`}
            />
          )
        })}
      </g>
      {geo.nodes.map((g, i) => {
        const n = byId.get(g.id)
        if (!n) return null
        const isActive = active === g.id
        const pad = layout.stroke.emphasis
        return (
          <g
            key={g.id}
            className={`${k.mark} ${isActive ? k.isActive : ''}`}
            role="button"
            aria-pressed={isActive}
            aria-label={`${n.name}: ${amountLine(n)}, ${levelWords(n.level)}${n.formula ? ', calculated' : ''}`}
            tabIndex={roving.tabIndexFor(i)}
            data-roving-index={i}
            onClick={() => { roving.setActive(i); onPick(g.id) }}
            onFocus={() => roving.setActive(i)}
          >
            {g.id === 'nda' ? (
              <rect x={g.x0} y={g.y0} width={Math.max(g.x1 - g.x0, layout.gap)} height={Math.max(g.y1 - g.y0, layout.gap * 2)} fill="var(--paper)" stroke="var(--ink)" strokeWidth={layout.stroke.mark} strokeDasharray={layout.dashUnconfirmed} />
            ) : (
              <rect
                x={g.x0}
                y={g.y0}
                width={g.x1 - g.x0}
                height={g.y1 - g.y0}
                fill={n.level === 'high' ? 'var(--ink)' : n.level === 'medium' ? 'var(--muted-ink)' : `url(#${HATCH}-${idPrefix})`}
                stroke="var(--ink)"
                strokeWidth={layout.stroke.hairline}
              />
            )}
            <rect className={k.focusRing} x={g.x0 - pad} y={g.y0 - pad} width={Math.max(g.x1 - g.x0, layout.gap) + pad * 2} height={Math.max(g.y1 - g.y0, g.id === 'nda' ? layout.gap * 2 : 0) + pad * 2} />
            {labelFor(g)}
          </g>
        )
      })}
    </svg>
  )
}

function Ruler({ r, pay }: { r: RulerGeo; pay: NonNullable<Day15View['pay']> }) {
  const fs = layout.fontSize
  const mid = r.height / 2
  return (
    <svg className={k.chart} viewBox={`0 0 ${r.width} ${r.height}`} aria-hidden="true">
      <line x1={r.x0} x2={r.width} y1={mid} y2={mid} stroke="var(--rule-paper)" strokeWidth={layout.stroke.hairline} />
      <rect x={r.x0} y={mid - layout.dot} width={r.barEnd - r.x0} height={layout.dot * 2} fill="var(--red)" />
      {r.ticks.map((t) => (
        <g key={t.label}>
          <line x1={t.x} x2={t.x} y1={mid + layout.dot} y2={mid + layout.dot * 2} stroke="var(--ink)" strokeWidth={layout.stroke.hairline} />
          <text x={t.x} y={mid + layout.dot * 2 + fs.small + layout.stroke.mark} textAnchor="middle" className={s.tick}>{t.label}</text>
        </g>
      ))}
      <text x={r.barEnd} y={mid - layout.dot - layout.stroke.emphasis} textAnchor="end" className={s.rulerValue}>
        {formatInt(pay.hours)} hours
      </text>
    </svg>
  )
}

export default function Day15Interactive({ view }: { view: Day15View }) {
  const [onlyConfirmed, setOnlyConfirmed] = useState(false)
  const [active, setActive] = useState<NodeId>('cash')
  const mode = onlyConfirmed ? 'confirmed' : 'full'
  const shown = new Set(view.geo.wide[mode].nodes.map((n) => n.id))
  const current = view.nodes.find((n) => n.id === (shown.has(active) ? active : 'cash'))
  const hidden = view.nodes.filter((n) => !shown.has(n.id))

  return (
    <div className={k.viz}>
      <div className={k.controls}>
        <button
          type="button"
          role="switch"
          aria-checked={onlyConfirmed}
          className={`${k.toggle} ${k.switch}`}
          onClick={() => setOnlyConfirmed((v) => !v)}
        >
          <span className={k.switchTrack} aria-hidden="true" />
          Show only amounts reported by two or more outlets
        </button>
        {view.dateText ? <span className={s.dateChip}>Cash paid after the hotel incident of {view.dateText}</span> : null}
      </div>
      <p className={s.switchNote} aria-live="polite">
        {onlyConfirmed
          ? hidden.length > 0
            ? `Hidden because one outlet reported them: ${hidden.map((n) => n.name.toLowerCase()).join('; ')}.`
            : 'Every part of this picture was reported by two or more outlets.'
          : 'Showing every part of the account, including parts only one outlet reported (striped).'}
      </p>
      <div className={k.wide}>
        <Flow geo={view.geo.wide[mode]} view={view} active={active} onPick={setActive} idPrefix="w" />
      </div>
      <div className={k.narrow}>
        <Flow geo={view.geo.narrow[mode]} view={view} active={active} onPick={setActive} idPrefix="n" />
      </div>

      {current ? (
        <div className={k.detail} aria-live="polite">
          <h3>{current.name}</h3>
          <p>
            <strong className="num">{amountLine(current)}</strong> {current.formula ? <Calc formula={current.formula} /> : null}{' '}
            <ConfidenceMark level={current.level} /> <SrcTags sources={current.sources} pool={view.pool} />
          </p>
          {current.formula ? <p className={k.detailMeta}>Calculated: {current.formula}.</p> : null}
          {current.note ? <p>{current.note}</p> : null}
          {current.id === 'cash' && view.steps.length > 0 ? (
            <>
              <p className={k.detailMeta}>How the deal came together, as Garcia testified (paraphrased):</p>
              <ol>{view.steps.map((t) => <li key={t}>{t}.</li>)}</ol>
            </>
          ) : null}
          {current.words.length > 0 ? (
            <>
              <p className={k.detailMeta}>{current.id === 'supervisor' || current.id === 'officer' || current.id === 'rest' ? 'How outlets reported it:' : 'What Garcia said (paraphrased):'}</p>
              <ul>{current.words.map((t) => <li key={t}>{t}{/[.)']$/.test(t) ? '' : '.'}</li>)}</ul>
            </>
          ) : null}
          <p className={k.detailHint}>Select another part of the picture, or use the arrow keys, to read it.</p>
        </div>
      ) : null}

      {view.pay ? (
        <div className={s.ruler}>
          <h3 className={s.rulerTitle}>
            His share, in hours of his pay <Calc formula={view.pay.formula} />
          </h3>
          <p className={s.rulerNote}>
            {view.pay.formula} = <strong className="num">{formatInt(view.pay.hours)} hours</strong> of work at the wage he testified to ({view.pay.wageText}).{' '}
            <ConfidenceMark level={view.pay.level} /> <SrcTags sources={view.pay.wageSources} pool={view.pool} />
          </p>
          <div className={k.wide}><Ruler r={view.pay.ruler.wide} pay={view.pay} /></div>
          <div className={k.narrow}><Ruler r={view.pay.ruler.narrow} pay={view.pay} /></div>
        </div>
      ) : null}
    </div>
  )
}
