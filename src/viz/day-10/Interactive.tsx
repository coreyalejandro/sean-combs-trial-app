'use client'
// Day 10 picture: a corroboration strip. Across the top, the calendar from early December 2011 to
// mid-January 2012 with a red mark on each event's date. Below, one column per event, and under each
// a stack of tiles: one tile for each witness or record that described it. Filter to one witness to
// see only their columns. On phones the columns become a dated list.
import { useState } from 'react'
import { scaleUtc, utcDay, utcMonth, utcWeek } from 'd3'
import { useRovingFocus } from '@/lib/viz/roving'
import { charsFor, g, monthYear, shortDate, wrap } from '@/viz/kits/days-08-14/geom'
import { ConfDot, FactMeta, kit } from '@/viz/kits/days-08-14/ui'
import { isoToDate, type SourceBook } from '@/viz/kits/days-08-14/facts'
import { eventLabel, type Event, type Witness } from './select'
import css from './day10.module.css'

export interface Day10View { events: Event[]; witnesses: Witness[]; window: [string, string]; book: SourceBook }

const kindWord: Record<Witness['kind'], string> = { person: 'witness', official: 'police or fire', records: 'records' }


function Tile({ w, x, y, size, dim, level }: { w: Witness; x: number; y: number; size: number; dim: boolean; level: Event['accounts'][number]['fact']['confidence'] }) {
  return (
    <g opacity={dim ? 1 / (2 + 2) : 1} aria-hidden="true">
      <rect x={x} y={y} width={size} height={size} className={css[`tile_${w.kind}`]} strokeWidth={g.stroke.mark} />
      <text x={x + size / 2} y={y + size / 2 + g.font.small / 2 - 1} textAnchor="middle" fontSize={g.font.small + 1} fontWeight="bold" className={css[`tileText_${w.kind}`]}>{w.short}</text>
      <ConfDot cx={x + size} cy={y} r={g.quarter + 1} level={level} color="var(--ink)" />
    </g>
  )
}

