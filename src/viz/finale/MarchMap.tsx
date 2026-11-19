'use client'
// The animated march: the migration map viewer (viewer/app.js) as a client-only React component on the
// installed deck.gl 9.1.14. Loaded with next/dynamic (ssr: false) from FinaleViewer, so deck.gl and the
// march data load only on /finale/, after the page's intro has painted.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Deck, GeoJsonLayer, PathLayer, ScatterplotLayer, TextLayer, WebMercatorViewport } from 'deck.gl'
import type { Layer } from 'deck.gl'
import { useQuietMotion } from '@/lib/viz/motion'
import { decode, dayNumber, hourText, inflate, MarchEngine, onWashington, type Counts, type MarchMeta, type Views } from './engine'
import { FinaleRef, type RefSource } from './FinaleRef'
import { fmtInt, fmtNum, fmtPeople, pct } from './format'

const DATA_DIR = '/finale-data/'
const START_T = 0.2 // 04:48 on Day 1: everyone still home
const MAX_STEP_S = 0.5 // longest frame step, so a background tab does not jump months
const RENDER_EVERY_MS = 33 // about 30 frames a second
const TONIGHT_EVERY_MS = 250
const LOWER48: [[number, number], [number, number]] = [[-124.8, 24.3], [-66.9, 49.5]]
const FIT_PADDING = 10
const MIN_ZOOM = 1.5
const MAX_ZOOM = 11
const MAX_DPR = 2
const DOT_PX = 1.35
const HOME_PX = 1
const CORRIDOR_MIN_PX = 0.5
const CORRIDOR_MAX_PX = 7.5
const DC_RING_PX = 9
const LABEL_PX = 13
const LABEL_OFFSET: [number, number] = [-14, -14]
const PERCENT = 100
const SHARE_DIGITS_SMALL = 0.1
const KM2 = 1e6
const DAYS_PER_WEEK = 7
const DAYS_PER_MONTH = 30
const STEP_BEFORE_DEPARTURE = 0.02
const HALF_DAY = 0.5
const END_EPS = 0.001

/** Playback speeds from the viewer, in simulated days per second. */
const SPEEDS: Array<{ v: number; label: string }> = [
  { v: 1 / 24, label: '1 hour each second' },
  { v: 0.5, label: '1 day every 2 seconds' },
  { v: 1, label: '1 day each second' },
  { v: 7, label: '1 week each second' },
]
const DEFAULT_SPEED = SPEEDS[1].v

/** The jobs the viewer shows, in its order, with its short labels. */
const JOB_PICK = ['Preschool and kindergarten teachers', 'Childcare workers', 'Registered nurses', 'Home health aides',
  'Elementary and middle school teachers', 'Cashiers', 'Total, 16 years and over', 'Police officers',
  'Driver/sales workers and truck drivers', 'Firefighters', 'Construction laborers']
const JOB_LABEL: Record<string, string> = { 'Total, 16 years and over': 'All workers', 'Driver/sales workers and truck drivers': 'Truck drivers' }
const HEADLINE_JOBS = ['Registered nurses', 'Childcare workers', 'Elementary and middle school teachers']
const BAR_SCALE_MAX = 0.5 // bars run from 0 to 50%

const COLORS = {
  ground: [20, 23, 28, 255] as [number, number, number, number],
  border: [58, 64, 74, 255] as [number, number, number, number],
  home: [125, 131, 140, 70] as [number, number, number, number],
  corridor: [111, 143, 179, 150] as [number, number, number, number],
  red: [227, 38, 27, 255] as [number, number, number, number],
  paper: [244, 244, 241, 255] as [number, number, number, number],
  ink: [10, 11, 13, 255] as [number, number, number, number],
}

type Phase = { kind: 'loading'; progress: number } | { kind: 'error'; message: string } | { kind: 'ready' }

interface Display { t: number; counts: Counts; playing: boolean }
interface Tonight { rows: Array<{ county: number; people: number }>; total: number; places: number; day: number }

