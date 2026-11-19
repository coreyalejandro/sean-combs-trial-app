// Day 6: Where Other People Say They Saw Violence. A dot map with a year slider: the United States, a Los Angeles
// area inset (three of the places are a few miles apart) and a Jamaica inset. The outlines are drawn here on the
// server from the installed atlases, so the map is in the static HTML; the client child adds the slider and details.
import { geoAlbersUsa, geoCentroid, geoMercator, geoPath, symbol, symbolCircle, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye } from 'd3'
import type { Feature, FeatureCollection, Geometry, MultiPoint } from 'geojson'
import { feature, mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import usTopo from 'us-atlas/states-10m.json'
import countiesTopo from 'us-atlas/counties-10m.json'
import worldTopo from 'world-atlas/countries-50m.json'
import { redactThirdParties } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import { layout } from '@/lib/viz/layout'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { RowsTable, Sourced, type TableRow } from '@/viz/kits/days-01-07/Parts'
import { numberRefs, toExtraSources } from '@/viz/kits/days-01-07/refs'
import { DotMap, type MapPanel, type Marker } from './Interactive'
import { meta } from './meta'
import { select, type Account, type Place } from './select'
import s from './day06.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

const SYMBOLS = [symbolCircle, symbolSquare, symbolDiamond, symbolTriangle, symbolStar, symbolWye]
const digits = 0

function shapeFor(i: number): string {
  const size = (layout.dot * 2 + layout.stroke.mark) ** 2
  return symbol(SYMBOLS[i % SYMBOLS.length], size)() ?? ''
}

function cluster(accounts: Account[], x: number, y: number): Array<{ a: Account; x: number; y: number }> {
  const step = layout.dot * 2 + layout.gap / 2
  return accounts.map((a, i) => ({ a, x: x + (i - (accounts.length - 1) / 2) * step, y }))
}

function buildPanels(accounts: Account[], places: Place[]): MapPanel[] {
  const us = usTopo as unknown as Topology
  const nation = feature(us, us.objects.nation as GeometryCollection) as unknown as FeatureCollection
  const states = mesh(us, us.objects.states as GeometryCollection, (a, b) => a !== b)
  const W = layout.chartWidth
  const usProj = geoAlbersUsa().fitWidth(W, nation)
  const usPath = geoPath(usProj).digits(digits)
  const usH = Math.ceil(usPath.bounds(nation)[1][1])
  const placeOf = (id: string | null) => places.find((p) => p.id === id)
  const markers: Marker[] = []
  // national markers: one per place outside the Los Angeles area; one cluster for the area
  const la = accounts.filter((a) => placeOf(a.placeId)?.area === 'la')
  const laCentre = places.find((p) => p.id === 'place-los-angeles')
  if (la.length > 0 && laCentre) {
    const xy = usProj([laCentre.lon, laCentre.lat])
    if (xy) markers.push({ key: 'us-la', accountIds: la.map((a) => a.id), x: xy[0], y: xy[1], label: 'Los Angeles area', cluster: true })
  }
  for (const p of places.filter((pl) => pl.area === 'national')) {
    const xy = usProj([p.lon, p.lat])
    const here = accounts.filter((a) => a.placeId === p.id)
    if (!xy || here.length === 0) continue
    for (const c of cluster(here, xy[0], xy[1])) markers.push({ key: `us-${c.a.id}`, accountIds: [c.a.id], x: c.x, y: c.y, label: `${p.name}${c.a.onFlight ? ' (on a flight)' : ''}` })
  }
  const panels: MapPanel[] = [
    {
      id: 'us',
      title: 'The United States',
      w: W,
      h: usH,
      base: (
        <g aria-hidden="true">
          <path d={usPath(nation) ?? ''} className={s.land} />
          <path d={usPath(states) ?? ''} className={s.borders} />
        </g>
      ),
      markers,
    },
  ]

  // Los Angeles area inset, framed on the three places with a county outline for context
  const laPlaces = places.filter((p) => p.area === 'la')
  if (laPlaces.length > 0) {
    const iw = W / 2 - layout.gap / 2
    const ih = layout.chartWidth / 2 / 2 + layout.margin.bottom
    const frame: MultiPoint = { type: 'MultiPoint', coordinates: laPlaces.map((p) => [p.lon, p.lat]) }
    const half = layout.margin.left
    const proj = geoMercator().fitExtent([[iw / 2 - half, ih / 2 - half / 2], [iw / 2 + half, ih / 2 + half / 2]], frame)
    const ctopo = countiesTopo as unknown as Topology
    const counties = feature(ctopo, ctopo.objects.counties as GeometryCollection) as unknown as FeatureCollection
    const lac = counties.features.find((f) => (f.properties as { name?: string } | null)?.name === 'Los Angeles')
    const path = geoPath(proj).digits(digits)
    const m: Marker[] = []
    // Callouts: places west of the centre get a column on the left, the rest on the right, joined by leader lines.
    const anchored = laPlaces
      .map((p) => ({ p, xy: proj([p.lon, p.lat]), here: accounts.filter((a) => a.placeId === p.id) }))
      .filter((x) => x.xy && x.here.length > 0)
    const cx = anchored.reduce((t, x) => t + (x.xy as [number, number])[0], 0) / Math.max(1, anchored.length)
    for (const side of ['left', 'right'] as const) {
      const group = anchored.filter((x) => ((x.xy as [number, number])[0] < cx) === (side === 'left')).sort((a, b) => (a.xy as [number, number])[1] - (b.xy as [number, number])[1])
      const rows = group.flatMap((g) => g.here.map((a) => ({ a, g })))
      const slot = layout.tap
      const top = ih / 2 - ((rows.length - 1) * slot) / 2
      rows.forEach(({ a, g }, k) => {
        const [ax, ay] = g.xy as [number, number]
        m.push({ key: `la-${a.id}`, accountIds: [a.id], x: side === 'left' ? layout.gap + layout.dot : iw - layout.gap - layout.dot, y: top + k * slot, label: '', ax, ay, side })
      })
    }
    panels.push({ id: 'la', title: 'Los Angeles area (inset)', w: iw, h: ih, base: (
        <g aria-hidden="true">
          {lac ? <path d={path(lac as Feature<Geometry>) ?? ''} className={s.land} /> : null}
          {[...anchored]
            .sort((a, b) => (a.xy as [number, number])[1] - (b.xy as [number, number])[1])
            .map((x, k) => {
              const [px, py] = x.xy as [number, number]
              return (
                <g key={x.p.id}>
                  <circle cx={px} cy={py} r={layout.stroke.emphasis + 1} className={s.anchor} />
                  <text x={px} y={k === 0 ? py - layout.gap / 2 : py + layout.gap} textAnchor="middle" className={s.placeLabel}>{x.p.name.split(',')[0]}</text>
                </g>
              )
            })}
        </g>
      ), markers: m })
  }

  // Jamaica inset from the world atlas
  const jm = accounts.filter((a) => a.placeId === 'place-jamaica')
  if (jm.length > 0) {
    const wt = worldTopo as unknown as Topology
    const countries = feature(wt, wt.objects.countries as GeometryCollection) as unknown as FeatureCollection
    const jam = countries.features.find((f) => (f.properties as { name?: string } | null)?.name === 'Jamaica')
    if (jam) {
      const iw = W / 2 - layout.gap / 2
      const ih = layout.chartWidth / 2 / 2 + layout.margin.bottom
      const pad = layout.margin.left
      const proj = geoMercator().fitExtent([[pad, pad], [iw - pad, ih - pad]], jam)
      const path = geoPath(proj).digits(digits)
      const xy = proj(geoCentroid(jam)) ?? [iw / 2, ih / 2]
      panels.push({
        id: 'jm',
        title: 'Jamaica (inset; country only, the place was not reported more precisely)',
        w: iw,
        h: ih,
        base: <g aria-hidden="true"><path d={path(jam as Feature<Geometry>) ?? ''} className={s.land} /></g>,
        markers: cluster(jm, xy[0], xy[1]).map((c) => ({ key: `jm-${c.a.id}`, accountIds: [c.a.id], x: c.x, y: c.y, label: 'Jamaica' })),
      })
    }
  }
  return panels
}

export default function Day06Viz({ day }: DayVizProps) {
  const sel = select(day)
  const { labels } = sel.index
  const shapes: Record<string, string> = {}
  sel.witnesses.forEach((w, i) => {
    shapes[w] = shapeFor(i)
  })
  const panels = buildPanels(sel.accounts, sel.places)
  return (
    <div className={s.viz}>
      <DotMap panels={panels} accounts={sel.accounts} places={sel.places.map((p) => ({ id: p.id, name: p.name, level: p.level, refs: p.refs }))} shapes={shapes} yearFrom={sel.yearFrom} yearTo={sel.yearTo} labels={labels} />
      {sel.numbers.length > 0 ? (
        <ul className={s.numbers}>
          {sel.numbers.map((n) => (
            <li key={n.label}>
              <span className="num">{n.value}</span> {n.label} <Sourced level={n.level} refs={n.refs} labels={labels} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const { labels } = sel.index
  const placeName = (id: string | null) => sel.places.find((p) => p.id === id)?.name ?? 'place not reported'
  const dated = sel.accounts.filter((a) => a.year !== null)
  const accountRows: TableRow[] = [...sel.accounts]
    .sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity))
    .map((a, i) => ({
      key: a.id,
      group: i === 0 ? 'Each account, by year' : undefined,
      cells: [a.year === null ? 'year not reported' : String(a.year), `${a.witness}: ${placeName(a.placeId)}`, a.text],
      level: a.level,
      refs: a.refs,
    }))
  const placeRows: TableRow[] = sel.places.map((p, i) => ({ key: p.id, group: i === 0 ? 'Where the dots sit (city centres, not addresses)' : undefined, cells: ['', p.name, p.refs.length > 0 ? 'Coordinates from a gazetteer or encyclopedia' : 'Centre of the country outline in the world atlas'], level: p.level, refs: p.refs }))
  const numberRows: TableRow[] = day.numbers.map((n, i) => ({
    key: `n${i}`,
    group: i === 0 ? `Every figure reported on Day ${day.day}` : undefined,
    cells: [<span key="v" className="num">{formatValue(n.value, n.unit)}</span>, n.unit, redactThirdParties(n.what)],
    level: n.confidence,
    refs: numberRefs(day, n),
  }))
  const years = dated.map((a) => a.year as number)
  return (
    <>
      <p>
        A map of {sel.accounts.length} accounts by {sel.witnesses.length} witnesses other than Cassie Ventura ({sel.witnesses.join(', ')}) who testified that they
        saw violence toward her, or her injuries afterward. Each dot is one person&rsquo;s account of one occasion, placed on the city, not the address
        {years.length > 0 ? `; the dated accounts run from ${Math.min(...years)} to ${Math.max(...years)}` : ''}. The slider adds dots year by year.
      </p>
      <p>
        {sel.accounts.length - dated.length} accounts have no reported year and stay on the map throughout, drawn as open rings.
        {sel.accounts.some((a) => a.placeId === null) ? ' Accounts with no reported place are listed beside the map instead.' : ''}
      </p>
      <RowsTable caption={`Day ${day.day}: each account, where the dots sit, and every figure reported`} columns={['Year or value', 'Who and where', 'What the record says']} rows={[...accountRows, ...placeRows, ...numberRows]} labels={labels} />
    </>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return sel ? toExtraSources(sel.index.extras) : []
}
