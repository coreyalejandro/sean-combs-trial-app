'use client'
// Day 9 picture: a two-sided network. Aliases on the left, the places their records turned up on the
// right; a line for every record that ties one to the other, drawn solid (two or more outlets) or
// dashed (one outlet). Select a name to light up its places, or a place to light up its names.
// On phones the same links become a place-by-place list of name chips.
import { useState } from 'react'
import { useRovingFocus } from '@/lib/viz/roving'
import { g, clip } from '@/viz/kits/days-08-14/geom'
import { FactMeta, kit, dayList } from '@/viz/kits/days-08-14/ui'
import type { SourceBook } from '@/viz/kits/days-08-14/facts'
import type { Alias, Link, Place } from './select'
import css from './day09.module.css'

export interface Day09View { aliases: Alias[]; places: Place[]; links: Link[]; book: SourceBook }
type Sel = { kind: 'alias' | 'place'; id: string } | null

const kindWord: Record<Place['kind'], string> = { hotel: 'hotel', booking: 'bookings by staff', device: 'not a hotel' }

function lit(sel: Sel, l: Link, aliases: Alias[], places: Place[]): boolean {
  if (!sel) return true
  if (sel.kind === 'alias') return aliases.find((a) => a.id === sel.id)?.name === l.alias
  return places.find((p) => p.id === sel.id)?.name === l.place
}