async function fetchWithProgress(url: string, onProgress: (p: number) => void): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: ${res.status}`)
  const total = Number(res.headers.get('content-length')) || 0
  if (!res.body || !total) return res.arrayBuffer()
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    onProgress(Math.min(1, loaded / total))
  }
  const out = new Uint8Array(loaded)
  let o = 0
  for (const c of chunks) { out.set(c, o); o += c.length }
  return out.buffer
}

export default function MarchMap({ refs }: { refs: Record<string, RefSource> }) {
  const quiet = useQuietMotion()
  const mapEl = useRef<HTMLDivElement>(null)
  const deckRef = useRef<Deck | null>(null)
  const engineRef = useRef<MarchEngine | null>(null)
  const metaRef = useRef<MarchMeta | null>(null)
  const S = useRef({ t: START_T, playing: false, speed: DEFAULT_SPEED, views: { leaving: true, passing: true, arriving: true } as Views, lastTonight: -1, lastTonightAt: 0, lastRender: 0 })
  const staticLayers = useRef<{ states?: Layer; homes?: Layer; corridors?: Layer; dc?: Layer[] }>({})
  const [phase, setPhase] = useState<Phase>({ kind: 'loading', progress: 0 })
  const [meta, setMeta] = useState<MarchMeta | null>(null)
  const [display, setDisplay] = useState<Display>({ t: START_T, counts: { gone: 0, road: 0, wait: 0, arr: 0 }, playing: false })
  const [views, setViews] = useState<Views>(S.current.views)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const [tonight, setTonight] = useState<Tonight | null>(null)
  const [announce, setAnnounce] = useState('')

  /* ---------- drawing ---------- */
  const redraw = useCallback((force = false) => {
    const engine = engineRef.current
    const deck = deckRef.current
    const m = metaRef.current
    if (!engine || !deck || !m) return
    const st = S.current
    const counts = engine.computeFrame(st.t, st.views)
    const L: Layer[] = []
    const sl = staticLayers.current
    // deck.gl wants fresh layer instances each render; clone() keeps the same data, so nothing is re-uploaded
    if (sl.states) L.push(sl.states.clone({}))
    if (st.views.leaving && sl.homes) L.push(sl.homes.clone({}))
    if (st.views.passing && sl.corridors) L.push(sl.corridors.clone({}))
    L.push(new ScatterplotLayer({
      id: 'dots',
      data: { length: engine.d.N, attributes: { getPosition: { value: engine.pos, size: 2 }, getFillColor: { value: engine.col, size: 4, normalized: true } } },
      radiusUnits: 'pixels', getRadius: DOT_PX, radiusMinPixels: 1,
      updateTriggers: { getFillColor: st.t, getPosition: st.t },
    }))
    if (sl.dc) L.push(...sl.dc.map((l) => l.clone({})))
    deck.setProps({ layers: L })
    const day = Math.floor(st.t)
    const now = performance.now()
    if (st.views.passing && day !== st.lastTonight && (force || !st.playing || now - st.lastTonightAt > TONIGHT_EVERY_MS)) {
      st.lastTonight = day
      st.lastTonightAt = now
      setTonight({ ...engine.tonight(day), day })
    }
    setDisplay({ t: st.t, counts: { ...counts }, playing: st.playing })
  }, [])

  const say = useCallback(() => {
    const engine = engineRef.current
    const m = metaRef.current
    if (!engine || !m) return
    const c = engine.counts
    const p = m.people_per_dot
    setAnnounce(`Day ${dayNumber(S.current.t)}. ${fmtPeople(c.gone * p)} gone from home, ${fmtPeople(c.road * p)} on the road, ${fmtPeople(c.wait * p)} waiting at a full road, ${fmtPeople(c.arr * p)} arrived in Washington.`)
  }, [])

  const setPlaying = useCallback((on: boolean) => {
    S.current.playing = on
    setDisplay((d) => ({ ...d, playing: on }))
  }, [])

  const jumpTo = useCallback((t: number) => {
    const engine = engineRef.current
    if (!engine) return
    S.current.t = Math.max(0, Math.min(engine.maxT, t))
    redraw(true)
    say()
  }, [redraw, say])

  /* ---------- loading ---------- */
  useEffect(() => {
    let cancelled = false
    let deck: Deck | null = null
    ;(async () => {
      try {
        const m: MarchMeta = await (await fetch(`${DATA_DIR}meta.json`)).json()
        const gz = await fetchWithProgress(`${DATA_DIR}march.qbin`, (p) => !cancelled && setPhase({ kind: 'loading', progress: p }))
        const raw = await inflate(gz)
        if (cancelled) return
        const engine = new MarchEngine(decode(raw, m), m)
        const el = mapEl.current
        if (!el || cancelled) return
        const coarse = window.matchMedia('(pointer: coarse)').matches
        const vp = new WebMercatorViewport({ width: el.clientWidth, height: el.clientHeight }).fitBounds(LOWER48, { padding: FIT_PADDING })
        deck = new Deck({
          parent: el,
          initialViewState: { longitude: vp.longitude, latitude: vp.latitude, zoom: vp.zoom, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM },
          // Phones: the map does not take over the page's scrolling; it stays framed on the whole country.
          controller: coarse ? false : { dragRotate: false, touchRotate: false, scrollZoom: { smooth: false } },
          useDevicePixels: Math.min(window.devicePixelRatio || 1, MAX_DPR),
          layers: [],
          style: { position: 'absolute', inset: '0' },
          getCursor: () => (coarse ? 'default' : 'grab'),
        })
        if (coarse) {
          const canvas = el.querySelector('canvas')
          if (canvas) canvas.style.touchAction = 'pan-y'
        }
        const homePos = new Float32Array(engine.d.N * 2)
        for (let i = 0; i < engine.d.N; i++) { homePos[2 * i] = engine.d.dotLon[i]; homePos[2 * i + 1] = engine.d.dotLat[i] }
        staticLayers.current = {
          states: new GeoJsonLayer({ id: 'states', data: m.states_geo, stroked: true, filled: true, getFillColor: COLORS.ground, getLineColor: COLORS.border, lineWidthMinPixels: 0.6 }),
          homes: new ScatterplotLayer({ id: 'homes', data: { length: engine.d.N, attributes: { getPosition: { value: homePos, size: 2 } } }, radiusUnits: 'pixels', getRadius: HOME_PX, getFillColor: COLORS.home }),
          corridors: new PathLayer<{ p: [number, number][]; w: number }>({ id: 'corridors', data: engine.corridors(CORRIDOR_MIN_PX, CORRIDOR_MAX_PX), getPath: (d) => d.p, getWidth: (d) => d.w, widthUnits: 'pixels', getColor: COLORS.corridor, capRounded: true }),
          dc: [
            new ScatterplotLayer<{ p: [number, number] }>({ id: 'dc', data: [{ p: m.mall }], getPosition: (d) => d.p, radiusUnits: 'pixels', getRadius: DC_RING_PX, stroked: true, filled: false, getLineColor: COLORS.red, lineWidthMinPixels: 2 }),
            new TextLayer<{ p: [number, number]; t: string }>({ id: 'dc-label', data: [{ p: m.mall, t: 'Washington, D.C.' }], getPosition: (d) => d.p, getText: (d) => d.t, getColor: COLORS.paper, getSize: LABEL_PX, getPixelOffset: LABEL_OFFSET, getTextAnchor: 'end', fontFamily: 'Libre Franklin, Arial, sans-serif', fontWeight: 700, outlineWidth: 3, outlineColor: COLORS.ink, fontSettings: { sdf: true } }),
          ],
        }
        deckRef.current = deck
        engineRef.current = engine
        metaRef.current = m
        onWashington() // the march ON Washington: not defined yet (Corey's decision)
        setMeta(m)
        setPhase({ kind: 'ready' })
        // Commands from the content note's buttons, possibly pressed while the data was loading
        const w = window as unknown as { __finalePending?: string }
        if (w.__finalePending) window.dispatchEvent(new CustomEvent('finale:command', { detail: w.__finalePending }))
        redraw(true)
        ;(window as unknown as { __march: unknown }).__march = {
          ready: true, S: S.current, counts: engine.counts, jumpTo: (t: number) => { S.current.t = Math.max(0, Math.min(engine.maxT, t)); redraw(true) }, setPlaying: (on: boolean) => { S.current.playing = on },
        }
      } catch (e) {
        if (!cancelled) setPhase({ kind: 'error', message: e instanceof Error ? e.message : String(e) })
      }
    })()
    return () => {
      cancelled = true
      deck?.finalize()
      deckRef.current = null
    }
  }, [redraw])

  /* ---------- playback ---------- */
  useEffect(() => {
    if (phase.kind !== 'ready') return
    let raf = 0
    let last: number | null = null
    const tick = (ts: number) => {
      const st = S.current
      const engine = engineRef.current
      if (st.playing && !quiet && engine) {
        if (last !== null) {
          const dt = Math.min(MAX_STEP_S, (ts - last) / 1000)
          st.t = Math.min(engine.maxT, st.t + st.speed * dt)
          if (st.t >= engine.maxT) { st.playing = false; say() }
          if (ts - st.lastRender >= RENDER_EVERY_MS || !st.playing) { st.lastRender = ts; redraw() }
        }
        last = ts
      } else last = null
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase.kind, quiet, redraw, say])

  // Quiet mode (the header switch or the system setting) stops the motion; the day bar and step buttons stay.
  useEffect(() => {
    if (quiet && S.current.playing) { setPlaying(false); say() }
  }, [quiet, setPlaying, say])

  // "Start the march" and "Skip to the arrival" in the content note
  useEffect(() => {
    const onCmd = (e: Event) => {
      const cmd = (e as CustomEvent<string>).detail
      const engine = engineRef.current
      const m = metaRef.current
      if (!engine || !m) return
      ;(window as unknown as { __finalePending?: string }).__finalePending = undefined
      if (cmd === 'start') {
        const depart = m.walk_start_hour / 24
        if (S.current.t < depart) S.current.t = depart - STEP_BEFORE_DEPARTURE
        if (!quiet) setPlaying(true)
        redraw(true)
      } else if (cmd === 'skip') {
        setPlaying(false)
        jumpTo(m.half_day - HALF_DAY)
      }
    }
    window.addEventListener('finale:command', onCmd)
    return () => window.removeEventListener('finale:command', onCmd)
  }, [quiet, jumpTo, redraw, setPlaying])

  const toggleView = (v: keyof Views) => {
    const next = { ...S.current.views, [v]: !S.current.views[v] }
    S.current.views = next
    S.current.lastTonight = -1
    setViews(next)
    redraw(true)
  }

  /* ---------- derived panel content ---------- */
  const m = meta
  const p = m?.people_per_dot ?? 0
  const t = display.t
  const c = display.counts
  const maxT = m ? m.last_day - END_EPS : 1
  const rangeOf = (x: number) => (m ? `${fmtPeople((x * m.totals.low) / m.totals.central)} to ${fmtPeople((x * m.totals.high) / m.totals.central)}` : '')
  const jobs = useMemo(() => {
    if (!m) return []
    return JOB_PICK.map((name) => m.jobs.find((j) => j.job === name)).filter((j): j is NonNullable<typeof j> => Boolean(j))
  }, [m])
  const inTen = useMemo(() => {
    if (!m) return 0
    const sel = m.jobs.filter((j) => HEADLINE_JOBS.includes(j.job))
    return sel.length ? Math.round((sel.reduce((a, j) => a + j.share, 0) / sel.length) * 10) : 0
  }, [m])
  const abbr = useMemo(() => new Map((m?.states ?? []).map((s) => [s.name, s.abbr])), [m])

  const r = refs
  const R = (...ids: string[]) => ids.map((id) => r[id]).filter(Boolean)

  if (phase.kind === 'error') {
    return <p className="fm-loading" role="alert">The map could not load its data ({phase.message}). The still map and the tables below show the same march.</p>
  }

  return (
    <div className="fm-app" data-ready={phase.kind === 'ready' ? 'true' : 'false'}>
      <div className="fm-stage">
        <div className="fm-map">
          <div className="fm-canvas" ref={mapEl} role="img" aria-label={`Map of the march on Day ${dayNumber(t)}: dots, each 1,000 people, moving along real roads toward Washington, D.C. The counters below give the numbers.`} />
          {phase.kind === 'loading' ? (
            <p className="fm-loading" aria-live="polite">
              Loading the walkers and their roads… <span className="mono">{Math.round(phase.progress * PERCENT)}%</span>
            </p>
          ) : null}
          <div className="fm-daybadge" aria-hidden="true">
            <span className="fm-day">Day {fmtInt(dayNumber(t))}</span>
            {m ? <span className="fm-hour">{hourText(t, m.walk_start_hour, m.walk_hours)}</span> : null}
          </div>
          <ul className="fm-legend" aria-label="What the dot colours mean">
            <li><i style={{ background: '#7d838c' }} />At home</li>
            <li><i style={{ background: '#c9d6e6' }} />Walking or resting</li>
            <li><i style={{ background: 'var(--red)' }} />Waiting at a full road</li>
            <li><i style={{ background: '#ffffff' }} />Arrived (crowd drawn larger than life)</li>
          </ul>
        </div>

        <div className="fm-counters">
          <div className="fm-counter fm-gone">
            <span className="fm-k">People gone from home</span>
            <span className="fm-v" data-testid="c-gone">{fmtPeople(c.gone * p)}</span>
            {m ? <span className="fm-r">of {fmtPeople(m.totals.central)} survivors{c.gone > 0 ? ` · range ${rangeOf(c.gone * p)}` : ''}</span> : null}
          </div>
          <div className="fm-counter">
            <span className="fm-k">On the road</span>
            <span className="fm-v" data-testid="c-road">{fmtPeople(c.road * p)}</span>
            {m && c.road > 0 ? <span className="fm-r">range {rangeOf(c.road * p)}</span> : null}
          </div>
          <div className="fm-counter">
            <span className="fm-k">Waiting at a full road</span>
            <span className="fm-v" data-testid="c-wait">{fmtPeople(c.wait * p)}</span>
            {m && c.wait > 0 ? <span className="fm-r">range {rangeOf(c.wait * p)}</span> : null}
          </div>
          <div className="fm-counter">
            <span className="fm-k">Arrived in Washington</span>
            <span className="fm-v" data-testid="c-arr">{fmtPeople(c.arr * p)}</span>
            {m && c.arr > 0 ? <span className="fm-r">range {rangeOf(c.arr * p)}</span> : null}
          </div>
        </div>
        <p className="visually-hidden" aria-live="polite">{announce}</p>

        <div className="fm-controls">
          <button type="button" className="fm-btn fm-primary fm-play" disabled={!m || quiet} onClick={() => {
            const engine = engineRef.current
            if (!engine) return
            if (S.current.t >= engine.maxT) S.current.t = 0
            const on = !S.current.playing
            setPlaying(on)
            if (!on) say()
          }}>{display.playing ? 'Pause' : 'Play'}</button>
          <label className="fm-speed">
            <span className="visually-hidden">Playback speed</span>
            <select value={speed} disabled={!m} onChange={(e) => { const v = Number(e.target.value); S.current.speed = v; setSpeed(v) }}>
              {SPEEDS.map((s) => <option key={s.label} value={s.v}>{s.label}</option>)}
            </select>
          </label>
          <div className="fm-scrub">
            <input
              type="range" min={0} max={maxT} step={0.01} value={t} disabled={!m}
              aria-label="Day of the march"
              aria-valuetext={m ? `Day ${dayNumber(t)}, ${hourText(t, m.walk_start_hour, m.walk_hours)}` : undefined}
              onChange={(e) => { setPlaying(false); jumpTo(Number(e.target.value)) }}
              onKeyDown={(e) => {
                const big = e.shiftKey ? DAYS_PER_WEEK : 1
                const moves: Record<string, number> = { ArrowRight: big, ArrowUp: big, ArrowLeft: -big, ArrowDown: -big, PageUp: DAYS_PER_MONTH, PageDown: -DAYS_PER_MONTH }
                if (e.key in moves) { e.preventDefault(); setPlaying(false); jumpTo(Math.floor(S.current.t) + moves[e.key] + HALF_DAY) }
                else if (e.key === 'Home') { e.preventDefault(); setPlaying(false); jumpTo(START_T) }
                else if (e.key === 'End') { e.preventDefault(); setPlaying(false); jumpTo(maxT) }
              }}
            />
            {m ? (
              <div className="fm-ticks" aria-hidden="true">
                <i style={{ left: '0%' }} />
                <i style={{ left: `${((m.half_day - 1) / maxT) * PERCENT}%` }} />
                <i style={{ left: '100%' }} />
              </div>
            ) : null}
          </div>
        </div>
        <div className="fm-marks" role="group" aria-label="Jump to a moment">
          <button type="button" className="fm-btn fm-small" disabled={!m} onClick={() => { setPlaying(false); jumpTo(START_T) }}>Day 1: everyone leaves</button>
          <button type="button" className="fm-btn fm-small" disabled={!m} onClick={() => { setPlaying(false); if (m) jumpTo(m.half_day - HALF_DAY) }}>Half have arrived{m ? ` · Day ${m.half_day}` : ''}</button>
          <button type="button" className="fm-btn fm-small" disabled={!m} onClick={() => { setPlaying(false); jumpTo(maxT) }}>Last arrival{m ? ` · Day ${fmtInt(m.last_day)}` : ''}</button>
          <span className="fm-stepper">
            <button type="button" className="fm-btn fm-small" disabled={!m} onClick={() => { setPlaying(false); jumpTo(Math.floor(S.current.t) - 1 + HALF_DAY) }}>Previous day</button>
            <button type="button" className="fm-btn fm-small" disabled={!m} onClick={() => { setPlaying(false); jumpTo(Math.floor(S.current.t) + 1 + HALF_DAY) }}>Next day</button>
          </span>
        </div>
        {quiet ? (
          <p className="fm-quiet-note">Quiet mode is on, so the march does not play. Use the day bar or the buttons to step through it. (Turn quiet mode off with the &ldquo;Quiet mode (no motion)&rdquo; switch at the top of the page.)</p>
        ) : null}

        <div className="fm-views" role="group" aria-label="Views">
          <span className="fm-lbl">Show</span>
          <button type="button" className="fm-btn fm-vt" aria-pressed={views.leaving} onClick={() => toggleView('leaving')}>The leaving</button>
          <button type="button" className="fm-btn fm-vt" aria-pressed={views.passing} onClick={() => toggleView('passing')}>The passing through</button>
          <button type="button" className="fm-btn fm-vt" aria-pressed={views.arriving} onClick={() => toggleView('arriving')}>The arriving</button>
        </div>
      </div>

      {m ? (
        <div className="fm-panels">
          {views.leaving ? (
            <section className="fm-panel" aria-labelledby="fm-leaving">
              <span className="fm-eyebrow">The leaving · where people live</span>
              <h3 id="fm-leaving">Who would be gone</h3>
              <div>
                <div className="fm-big"><FinaleRef sources={R('cdc-nisvs')}>{fmtPeople(m.totals.central)}</FinaleRef></div>
                <div className="fm-range">Range {fmtPeople(m.totals.low)} to {fmtPeople(m.totals.high)} · {pct(m.share_of_adults)} of U.S. adults <FinaleRef sources={R('census-v2025')}>{''}</FinaleRef></div>
              </div>
              <p>About <strong>{inTen} in 10</strong> nurses, childcare workers and teachers would leave. Share of each job gone <FinaleRef sources={R('bls-cps11', 'cdc-nisvs')} calculated>{''}</FinaleRef>:</p>
              <ul className="fm-bars">
                {jobs.map((j) => (
                  <li key={j.job} className={`fm-bar${j.job.startsWith('Total') ? ' fm-all' : ''}`}>
                    <span className="fm-lab">{JOB_LABEL[j.job] ?? j.job}
                      <span className="fm-track" aria-hidden="true"><span className="fm-fill" style={{ width: `${Math.min(PERCENT, (j.share / BAR_SCALE_MAX) * PERCENT).toFixed(1)}%` }} /></span>
                    </span>
                    <span className="fm-num">{pct(j.share)}</span>
                  </li>
                ))}
              </ul>
              <p>Estimate: {m.jobs_method}</p>
            </section>
          ) : null}

          {views.passing ? (
            <section className="fm-panel" aria-labelledby="fm-passing">
              <span className="fm-eyebrow">The passing through · towns on the way</span>
              <h3 id="fm-passing">Busiest stops, night of Day {fmtInt((tonight?.day ?? 0) + 1)}</h3>
              <p>
                {tonight && tonight.total === 0 ? 'No one is sleeping away from home tonight.' : tonight ? (
                  <>
                    <FinaleRef sources={R('jhu-csse', 'ne-roads')} calculated>{fmtPeople(tonight.total)}</FinaleRef> marchers sleep away from home tonight in {fmtInt(tonight.places)} counties. They need about{' '}
                    <FinaleRef sources={R('sphere')} calculated>{fmtPeople(tonight.total * m.needs.water_l)}</FinaleRef> litres of water,{' '}
                    <FinaleRef sources={R('sanitation')} calculated>{fmtInt(Math.ceil(tonight.total / m.needs.people_per_toilet))}</FinaleRef> toilets and{' '}
                    <FinaleRef sources={R('sphere')} calculated>{fmtNum((tonight.total * m.needs.shelter_m2) / KM2, 0)}</FinaleRef> km² of shelter
                    {' '}({fmtNum(m.needs.water_l, 0)} litres of water each, 1 toilet per {fmtNum(m.needs.people_per_toilet, 0)} people, {fmtNum(m.needs.shelter_m2, 1)} m² of shelter each).
                  </>
                ) : 'Computing tonight’s stops…'}
              </p>
              <div className="fm-tablewrap" tabIndex={0} role="region" aria-label="Busiest stops tonight, table">
                <table className="fm-tonight">
                  <thead><tr><th scope="col">County</th><th scope="col">Marchers</th><th scope="col">Per resident</th><th scope="col">Water (L)</th><th scope="col">Toilets</th></tr></thead>
                  <tbody>
                    {tonight && tonight.rows.length ? tonight.rows.map((row) => {
                      const pop = m.counties.pop[row.county]
                      const per = row.people / pop
                      return (
                        <tr key={row.county}>
                          <th scope="row">{m.counties.name[row.county]}, {abbr.get(m.counties.state[row.county]) ?? m.counties.state[row.county]}</th>
                          <td>{fmtInt(row.people)}</td>
                          <td>{per.toFixed(per >= 10 ? 0 : 1)}</td>
                          <td>{fmtInt(row.people * m.needs.water_l)}</td>
                          <td>{fmtInt(Math.ceil(row.people / m.needs.people_per_toilet))}</td>
                        </tr>
                      )
                    }) : <tr><td colSpan={5}>No one is sleeping away from home tonight.</td></tr>}
                  </tbody>
                </table>
              </div>
              <p>
                Roads full for all 12 open hours on at least one day:{' '}
                <strong><FinaleRef sources={R('fhwa')} calculated>{fmtInt(Number(m.road.road_km_full_all_12_open_hours_on_some_day))} km</FinaleRef></strong>.{' '}
                {fmtPeople(m.queue.people_who_waited_at_a_full_road)} people wait at a full road at some point (longest wait {m.queue.longest_wait_days} days). Corridor width shows how many people pass along each road in all.
              </p>
            </section>
          ) : null}

        </div>
      ) : null}
      {m ? (
        <div className="fm-arrive-wrap">
          {views.arriving ? (
            <section className="fm-panel fm-arriving" aria-labelledby="fm-arriving">
              <span className="fm-eyebrow">The arriving · Washington, D.C.</span>
              <h3 id="fm-arriving">The crowd at Washington</h3>
              <div>
                <div className="fm-big">{fmtPeople(c.arr * p)}</div>
                <div className="fm-range">people have arrived ({pct(c.arr / (m.totals.central / p), c.arr / (m.totals.central / p) < SHARE_DIGITS_SMALL ? 1 : 0)} of all marchers)</div>
              </div>
              <ArrivalCurve meta={m} t={t} arrivedNow={c.arr * p} />
              <p>
                Standing room needed:{' '}
                <strong><FinaleRef sources={R('mall')} calculated>{fmtNum((c.arr * p * m.needs.standing_m2) / KM2, 1)} km²</FinaleRef></strong>,{' '}
                {fmtNum((c.arr * p * m.needs.standing_m2) / KM2 / m.needs.mall_km2, 1)} times the National Mall ({fmtNum(m.needs.mall_km2, 2)} km²). Shelter at {fmtNum(m.needs.shelter_m2, 1)} m² each:{' '}
                <strong>{fmtNum((c.arr * p * m.needs.shelter_m2) / KM2, 0)} km²</strong>.
              </p>
              <div className="fm-hook" id="on-washington">
                <strong>The march ON Washington: not defined yet.</strong> This map ends when each person arrives. Where people gather, for how long, and what they ask for is still to be decided, and nothing on this map guesses at it.
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

const CURVE_W = 320
const CURVE_H = 120
const CURVE_PAD = { l: 34, r: 8, t: 10, b: 22 }
const CURVE_POINTS = 300
const CURVE_FONT = 9

function ArrivalCurve({ meta, t, arrivedNow }: { meta: MarchMeta; t: number; arrivedNow: number }) {
  const cum = meta.arrived_cum
  const n = cum.length
  const total = cum[n - 1]
  const sx = (d: number) => CURVE_PAD.l + ((CURVE_W - CURVE_PAD.l - CURVE_PAD.r) * d) / (n - 1)
  const sy = (v: number) => CURVE_PAD.t + (CURVE_H - CURVE_PAD.t - CURVE_PAD.b) * (1 - v / total)
  const path = useMemo(() => {
    const step = Math.max(1, Math.floor(n / CURVE_POINTS))
    let d = `M${sx(0)},${sy(0)}`
    for (let i = 0; i < n; i += step) d += `L${sx(i).toFixed(1)},${sy(cum[i]).toFixed(1)}`
    d += `L${sx(n - 1).toFixed(1)},${sy(total).toFixed(1)}`
    return d
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta])
  const hd = meta.half_day - 1
  const xx = sx(Math.min(t, n - 1))
  return (
    <svg className="fm-curve" viewBox={`0 0 ${CURVE_W} ${CURVE_H}`} role="img" aria-label={`Arrival curve: half of all marchers have arrived by Day ${meta.half_day}; the last arrives on Day ${fmtInt(meta.last_day)}.`}>
      <line x1={CURVE_PAD.l} y1={sy(0)} x2={CURVE_W - CURVE_PAD.r} y2={sy(0)} stroke="#2b3038" />
      <line x1={CURVE_PAD.l} y1={sy(total)} x2={CURVE_W - CURVE_PAD.r} y2={sy(total)} stroke="#2b3038" strokeDasharray="2 3" />
      <path d={`${path}L${sx(n - 1)},${sy(0)}Z`} fill="#e3261b" fillOpacity={0.18} />
      <path d={path} fill="none" stroke="#f4f4f1" strokeWidth={1.6} />
      <line x1={sx(hd)} y1={CURVE_PAD.t} x2={sx(hd)} y2={sy(0)} stroke="#a4abb6" strokeDasharray="2 3" />
      <text x={sx(hd) + 4} y={sy(total / 2) + 14} fill="#a4abb6" fontSize={CURVE_FONT} fontFamily="IBM Plex Mono, monospace">half by Day {meta.half_day}</text>
      <text x={CURVE_PAD.l - 4} y={sy(total) + 3} fill="#a4abb6" fontSize={CURVE_FONT} textAnchor="end" fontFamily="IBM Plex Mono, monospace">{(total / 1e6).toFixed(1)}M</text>
      <text x={CURVE_PAD.l - 4} y={sy(0) + 3} fill="#a4abb6" fontSize={CURVE_FONT} textAnchor="end" fontFamily="IBM Plex Mono, monospace">0</text>
      <text x={CURVE_PAD.l} y={CURVE_H - 6} fill="#a4abb6" fontSize={CURVE_FONT} fontFamily="IBM Plex Mono, monospace">Day 1</text>
      <text x={CURVE_W - CURVE_PAD.r} y={CURVE_H - 6} fill="#a4abb6" fontSize={CURVE_FONT} textAnchor="end" fontFamily="IBM Plex Mono, monospace">Day {fmtInt(meta.last_day)}</text>
      <line x1={xx} y1={CURVE_PAD.t} x2={xx} y2={sy(0)} stroke="#e3261b" strokeWidth={1.5} />
      <circle cx={xx} cy={sy(arrivedNow)} r={3.5} fill="#e3261b" />
    </svg>
  )
}