function Strip({ view, filter, sel, setSel }: { view: Day10View; filter: string | null; sel: number | null; setSel: (i: number | null) => void }) {
  const { events, witnesses } = view
  const roving = useRovingFocus(events.length, { onSelect: (i) => setSel(i), onExit: () => setSel(null) })
  const W = g.wideW
  const start = utcMonth.floor(isoToDate(view.window[0]))
  const end = utcWeek.offset(isoToDate(view.window[1]), 1)
  const x = scaleUtc().domain([start, end]).range([g.gap, W - g.gap])
  const stripY = g.top + g.gap
  const days = utcDay.range(start, end)
  const months = utcMonth.range(start, end)
  const colW = (W - g.gap * 2) / events.length
  const headY = stripY + g.tap + g.gap
  const titleChars = charsFor(colW - g.half, g.font.label)
  const titleLines = Math.max(...events.map((e) => wrap(e.title, titleChars).length))
  const tilesY = headY + g.font.label + g.half + titleLines * (g.font.label + 2 + 2) + g.half
  const tile = g.tap - g.half
  const maxStack = Math.max(...events.map((e) => e.accounts.length))
  const H = tilesY + maxStack * (tile + g.half) + g.gap * 2
  const wById = new Map(witnesses.map((w) => [w.id, w]))
  return (
    <svg className={kit.svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Corroboration strip, ${monthYear(start)} to ${monthYear(utcDay.offset(end, -1))}. Tab into the events, use the arrow keys to move, and Enter to read each account.`} onKeyDown={roving.onKeyDown}>
      <g aria-hidden="true">
        <line x1={x(start)} x2={x(end)} y1={stripY} y2={stripY} stroke="var(--ink)" strokeWidth={g.stroke.mark} />
        {days.map((d) => (
          <line key={+d} x1={x(d)} x2={x(d)} y1={stripY} y2={stripY + (d.getUTCDate() === 1 ? g.gap : g.quarter)} stroke="var(--ink)" strokeWidth={d.getUTCDate() === 1 ? g.stroke.mark : 1} />
        ))}
        {months.map((m) => (
          <text key={+m} x={x(m) + g.quarter} y={stripY - g.half} fontSize={g.font.small} className="mono" fill="var(--muted-ink)">{monthYear(m)}</text>
        ))}
        {utcWeek.range(start, end).map((d) => (
          <text key={`w${+d}`} x={x(d)} y={stripY + g.gap + g.font.small} textAnchor="middle" fontSize={g.font.small - 1} className="mono" fill="var(--muted-ink)">{d.getUTCDate()}</text>
        ))}
      </g>
      {events.map((e, i) => {
        const cx = g.gap + colW * (i + 1 / 2)
        const d = isoToDate(e.date)
        const ex = x(d)
        const monthEnd = utcMonth.offset(d, 1)
        const isSel = sel === i
        const has = !filter || e.accounts.some((a) => a.witness === filter)
        const lines = wrap(e.title, titleChars)
        return (
          <g key={e.id} data-roving-index={i} tabIndex={roving.tabIndexFor(i)} role="button" aria-pressed={isSel} data-selected={isSel}
            aria-label={`${eventLabel(e)}: ${e.title}. Described by ${e.accounts.map((a) => wById.get(a.witness)?.name).join(', ')}.`}
            onClick={() => setSel(isSel ? null : i)} onFocus={() => roving.setActive(i)} opacity={has ? 1 : 1 / (2 + 1)} className={css.col}>
            <rect className={kit.focusRing} x={cx - colW / 2 + 2} y={headY - g.half} width={colW - 2 - 2} height={H - headY} rx={2} />
            <rect x={cx - colW / 2 + 2} y={headY - g.half} width={colW - 2 - 2} height={H - headY} className={isSel ? css.colSel : css.colBg} />
            {e.precision === 'month' ? (
              <path d={`M${x(d)} ${stripY + g.half} v${-g.quarter} H${x(monthEnd)} v${g.quarter}`} fill="none" stroke="var(--red)" strokeWidth={g.stroke.mark} strokeDasharray={g.dash} />
            ) : (
              <circle cx={ex} cy={stripY} r={g.quarter + 1} fill="var(--red)" />
            )}
            <path d={`M${e.precision === 'month' ? (x(d) + x(monthEnd)) / 2 : ex} ${stripY + g.half} L${cx} ${headY - g.half}`} stroke="var(--red)" strokeWidth={1} fill="none" strokeDasharray={e.precision === 'month' ? g.dash : undefined} />
            <text x={cx} y={headY + g.font.label} textAnchor="middle" fontSize={g.font.label} fontWeight="bold" className="mono">{e.precision === 'month' ? monthYear(d).split(' ')[0] : shortDate(d)}</text>
            {lines.map((ln, k) => (
              <text key={k} x={cx} y={headY + g.font.label * 2 + g.half + k * (g.font.label + 2 + 2)} textAnchor="middle" fontSize={g.font.label}>{ln}</text>
            ))}
            {e.accounts.map((a, k) => {
              const w = wById.get(a.witness)
              if (!w) return null
              return <Tile key={a.witness + k} w={w} x={cx - tile / 2} y={tilesY + k * (tile + g.half)} size={tile} dim={!!filter && a.witness !== filter} level={a.fact.confidence} />
            })}
          </g>
        )
      })}
    </svg>
  )
}

function PhoneList({ view, filter, sel, setSel }: { view: Day10View; filter: string | null; sel: number | null; setSel: (i: number | null) => void }) {
  const wById = new Map(view.witnesses.map((w) => [w.id, w]))
  return (
    <ol className={css.list}>
      {view.events.map((e, i) => {
        const has = !filter || e.accounts.some((a) => a.witness === filter)
        return (
          <li key={e.id} className={css.item} data-dim={!has} data-selected={sel === i}>
            <button type="button" data-mark="true" className={css.itemBtn} aria-pressed={sel === i} onClick={() => setSel(sel === i ? null : i)}>
              <span className={css.itemDate}>{eventLabel(e)}</span>
              <span className={css.itemTitle}>{e.title}</span>
              <span className={css.itemTiles}>
                {e.accounts.map((a, k) => {
                  const w = wById.get(a.witness)
                  return w ? <span key={k} className={`${css.chipTile} ${css[`chip_${w.kind}`]}`} data-dim={!!filter && a.witness !== filter}>{w.short}</span> : null
                })}
                <span className={css.itemCount}>{e.accounts.length} {e.accounts.length === 1 ? 'account' : 'accounts'}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export function Day10Interactive({ view }: { view: Day10View }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [sel, setSel] = useState<number | null>(null)
  const e = sel !== null ? view.events[sel] : null
  const wById = new Map(view.witnesses.map((w) => [w.id, w]))
  return (
    <div>
      <div className={kit.controls} role="group" aria-label="Show one witness's accounts">
        <span className={kit.controlLabel} aria-hidden="true">Who described it</span>
        <button type="button" className={kit.chipBtn} aria-pressed={filter === null} onClick={() => setFilter(null)}>Everyone</button>
        {view.witnesses.map((w) => (
          <button key={w.id} type="button" className={kit.chipBtn} aria-pressed={filter === w.id} onClick={() => setFilter(filter === w.id ? null : w.id)}>
            <span className={`${css.chipTile} ${css[`chip_${w.kind}`]}`} aria-hidden="true">{w.short}</span>
            {w.name} <span className="muted">Day {w.day}</span>
          </button>
        ))}
      </div>
      <div className={kit.wide}><Strip view={view} filter={filter} sel={sel} setSel={setSel} /></div>
      <div className={kit.narrow}><PhoneList view={view} filter={filter} sel={sel} setSel={setSel} /></div>
      <div className={kit.legendRow} aria-hidden="true">
        {(['person', 'official', 'records'] as const).map((k) => {
          const w = view.witnesses.find((x) => x.kind === k)
          return w ? <span key={k}><span className={`${css.chipTile} ${css[`chip_${k}`]}`}>{w.short}</span> {kindWord[k]}</span> : null
        })}
        <span className={kit.wide}>corner dot = how sure that account is</span>
        <span className={kit.narrow}>Select an event for how sure each account is.</span>
      </div>
      <div className={kit.panel} aria-live="polite">
        {e ? (
          <>
            <p className={kit.kicker}>{eventLabel(e)}</p>
            <h3>{e.title}</h3>
            <p className="muted">
              {e.dateNote}
              {e.dateFact ? <> <FactMeta fact={e.dateFact} book={view.book} /></> : null}
            </p>
            <ul>
              {e.accounts.filter((a) => !filter || a.witness === filter).map((a, k) => (
                <li key={k}>
                  <strong>{wById.get(a.witness)?.name}, Day {a.day}:</strong> {a.said} <FactMeta fact={a.fact} book={view.book} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={kit.panelHint}>Select an event to read each witness&apos;s account in plain words, the day they gave it, and how sure each one is.</p>
        )}
      </div>
    </div>
  )
}
