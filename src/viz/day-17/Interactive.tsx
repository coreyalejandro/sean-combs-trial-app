'use client'
// Day 17 interaction: three layers ("What the records show", "What the witness said", "What the judge ruled"),
// a date scrubber that lights up the places on that date, and marks you can select for words and sources.
import { useState } from 'react'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { formatDate, type Source } from '@/lib/data'
import { formatInt } from '@/lib/viz/format'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import { ConfDot, Hatch } from '@/viz/kits/days-15-21/marks'
import { Calc, SrcTags, levelWords, type Level } from '@/viz/kits/days-15-21/sources'
import k from '@/viz/kits/days-15-21/kit.module.css'
import type { MapGeo, StripGeo } from './geometry'
import type { DateMark, Layer } from './select'
import s from './day17.module.css'

export interface Day17View {
  marks: DateMark[]
  map: { wide: MapGeo; narrow: MapGeo }
  strip: { wide: StripGeo; narrow: StripGeo }
  miles: number | null
  distanceSources: Source[]
  cityLevel: Level
  witness: { words: string[]; level: Level; sources: Source[] } | null
  ruling: { date: string; words: string[]; level: Level; sources: Source[]; day: number } | null
  wordsOnly: string[]
  pool: Source[]
  /** The first date on which marks sit in two different cities. */
  clashDay: string | null
}

const LAYERS: Array<{ id: Layer; label: string }> = [
  { id: 'records', label: 'What the records show' },
  { id: 'witness', label: 'What the witness said' },
  { id: 'judge', label: 'What the judge ruled' },
]

const sideColor = (side: DateMark['side']) => (side === 'defense' ? 'var(--defense)' : side === 'witness' ? 'var(--prosecution)' : 'var(--ink)')

