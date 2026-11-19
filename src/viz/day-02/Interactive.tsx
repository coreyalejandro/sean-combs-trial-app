'use client'
// Day 2: the dual lifeline. Two age lines on one calendar; drag (or use the slider) to read both ages in any year.
// Renders at build time with the cursor on the first year, so the picture is in the static HTML.
import { scaleLinear } from 'd3'
import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { layout } from '@/lib/viz/layout'
import { Calculated, Sourced } from '@/viz/kits/days-01-07/Parts'
import type { LifeEvent } from './select'
import s from './day02.module.css'

export interface LifelineProps {
  startYear: number
  endYear: number
  herAgeMet: number
  hisAgeMet: number
  metYear: number
  gap: number
  events: LifeEvent[]
  together: { from: number; firm: number | null; to: number } | null
  labels: Record<string, string>
}

function Lines({ p, width, year, onPick, compact }: { p: LifelineProps; width: number; year: number; onPick: (y: number) => void; compact: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { left, right, top } = layout.margin
  const fs = layout.fontSize
  const pinRow = top + fs.label
  const herY = pinRow + layout.tap
  const bandH = layout.tap + layout.gap
  const hisY = herY + bandH
  const h = hisY + layout.margin.bottom
  const xStart = compact ? left + layout.gap / 2 : left * 2 + right
  const x = scaleLinear().domain([p.startYear, p.endYear + 1]).range([xStart, width - (compact ? right / 2 : right)])
  const band = x(p.startYear + 1) - x(p.startYear)
  const mid = (y: number) => x(y) + band / 2
  const years = Array.from({ length: p.endYear - p.startYear + 1 }, (_, i) => p.startYear + i)
  const herAge = (y: number) => p.herAgeMet + (y - p.metYear)
  const hisAge = (y: number) => p.hisAgeMet + (y - p.metYear)
  const showYear = (y: number) => !compact || (y - p.startYear) % 2 === 0

  const pick = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current
      if (!svg) return
      const box = svg.getBoundingClientRect()
      const ux = ((e.clientX - box.left) / box.width) * width
      const y = Math.floor(x.invert(ux))
      onPick(Math.min(p.endYear, Math.max(p.startYear, y)))
    },
    [onPick, p.endYear, p.startYear, width, x],
  )

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${h}`}
      className={`${s.svg} ${compact ? s.svgPhone : s.svgWide}`}
      role="img"
      aria-label={`Ages from ${p.startYear} to ${p.endYear}. Cassie Ventura ${herAge(p.startYear)} to ${herAge(p.endYear)}; Sean Combs ${hisAge(p.startYear)} to ${hisAge(p.endYear)}; ${p.gap} years apart.`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId)
        pick(e)
      }}
      onPointerMove={(e) => {
        if (e.buttons > 0) pick(e)
      }}
    >
      <defs>
        <pattern id={`hatch-${compact ? 'p' : 'w'}`} width={layout.dot} height={layout.dot} patternUnits="userSpaceOnUse">
          <rect width={layout.dot} height={layout.dot} className={s.hatchBg} />
          <line x1={0} y1={layout.dot} x2={layout.dot} y2={0} className={s.hatchLine} />
        </pattern>
      </defs>
      {/* the years between them */}
      <rect x={x(p.startYear)} y={herY} width={x(p.endYear + 1) - x(p.startYear)} height={hisY - herY} className={s.gapBand} />
      {p.together ? (
        <g aria-hidden="true">
          <rect x={x(p.together.from)} y={herY + layout.gap / 2} width={x(p.together.firm ?? p.together.to + 1) - x(p.together.from)} height={hisY - herY - layout.gap} className={s.together} />
          {p.together.firm !== null && p.together.firm <= p.together.to ? (
            <rect x={x(p.together.firm)} y={herY + layout.gap / 2} width={x(p.together.to + 1) - x(p.together.firm)} height={hisY - herY - layout.gap} fill={`url(#hatch-${compact ? 'p' : 'w'})`} className={s.togetherUnsure} />
          ) : null}
          <text x={x(p.together.from) + layout.gap / 2} y={(herY + hisY) / 2} dominantBaseline="middle" className={s.togetherLabel}>
            {compact ? 'Together' : `Together, ${p.together.from} to ${p.together.to}`}
          </text>
        </g>
      ) : null}
      {/* the two lives */}
      <line x1={x(p.startYear)} x2={x(p.endYear + 1)} y1={herY} y2={herY} className={s.herLine} />
      <line x1={x(p.startYear)} x2={x(p.endYear + 1)} y1={hisY} y2={hisY} className={s.hisLine} />
      <text x={x(p.startYear) - layout.dot} y={herY} textAnchor="end" dominantBaseline="middle" className={s.who}>Ventura</text>
      <text x={x(p.startYear) - layout.dot} y={hisY} textAnchor="end" dominantBaseline="middle" className={s.who}>Combs</text>
      <text x={x(p.startYear) - layout.dot} y={(herY + hisY) / 2} textAnchor="end" dominantBaseline="middle" className={s.gapLabel}>{compact ? `${p.gap} yrs` : `${p.gap} years apart`}</text>
      {years.map((y) => (
        <g key={y} aria-hidden="true">
          <line x1={x(y)} x2={x(y)} y1={herY - layout.dot} y2={hisY + layout.dot} className={s.yearRule} />
          <text x={mid(y)} y={herY - layout.dot} textAnchor="middle" className={`${s.age} ${y === year ? s.ageOn : ''}`}>{showYear(y) || y === year ? herAge(y) : ''}</text>
          <text x={mid(y)} y={hisY + layout.gap} textAnchor="middle" className={`${s.age} ${y === year ? s.ageOn : ''}`}>{showYear(y) || y === year ? hisAge(y) : ''}</text>
          {showYear(y) ? (
            <text x={mid(y)} y={h - layout.dot} textAnchor="middle" className={s.yearLabel}>{y}</text>
          ) : null}
        </g>
      ))}
      {/* event pins, numbered to match the list */}
      {p.events.map((ev, i) => {
        const x0 = mid(ev.year)
        const x1 = ev.yearEnd ? mid(ev.yearEnd) : x0
        return (
          <g key={ev.id} aria-hidden="true" className={s.pin}>
            {ev.yearEnd ? <line x1={x0} x2={x1} y1={pinRow} y2={pinRow} className={s.pinRange} /> : null}
            <line x1={x0} x2={x0} y1={pinRow} y2={herY - layout.gap - layout.dot} className={`${s.pinStem} ${ev.level === 'low' ? s.dashed : ''}`} />
            <circle cx={x0} cy={pinRow} r={layout.dot + layout.stroke.emphasis} className={`${s.pinDot} ${s[`lvl_${ev.level}`]}`} />
            <text x={x0} y={pinRow} textAnchor="middle" dominantBaseline="central" className={`${s.pinNum} ${s[`num_${ev.level}`]}`}>{i + 1}</text>
          </g>
        )
      })}
      {/* the cursor */}
      <g aria-hidden="true">
        <line x1={mid(year)} x2={mid(year)} y1={herY} y2={hisY} className={s.cursor} />
      </g>
    </svg>
  )
}