function Network({ view, sel, setSel }: { view: Day09View; sel: Sel; setSel: (s: Sel) => void }) {
  const { aliases, places, links } = view
  const total = aliases.length + places.length
  const pick = (i: number) => setSel(i < aliases.length ? { kind: 'alias', id: aliases[i].id } : { kind: 'place', id: places[i - aliases.length].id })
  const roving = useRovingFocus(total, { onSelect: pick, onExit: () => setSel(null) })
  const W = g.wideW
  const rowH = g.rowH
  const top = g.top + g.gap
  const rows = Math.max(aliases.length, places.length)
  const H = top + rows * rowH
  const ax = g.labelW
  const px = W - g.labelW * 2
  const yOf = (i: number, n: number) => top + ((i + 1 / 2) * (rows * rowH)) / n
  const count = (pred: (l: Link) => boolean) => links.filter(pred).length
  const rOf = (c: number) => g.dot + g.quarter * Math.sqrt(c)
  const aliasY = new Map(aliases.map((a, i) => [a.name, yOf(i, aliases.length)]))
  const placeY = new Map(places.map((p, i) => [p.name, yOf(i, places.length)]))
  const most = Math.max(...aliases.map((a) => count((l) => l.alias === a.name)))
  const mid = (ax + px) / 2

  return (
    <svg className={kit.svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Network of aliases and places. Use Tab to enter, the arrow keys to move between names and places, and Enter to light one up." onKeyDown={roving.onKeyDown}>
      <text x={ax} y={g.top} textAnchor="end" fontSize={g.font.small} className="mono" fill="var(--muted-ink)">NAME USED</text>
      <text x={px} y={g.top} fontSize={g.font.small} className="mono" fill="var(--muted-ink)">WHERE THE RECORD TURNED UP</text>
      <g aria-hidden="true">
        {links.map((l) => {
          const y1 = aliasY.get(l.alias) ?? 0
          const y2 = placeY.get(l.place) ?? 0
          const on = lit(sel, l, aliases, places)
          return (
            <path
              key={l.id}
              d={`M${ax} ${y1} C${mid} ${y1} ${mid} ${y2} ${px} ${y2}`}
              fill="none"
              stroke={sel && on ? 'var(--red)' : 'var(--ink)'}
              strokeOpacity={on ? 1 : 1 / (2 + 2 + 2)}
              strokeWidth={sel && on ? g.stroke.emphasis : l.fact.confidence === 'high' ? g.stroke.mark : g.stroke.hairline + 1 / 2}
              strokeDasharray={l.fact.confidence === 'low' ? g.dash : undefined}
              className={css.link}
            />
          )
        })}
      </g>
      {aliases.map((a, i) => {
        const y = aliasY.get(a.name) ?? 0
        const c = count((l) => l.alias === a.name)
        const isSel = sel?.kind === 'alias' && sel.id === a.id
        const dim = sel && !isSel && !(sel.kind === 'place' && links.some((l) => l.alias === a.name && places.find((p) => p.id === sel.id)?.name === l.place))
        return (
          <g key={a.id} data-roving-index={i} tabIndex={roving.tabIndexFor(i)} role="button" aria-pressed={isSel} data-selected={isSel}
            aria-label={`Alias ${a.name}: in records at ${c} ${c === 1 ? 'place' : 'places'}`}
            onClick={() => setSel(isSel ? null : { kind: 'alias', id: a.id })} onFocus={() => roving.setActive(i)} opacity={dim ? 1 / 2 : 1}>
            <rect className={kit.focusRing} x={g.half} y={y - g.gap - 2} width={ax + g.gap * 2 - g.half} height={g.gap * 2 + 2 + 2} rx={2} />
            <circle cx={ax} cy={y} r={rOf(c)} fill={c === most ? 'var(--red)' : 'var(--ink)'} />
            <text x={ax - rOf(c) - g.half} y={y + g.font.label / 2 - 2} textAnchor="end" fontSize={g.font.value} fontWeight="bold">{a.name}</text>
            <text x={ax - rOf(c) - g.half} y={y + g.font.label + g.half} textAnchor="end" fontSize={g.font.small} className="mono" fill="var(--muted-ink)">{c} {c === 1 ? 'place' : 'places'}</text>
          </g>
        )
      })}
      {places.map((p, j) => {
        const i = aliases.length + j
        const y = placeY.get(p.name) ?? 0
        const c = count((l) => l.place === p.name)
        const isSel = sel?.kind === 'place' && sel.id === p.id
        const dim = sel && !isSel && !(sel.kind === 'alias' && links.some((l) => l.place === p.name && aliases.find((a) => a.id === sel.id)?.name === l.alias))
        const r = rOf(c)
        return (
          <g key={p.id} data-roving-index={i} tabIndex={roving.tabIndexFor(i)} role="button" aria-pressed={isSel} data-selected={isSel}
            aria-label={`${p.name} (${kindWord[p.kind]}): ${c} ${c === 1 ? 'name' : 'names'}${p.years.length ? `; years ${p.years.join(', ')}` : '; year not stated'}`}
            onClick={() => setSel(isSel ? null : { kind: 'place', id: p.id })} onFocus={() => roving.setActive(i)} opacity={dim ? 1 / 2 : 1}>
            <rect className={kit.focusRing} x={px - g.gap - 2} y={y - g.gap - 2} width={W - px + g.gap} height={g.gap * 2 + 2 + 2} rx={2} />
            <rect x={px - r} y={y - r} width={r * 2} height={r * 2} rx={p.kind === 'device' ? r : 0}
              fill={p.kind === 'hotel' ? 'var(--ink)' : '#fff'} stroke="var(--ink)" strokeWidth={g.stroke.mark} strokeDasharray={p.kind === 'booking' ? g.dash : undefined} />
            <text x={px + r + g.half} y={y + g.font.label / 2 - 2} fontSize={g.font.label + 1} fontWeight="bold">{clip(p.name, g.tap)}</text>
            <text x={px + r + g.half} y={y + g.font.label + g.half} fontSize={g.font.small} className="mono" fill="var(--muted-ink)">
              {p.years.length ? p.years.join(', ') : 'year not stated'} · {kindWord[p.kind]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function PhoneList({ view, sel, setSel }: { view: Day09View; sel: Sel; setSel: (s: Sel) => void }) {
  return (
    <ul className={css.cards} aria-label="Places, with the names their records used">
      {view.places.map((p) => {
        const names = view.links.filter((l) => l.place === p.name)
        const isSel = sel?.kind === 'place' && sel.id === p.id
        return (
          <li key={p.id} className={css.card} data-selected={isSel}>
            <button type="button" data-mark="true" className={css.cardHead} aria-pressed={isSel} onClick={() => setSel(isSel ? null : { kind: 'place', id: p.id })}>
              <span className={css.cardName}>{p.name}</span>
              <span className={css.cardMeta}>{p.years.length ? p.years.join(', ') : 'year not stated'} · {kindWord[p.kind]}</span>
            </button>
            <ul className={css.chips} aria-label={`Names in records at ${p.name}`}>
              {names.map((l) => {
                const a = view.aliases.find((x) => x.name === l.alias)
                const on = sel?.kind === 'alias' && a && sel.id === a.id
                return (
                  <li key={l.id}>
                    <button type="button" className={css.chip} data-conf={l.fact.confidence} aria-pressed={!!on} onClick={() => a && setSel(on ? null : { kind: 'alias', id: a.id })}>
                      {l.alias}
                    </button>
                  </li>
                )
              })}
            </ul>
          </li>
        )
      })}
    </ul>
  )
}

function Detail({ view, sel }: { view: Day09View; sel: Sel }) {
  if (!sel) return <p className={kit.panelHint}>Select a name to light up the places its records turned up, or a place to see the names it recorded. Each line shows how sure the record is and where it was reported.</p>
  if (sel.kind === 'alias') {
    const a = view.aliases.find((x) => x.id === sel.id)
    if (!a) return null
    const ls = view.links.filter((l) => l.alias === a.name)
    return (
      <>
        <p className={kit.kicker}>Name used</p>
        <h3>{a.name}: {ls.length} {ls.length === 1 ? 'place' : 'places'}</h3>
        <ul>
          {ls.map((l) => (
            <li key={l.id}><strong>{l.place}.</strong> {l.fact.text} <span className="muted">({dayList(l.fact.days)})</span> <FactMeta fact={l.fact} book={view.book} /></li>
          ))}
        </ul>
      </>
    )
  }
  const p = view.places.find((x) => x.id === sel.id)
  if (!p) return null
  const ls = view.links.filter((l) => l.place === p.name)
  return (
    <>
      <p className={kit.kicker}>{kindWord[p.kind]}</p>
      <h3>{p.name}</h3>
      <ul>
        {ls.map((l) => (
          <li key={l.id}><strong>{l.alias}.</strong> {l.fact.text} <span className="muted">({dayList(l.fact.days)})</span> <FactMeta fact={l.fact} book={view.book} /></li>
        ))}
        {p.notes.map((n) => (
          <li key={n.fact.key}><strong>{n.label}:</strong> {n.fact.text} <span className="muted">({dayList(n.fact.days)})</span> <FactMeta fact={n.fact} book={view.book} /></li>
        ))}
      </ul>
    </>
  )
}

export function Day09Interactive({ view }: { view: Day09View }) {
  const [sel, setSel] = useState<Sel>(null)
  return (
    <div>
      <div className={kit.wide}><Network view={view} sel={sel} setSel={setSel} /></div>
      <div className={kit.narrow}><PhoneList view={view} sel={sel} setSel={setSel} /></div>
      <div className={`${kit.legendRow} ${kit.narrow}`} aria-hidden="true">
        <span>solid box = two or more outlets; dashed box = one outlet, unconfirmed. Tap a place or a name for its records.</span>
      </div>
      <div className={`${kit.legendRow} ${kit.wide}`} aria-hidden="true">
        <span>solid line = two or more outlets</span>
        <span>dashed line = one outlet, unconfirmed</span>
        <span>filled square = hotel; dashed square = bookings by staff; rounded = not a hotel</span>
        <span>larger = more places or names</span>
      </div>
      <div className={kit.panel} aria-live="polite"><Detail view={view} sel={sel} /></div>
    </div>
  )
}