function MapView({ g, lit, miles }: { g: MapGeo; lit: Set<string>; miles: number | null }) {
  const r = layout.dot + 1
  const mid = g.cities.length === 2 ? { x: (g.cities[0].x + g.cities[1].x) / 2, y: Math.min(g.cities[0].y, g.cities[1].y) - layout.gap * 2 } : null
  return (
    <svg className={k.chart} viewBox={`0 0 ${g.width} ${g.height}`} role="img" aria-label={`Map of the United States with Los Angeles and New York marked${miles ? `, about ${formatInt(miles)} miles apart` : ''}.`}>
      <path d={g.nation} fill="#fff" stroke="var(--muted-ink)" strokeWidth={layout.stroke.hairline} />
      <path d={g.states} fill="none" stroke="var(--rule-paper)" strokeWidth={layout.stroke.hairline} />
      {g.arc ? <path d={g.arc} fill="none" stroke="var(--ink)" strokeWidth={layout.stroke.mark} strokeDasharray={layout.dashUnconfirmed} /> : null}
      {mid && miles ? (
        <text x={mid.x} y={mid.y} textAnchor="middle" className={s.mapDistance}>
          about {formatInt(miles)} miles
        </text>
      ) : null}
      {g.cities.map((c) => {
        const on = lit.has(c.id)
        const east = c.x > g.width / 2
        return (
          <g key={c.id}>
            {on ? <circle cx={c.x} cy={c.y} r={r * 2 + 1} fill="none" stroke="var(--red)" strokeWidth={layout.stroke.emphasis} /> : null}
            <circle cx={c.x} cy={c.y} r={r} fill={on ? 'var(--red)' : 'var(--ink)'} />
            <text x={east ? c.x - r * 2 - layout.stroke.mark : c.x + r * 2 + layout.stroke.mark} y={c.y + layout.gap + layout.dot} textAnchor={east ? 'end' : 'start'} className={s.city}>
              {c.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function StripView({ g, view, shown, active, day, onPick, onDay, prefix }: {
  g: StripGeo; view: Day17View; shown: Set<Layer>; active: string; day: string; onPick: (id: string) => void; onDay: (iso: string) => void; prefix: string
}) {
  const visible = g.marks.filter((m) => shown.has(view.marks.find((x) => x.id === m.id)?.layer ?? 'records'))
  const roving = useRovingFocus(visible.length, { onSelect: (i) => onPick(visible[i].id) })
  const hatch = `strip-hatch-${prefix}`
  const r = layout.dot + layout.stroke.mark
  return (
    <svg className={k.chart} viewBox={`0 0 ${g.width} ${g.height}`} role="group" aria-label="Date strip: select a mark for what it is and who reported it" onKeyDown={roving.onKeyDown}>
      <defs><Hatch id={hatch} color="var(--muted-ink)" /></defs>
      {g.days.map((d) => {
        const on = d.iso === day
        const clash = d.iso === view.clashDay
        return (
          <g key={d.iso} onClick={() => onDay(d.iso)} className={s.dayCol}>
            <rect x={d.x} y={0} width={d.w} height={g.height} fill={on ? '#fff' : 'transparent'} stroke={clash ? 'var(--red)' : 'none'} strokeWidth={layout.stroke.mark} />
            <text x={d.x + d.w / 2} y={layout.fontSize.small + layout.stroke.mark} textAnchor="middle" className={s.weekday}>{d.weekday}</text>
            <text x={d.x + d.w / 2} y={layout.fontSize.small * 2 + layout.dot + 1} textAnchor="middle" className={`${s.dayLabel} ${on ? s.dayOn : ''}`}>{d.label}</text>
          </g>
        )
      })}
      {g.lanes.map((l) => (
        <g key={l.id} aria-hidden="true">
          <line x1={0} x2={g.width} y1={l.y + l.h / 2} y2={l.y + l.h / 2} stroke="var(--rule-paper)" strokeWidth={layout.stroke.hairline} />
          <text x={layout.stroke.mark} y={l.labelY} className={s.laneLabel}>{l.name}</text>
        </g>
      ))}
      {visible.map((m, i) => {
        const mark = view.marks.find((x) => x.id === m.id)
        if (!mark) return null
        const isActive = active === m.id
        const color = sideColor(mark.side)
        const isBar = mark.start !== mark.end
        const barH = layout.gap + layout.stroke.mark * 2
        return (
          <g
            key={m.id}
            className={`${k.mark} ${isActive ? k.isActive : ''}`}
            role="button"
            aria-pressed={isActive}
            aria-label={`${mark.label}, ${mark.start === mark.end ? formatDate(mark.start) : `${formatDate(mark.start)} to ${formatDate(mark.end)}`}, ${levelWords(mark.level)}`}
            tabIndex={roving.tabIndexFor(i)}
            data-roving-index={i}
            onClick={() => { roving.setActive(i); onPick(m.id) }}
            onFocus={() => roving.setActive(i)}
          >
            {isBar ? (
              <>
                <rect x={m.x0} y={m.cy - barH / 2} width={m.x1 - m.x0} height={barH} fill={mark.level === 'high' ? color : `url(#${hatch})`} stroke={color} strokeWidth={layout.stroke.mark} />
                <rect className={k.focusRing} x={m.x0 - layout.stroke.emphasis} y={m.cy - barH / 2 - layout.stroke.emphasis} width={m.x1 - m.x0 + layout.stroke.emphasis * 2} height={barH + layout.stroke.emphasis * 2} />
              </>
            ) : (
              <>
                {mark.side === 'witness' ? (
                  <path d={`M${(m.x0 + m.x1) / 2} ${m.cy - r - 1}L${(m.x0 + m.x1) / 2 + r + 1} ${m.cy}L${(m.x0 + m.x1) / 2} ${m.cy + r + 1}L${(m.x0 + m.x1) / 2 - r - 1} ${m.cy}Z`} fill="var(--paper)" stroke={color} strokeWidth={layout.stroke.mark} strokeDasharray={mark.level === 'high' ? undefined : layout.dashUnconfirmed} />
                ) : (
                  <ConfDot cx={(m.x0 + m.x1) / 2} cy={m.cy} r={r} level={mark.level} color={color} />
                )}
                <circle className={k.focusRing} cx={(m.x0 + m.x1) / 2} cy={m.cy} r={r + layout.stroke.emphasis * 2} />
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function Day17Interactive({ view }: { view: Day17View }) {
  const days = view.strip.wide.days.map((d) => d.iso)
  const [shown, setShown] = useState<Set<Layer>>(new Set<Layer>(['records', 'witness', 'judge']))
  const [day, setDay] = useState<string>(view.clashDay ?? days[0] ?? '')
  const [active, setActive] = useState<string>(view.marks[0]?.id ?? '')
  const toggle = (id: Layer) => setShown((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  const onDayMarks = view.marks.filter((m) => shown.has(m.layer) && m.start <= day && day <= m.end)
  const lit = new Set<string>(onDayMarks.map((m) => m.lane))
  const current = view.marks.find((m) => m.id === active && shown.has(m.layer))
  const dayIndex = Math.max(0, days.indexOf(day))

  return (
    <div className={k.viz}>
      <div className={k.controls} role="group" aria-label="Layers">
        {LAYERS.map((l) => (
          <button key={l.id} type="button" className={k.toggle} aria-pressed={shown.has(l.id)} onClick={() => toggle(l.id)}>
            {l.label}
          </button>
        ))}
      </div>
      <div className={s.grid}>
        <div className={s.mapCell}>
          <div className={k.wide}><MapView g={view.map.wide} lit={lit} miles={view.miles} /></div>
          <div className={k.narrow}><MapView g={view.map.narrow} lit={lit} miles={view.miles} /></div>
          {view.miles ? (
            <p className={s.distance}>
              Los Angeles to New York: about <strong className="num">{formatInt(view.miles)} miles</strong> in a straight line <Calc formula="great-circle distance between the two city coordinates" />{' '}
              <ConfidenceMark level={view.cityLevel} /> <SrcTags sources={view.distanceSources} pool={view.pool} />
            </p>
          ) : null}
        </div>
        <div className={s.stripCell}>
          <div className={k.wide}><StripView g={view.strip.wide} view={view} shown={shown} active={active} day={day} onPick={setActive} onDay={setDay} prefix="w" /></div>
          <div className={k.narrow}><StripView g={view.strip.narrow} view={view} shown={shown} active={active} day={day} onPick={setActive} onDay={setDay} prefix="n" /></div>
          <label className={s.scrub}>
            <span>Scrub the dates</span>
            <input
              type="range"
              min={0}
              max={Math.max(0, days.length - 1)}
              step={1}
              value={dayIndex}
              aria-valuetext={day ? formatDate(day, { weekday: true }) : ''}
              onChange={(e) => setDay(days[Number(e.target.value)] ?? day)}
            />
          </label>
          <p className={s.onDay} aria-live="polite">
            <strong>{day ? formatDate(day, { weekday: true }) : ''}:</strong>{' '}
            {onDayMarks.length === 0
              ? 'nothing in the record on this date.'
              : onDayMarks.map((m) => m.label).join('; ') + '.'}
            {lit.has('ny') && lit.has('la') ? <span className={s.clash}> Two cities on one date.</span> : null}
          </p>
        </div>
      </div>

      {current ? (
        <div className={k.detail} aria-live="polite">
          <h3>{current.label}</h3>
          <p className={k.detailMeta}>
            {current.start === current.end ? formatDate(current.start) : `${formatDate(current.start)} to ${formatDate(current.end)}`} ·{' '}
            <ConfidenceMark level={current.level} /> <SrcTags sources={current.sources} pool={view.pool} />
          </p>
          <ul>{current.words.map((w) => <li key={w}>{w}{/[.)'"]$/.test(w) ? '' : '.'}</li>)}</ul>
        </div>
      ) : null}

      <div className={s.lanes}>
        {shown.has('witness') && view.witness ? (
          <section className={`${s.resolution} ${s.witnessLane}`}>
            <h3>What the witness said about the date</h3>
            <ul>{view.witness.words.map((w) => <li key={w}>{w}.</li>)}</ul>
            {view.wordsOnly.map((w) => <p key={w} className={s.wordsOnly}>{w}</p>)}
            <p className={k.detailMeta}><ConfidenceMark level={view.witness.level} /> <SrcTags sources={view.witness.sources} pool={view.pool} /></p>
          </section>
        ) : null}
        {shown.has('judge') && view.ruling ? (
          <section className={`${s.resolution} ${s.judgeLane}`}>
            <h3>What the judge ruled, {formatDate(view.ruling.date)} (<a href={`/day/${view.ruling.day}/`}>Day {view.ruling.day}</a>)</h3>
            <ul>{view.ruling.words.map((w) => <li key={w}>{w}</li>)}</ul>
            <p className={k.detailMeta}><ConfidenceMark level={view.ruling.level} /> <SrcTags sources={view.ruling.sources} pool={view.pool} /></p>
          </section>
        ) : null}
      </div>
    </div>
  )
}