export function Lifeline(p: LifelineProps) {
  const [year, setYear] = useState(p.startYear)
  const herAge = p.herAgeMet + (year - p.metYear)
  const hisAge = p.hisAgeMet + (year - p.metYear)
  const atYear = p.events.filter((e) => e.year <= year && year <= (e.yearEnd ?? e.year))
  return (
    <div className={s.lifeline} data-viz-control="lifeline">
      <Lines p={p} width={layout.chartWidth} year={year} onPick={setYear} compact={false} />
      <Lines p={p} width={layout.phoneWidth} year={year} onPick={setYear} compact />
      <div className={s.readout}>
        <label htmlFor="day02-year" className={s.sliderLabel}>
          Year: <span className="num">{year}</span>
        </label>
        <input
          id="day02-year"
          type="range"
          min={p.startYear}
          max={p.endYear}
          step={1}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-valuetext={`${year}: Ventura about ${herAge}, Combs about ${hisAge}`}
          className={s.slider}
        />
        <p className={s.readoutText} aria-live="polite">
          In <span className="num">{year}</span>, Ventura was about <strong className="num">{herAge}</strong> and Combs about{' '}
          <strong className="num">{hisAge}</strong>
          <Calculated formula={`age in the year they met plus years since; she was ${p.herAgeMet} and he was ${p.hisAgeMet} in ${p.metYear}`} />
          {atYear.length > 0 ? <span className={s.atYear}> · {atYear.map((e) => e.label).join('; ')}</span> : null}
        </p>
      </div>
      <ol className={s.legend}>
        {p.events.map((ev) => (
          <li key={ev.id} className={atYear.includes(ev) ? s.legendOn : ''}>
            <button type="button" className={s.legendBtn} onClick={() => setYear(ev.year)} aria-label={`${ev.label}, ${ev.yearEnd ? `${ev.year} or ${ev.yearEnd}` : ev.year}: move the cursor here`}>
              <span className="num">{ev.yearEnd ? `${ev.year} or ${ev.yearEnd}` : ev.year}</span> <strong>{ev.label}</strong>
            </button>
            <span className={s.legendDetail}>{ev.detail}</span> <Sourced level={ev.level} refs={ev.refs} labels={p.labels} />
          </li>
        ))}
      </ol>
    </div>
  )
}
