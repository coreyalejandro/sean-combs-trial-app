'use client'
// Day 19 interaction: zoom to a month, filter lanes, select an event for what happened, its day and its sources.
import { useState } from 'react'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import type { Source } from '@/lib/data'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import { ConfDot } from '@/viz/kits/days-15-21/marks'
import { SrcTags, levelWords } from '@/viz/kits/days-15-21/sources'
import { formatMonth, isoToDate } from '@/viz/kits/days-15-21/time'
import { whenText } from './format'
import k from '@/viz/kits/days-15-21/kit.module.css'
import type { SwimGeo } from './geometry'
import { LANES, type LaneId, type TimelineEvent } from './select'
import s from './day19.module.css'

const LANE_COLOR: Record<LaneId, string> = {
  ventura: 'var(--ink)', jane: 'var(--ink)', mia: 'var(--ink)', staff: 'var(--neutral)', agents: 'var(--prosecution)', combs: 'var(--defense)',
}

function Swim({ g, events, hidden, active, onPick }: { g: SwimGeo; events: TimelineEvent[]; hidden: Set<LaneId>; active: string; onPick: (id: string) => void }) {
  const shown = g.events.filter((e) => !hidden.has(events.find((x) => x.id === e.id)?.from ?? 'combs'))
  const roving = useRovingFocus(shown.length, { onSelect: (i) => onPick(shown[i].id) })
  const r = layout.dot + 1
  const V = g.vertical
  const pt = (t: number, l: number) => (V ? { x: l, y: t } : { x: t, y: l })
  const fs = layout.fontSize
  return (
    <svg className={k.chart} viewBox={`0 0 ${g.width} ${g.height}`} role="group" aria-label="Events by person over time: select an event for details" onKeyDown={roving.onKeyDown}>
      {g.ticks.map((tk) => {
        const a = pt(tk.pos, V ? g.lanes[0].pos - layout.gap * 2 : g.lanes[0].pos - layout.gap)
        const b = pt(tk.pos, g.lanes[g.lanes.length - 1].pos + layout.gap)
        return (
          <g key={`${tk.pos}-${tk.label}`} aria-hidden="true">
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={tk.major ? s.gridMajor : s.grid} />
            <text x={V ? layout.stroke.mark : tk.pos + layout.stroke.emphasis} y={V ? tk.pos + fs.small + layout.stroke.mark : fs.small + layout.stroke.mark} className={s.tick}>{tk.label}</text>
          </g>
        )
      })}
      {g.lanes.map((l) => {
        const a = pt(g.t0, l.pos)
        const b = pt(g.t1, l.pos)
        const off = hidden.has(l.id)
        return (
          <g key={l.id} aria-hidden="true" className={off ? s.laneOff : undefined}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={s.lane} />
            <text
              x={V ? l.pos : layout.stroke.mark}
              y={V ? g.t0 - layout.dot * 2 : l.pos + layout.dot - 1}
              textAnchor={V ? 'middle' : 'start'}
              className={s.laneLabel}
            >
              {l.name}
            </text>
          </g>
        )
      })}
      {shown.map((eg, i) => {
        const ev = events.find((x) => x.id === eg.id)
        if (!ev) return null
        const isActive = ev.id === active
        const from = pt(eg.t, eg.from)
        const to = eg.to !== null ? pt(eg.t, eg.to) : null
        const color = LANE_COLOR[ev.from]
        return (
          <g
            key={ev.id}
            className={`${k.mark} ${isActive ? k.isActive : ''}`}
            role="button"
            aria-pressed={isActive}
            aria-label={`${whenText(ev)}: ${ev.title}. ${levelWords(ev.level)}`}
            tabIndex={roving.tabIndexFor(i)}
            data-roving-index={i}
            onClick={() => { roving.setActive(i); onPick(ev.id) }}
            onFocus={() => roving.setActive(i)}
          >
            {to ? (
              <>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={isActive ? 'var(--red)' : color} strokeWidth={isActive ? layout.stroke.emphasis : layout.stroke.mark} strokeOpacity={isActive ? 1 : 1 / 2} />
                <circle cx={to.x} cy={to.y} r={r / 2 + 1} fill="var(--paper)" stroke={isActive ? 'var(--red)' : color} strokeWidth={layout.stroke.mark} />
              </>
            ) : null}
            <ConfDot cx={from.x} cy={from.y} r={isActive ? r + 1 : r} level={ev.level} color={isActive ? 'var(--red)' : color} />
            <circle className={k.focusRing} cx={from.x} cy={from.y} r={r + layout.stroke.emphasis * 2} />
          </g>
        )
      })}
    </svg>
  )
}

export default function Day19Interactive({ events, geo, zooms, pool }: {
  events: TimelineEvent[]; geo: Record<string, { wide: SwimGeo; narrow: SwimGeo }>; zooms: string[]; pool: Source[]
}) {
  const [zoom, setZoom] = useState('all')
  const [hidden, setHidden] = useState<Set<LaneId>>(new Set())
  const [active, setActive] = useState(events[0]?.id ?? '')
  const g = geo[zoom] ?? geo.all
  const inView = events.filter((e) => g.wide.events.some((x) => x.id === e.id) && !hidden.has(e.from))
  const current = events.find((e) => e.id === active)
  const toggleLane = (id: LaneId) => setHidden((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  return (
    <div className={k.viz}>
      <div className={k.controls} role="group" aria-label="Zoom to a month">
        <span className={k.controlLabel}>Zoom</span>
        {zooms.map((z) => (
          <button key={z} type="button" className={`${k.toggle} ${s.zoomBtn}`} aria-pressed={zoom === z} onClick={() => setZoom(z)}>
            {z === 'all' ? 'All months' : (isoToDate(z)?.date ?? new Date(0)).toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' })}
          </button>
        ))}
      </div>
      <fieldset className={s.lanesFilter}>
        <legend>Show people and groups</legend>
        {LANES.map((l) => (
          <label key={l.id}>
            <input type="checkbox" checked={!hidden.has(l.id)} onChange={() => toggleLane(l.id)} /> {l.name}
          </label>
        ))}
      </fieldset>
      <div className={k.wide}><Swim g={g.wide} events={events} hidden={hidden} active={active} onPick={setActive} /></div>
      <div className={k.narrow}><Swim g={g.narrow} events={events} hidden={hidden} active={active} onPick={setActive} /></div>
      <p className={s.legend}>
        A dot sits in the lane of the person or group who acted; a line runs to the lane of the person it reached. Filled dot: two or more outlets; hollow: one outlet; dashed: one outlet, unconfirmed; half-filled: outlets disagree.
      </p>
      {current ? (
        <div className={k.detail} aria-live="polite">
          <h3>{current.title}</h3>
          <p className={k.detailMeta}>
            {whenText(current)} · <ConfidenceMark level={current.level} /> <SrcTags sources={current.sources} pool={pool} /> ·{' '}
            <a href={`/day/${current.fromDay}/`}>Day {current.fromDay}</a>
          </p>
          <ul>{current.words.map((w) => <li key={w}>{w}{/[.)'"]$/.test(w) ? '' : '.'}</li>)}</ul>
        </div>
      ) : null}
      <h3 className={s.listTitle}>{zoom === 'all' ? 'Every event in view' : `Events in ${formatMonth(isoToDate(zoom)?.date ?? new Date(0))}`} ({inView.length})</h3>
      <ol className={s.list}>
        {inView.map((e) => (
          <li key={e.id}>
            <button type="button" className={s.listBtn} aria-pressed={e.id === active} onClick={() => setActive(e.id)}>
              <span className={s.listWhen}>{whenText(e)}</span> <span>{e.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
