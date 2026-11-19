'use client'
// Day 20 interaction: filter by kind; select an event for its ruling and source. On phones the chart becomes
// a vertical list with the same outcome shapes.
import { useState } from 'react'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import type { Source } from '@/lib/data'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import { SrcTags, levelWords } from '../day-15/kit/sources'
import k from '../day-15/kit/kit.module.css'
import type { DocketGeo } from './geometry'
import { KINDS, OUTCOMES, type DocketEvent, type Kind } from './select'
import { OutcomeShape, ShapeIcon } from './Shape'
import s from './day20.module.css'

function Chart({ g, events, shown, active, onPick }: { g: DocketGeo; events: DocketEvent[]; shown: Set<Kind>; active: string; onPick: (id: string) => void }) {
  const visible = g.marks.filter((m) => shown.has(events.find((e) => e.id === m.id)?.kind ?? 'mistrial'))
  const roving = useRovingFocus(visible.length, { onSelect: (i) => onPick(visible[i].id) })
  const r = layout.dot + 1
  const fs = layout.fontSize
  return (
    <svg className={k.chart} viewBox={`0 0 ${g.width} ${g.height}`} role="group" aria-label="Legal events by kind and trial day: select one for its ruling" onKeyDown={roving.onKeyDown}>
      {g.days.map((d) => (
        <g key={d.n} aria-hidden="true">
          <line x1={d.x} x2={d.x} y1={layout.margin.top - layout.dot} y2={g.height} className={s.dayLine} />
          <text x={d.x} y={fs.small + layout.stroke.mark} textAnchor="middle" className={s.dayNum}>{d.n}</text>
        </g>
      ))}
      <text x={g.x0 - layout.dot} y={fs.small + layout.stroke.mark} textAnchor="end" className={s.dayNum} aria-hidden="true">Trial day</text>
      {g.lanes.map((l) => (
        <g key={l.id} aria-hidden="true" className={shown.has(l.id) ? undefined : s.off}>
          <rect x={0} y={l.y0} width={g.width} height={l.y1 - l.y0} className={s.laneBand} />
          <foreignObject x={0} y={l.y0} width={g.x0 - layout.gap} height={l.y1 - l.y0}>
            <div className={s.laneName}>{l.name}</div>
          </foreignObject>
        </g>
      ))}
      {visible.map((m, i) => {
        const e = events.find((x) => x.id === m.id)
        if (!e) return null
        const isActive = e.id === active
        return (
          <g
            key={m.id}
            className={`${k.mark} ${isActive ? k.isActive : ''}`}
            role="button"
            aria-pressed={isActive}
            aria-label={`${e.dayLabel}: ${e.title}. ${e.outcome}. ${levelWords(e.level)}`}
            tabIndex={roving.tabIndexFor(i)}
            data-roving-index={i}
            onClick={() => { roving.setActive(i); onPick(m.id) }}
            onFocus={() => roving.setActive(i)}
          >
            <OutcomeShape x={m.x} y={m.y} r={r} outcome={e.outcome} level={e.level} color={isActive ? 'var(--red)' : 'var(--ink)'} />
            <circle className={k.focusRing} cx={m.x} cy={m.y} r={r + layout.stroke.emphasis * 2} />
          </g>
        )
      })}
    </svg>
  )
}

function Detail({ e, pool }: { e: DocketEvent; pool: Source[] }) {
  return (
    <div className={k.detail} aria-live="polite">
      <h3>{e.title}</h3>
      <p className={k.detailMeta}>
        <span className={s.outcomeWord}>{e.outcome}</span> · {e.dayLabel} · <ConfidenceMark level={e.level} /> <SrcTags sources={e.sources} pool={pool} />
        {e.fromDay ? <> · <a href={`/day/${e.fromDay}/`}>Day {e.fromDay}</a></> : null}
      </p>
      <p>{e.text}</p>
    </div>
  )
}

export default function Day20Interactive({ events, geo, pool, counts }: {
  events: DocketEvent[]; geo: DocketGeo; pool: Source[]; counts: { total: number; motions: number; motionsDenied: number; denied: number; immunity: number }
}) {
  const [shown, setShown] = useState<Set<Kind>>(new Set(KINDS.map((x) => x.id)))
  const [active, setActive] = useState(events.find((e) => e.kind === 'mistrial' && e.outcome === 'denied')?.id ?? events[0]?.id ?? '')
  const current = events.find((e) => e.id === active && shown.has(e.kind))
  const all = shown.size === KINDS.length
  const pick = (id: Kind | 'all') =>
    setShown(id === 'all' ? new Set(KINDS.map((x) => x.id)) : new Set([id]))
  const used = OUTCOMES.filter((o) => events.some((e) => e.outcome === o))
  return (
    <div className={k.viz}>
      <p className={s.counts}>
        <strong className="num">{counts.total}</strong> legal events in the record · <strong className="num">{counts.motions}</strong> motions to end the case, <strong className="num">{counts.motionsDenied}</strong> denied · <strong className="num">{counts.immunity}</strong> witnesses testified under immunity orders · <strong className="num">{counts.denied}</strong> requests denied in all
        <span className={k.calc} title="Counted from the events below">calculated</span>
      </p>
      <div className={k.controls} role="group" aria-label="Filter by kind">
        <span className={k.controlLabel}>Show</span>
        <button type="button" className={k.toggle} aria-pressed={all} onClick={() => pick('all')}>Every kind</button>
        {KINDS.map((x) => (
          <button key={x.id} type="button" className={k.toggle} aria-pressed={!all && shown.has(x.id)} onClick={() => pick(x.id)}>{x.name}</button>
        ))}
      </div>
      <ul className={k.legend} aria-label="Outcome shapes">
        {used.map((o) => <li key={o}><ShapeIcon outcome={o} /> {o}</li>)}
        <li className={s.legendNote}>Dashed outline: one outlet, unconfirmed</li>
      </ul>
      <div className={k.wide}><Chart g={geo} events={events} shown={shown} active={active} onPick={setActive} /></div>
      <ol className={`${k.narrow} ${s.list}`} aria-label="Legal events in trial order">
        {events.filter((e) => shown.has(e.kind)).map((e) => (
          <li key={e.id}>
            <button type="button" className={s.listBtn} aria-pressed={e.id === active} onClick={() => setActive(e.id)}>
              <ShapeIcon outcome={e.outcome} level={e.level} />
              <span>
                <span className={s.listMeta}>{e.dayLabel} · {KINDS.find((x) => x.id === e.kind)?.name}</span>
                <span className={s.listTitle}>{e.title}</span>
                <span className={s.listOutcome}>{e.outcome}</span>
              </span>
            </button>
            {e.id === active ? <Detail e={e} pool={pool} /> : null}
          </li>
        ))}
      </ol>
      {current ? <div className={k.wide}><Detail e={current} pool={pool} /></div> : null}
    </div>
  )
}
