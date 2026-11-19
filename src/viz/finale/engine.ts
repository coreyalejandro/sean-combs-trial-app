// The march engine: where every dot is at any moment, ported from the migration map's viewer/app.js
// (which mirrors the simulation's own src/marchsim/positions.py). No React, no deck.gl: the map, the
// unit tests and the counters all use these functions, so dragging to any day is exact.
//
// Data: public/finale-data/march.qbin (gzip of quantized arrays) + public/finale-data/meta.json.
// The packing is done by src/viz/finale/prep/prepare_finale_data.py; this file undoes it.

export interface LayoutEntry {
  name: string
  type: 'u1' | 'u2' | 'u4' | 'i2'
  enc: 'plain' | 'parent' | 'prev'
  offset: number
  count: number
}

export interface Quantization {
  node_box: [number, number, number, number]
  dot_box: [number, number, number, number]
  coord_max: number
  dist_step_km: number
  conn_step_km: number
  seg_step_km: number
  daily_step_km: number
  daily_min_km: number
  arrive_steps_per_day: number
  no_county: number
  width_max: number
  zone_steps: number
}

export interface JobRow { job: string; share: number; low: number; high: number; workers: number }

export interface MarchMeta {
  bytes: number
  layout: LayoutEntry[]
  q: Quantization
  people_per_dot: number
  mall: [number, number]
  iad: [number, number]
  arrival_zone_km: number
  walk_start_hour: number
  walk_hours: number
  start_date: string | null
  half_day: number
  last_day: number
  arrived_cum: number[]
  away_by_day: number[]
  waiting_by_day: number[]
  totals: { central: number; low: number; high: number }
  jobs: JobRow[]
  jobs_method: string
  share_of_adults: number
  states: { name: string; abbr: string }[]
  counties: { name: string[]; state: string[]; pop: number[] }
  needs: { water_l: number; people_per_toilet: number; shelter_m2: number; standing_m2: number; mall_km2: number }
  road: Record<string, number | string>
  queue: { people_who_waited_at_a_full_road: number; longest_wait_days: number }
  states_geo: GeoJSON.FeatureCollection
}

export interface MarchData {
  N: number
  NN: number
  nodeLon: Float32Array
  nodeLat: Float32Array
  nodeParent: Int32Array
  nodeDist: Float32Array
  nodeCounty: Int32Array
  nodeWidth: Uint8Array
  dotLon: Float32Array
  dotLat: Float32Array
  dotNode: Int32Array
  dotConn: Float32Array
  dotTotal: Float32Array
  dotDaily: Float32Array
  dotArrive: Float32Array
  dotSegOff: Int32Array
  dotSegCnt: Uint8Array
  dotHome: Uint16Array
  dotRest: Uint8Array
  dotAir: Uint8Array
  segDay: Uint8Array
  segS: Float32Array
}

const GZIP_MAGIC_0 = 0x1f
const GZIP_MAGIC_1 = 0x8b
const BYTE_BITS = 8
const BYTE_MASK = 0xff
const SIZE: Record<LayoutEntry['type'], number> = { u1: 1, u2: 2, u4: 4, i2: 2 }

/** The file is gzip; a server may already have inflated it (Content-Encoding), so check the magic bytes. */
export async function inflate(buf: ArrayBuffer): Promise<ArrayBuffer> {
  const head = new Uint8Array(buf, 0, Math.min(2, buf.byteLength))
  if (head[0] !== GZIP_MAGIC_0 || head[1] !== GZIP_MAGIC_1) return buf
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Response(stream).arrayBuffer()
}

/** Read one byte-planar array as plain unsigned integers (Float64 so 32-bit values stay exact). */
function readPlanar(bytes: Uint8Array, e: LayoutEntry): Float64Array {
  const k = SIZE[e.type]
  const n = e.count
  const out = new Float64Array(n)
  for (let b = 0; b < k; b++) {
    const base = e.offset + b * n
    const mul = 2 ** (BYTE_BITS * b)
    for (let i = 0; i < n; i++) out[i] += bytes[base + i] * mul
  }
  return out
}

/** Undo the packing: planar bytes, delta encodings and quantization steps. */
export function decode(raw: ArrayBuffer, meta: MarchMeta): MarchData {
  const bytes = new Uint8Array(raw)
  const q = meta.q
  const L = new Map(meta.layout.map((e) => [e.name, e]))
  const get = (name: string) => {
    const e = L.get(name)
    if (!e) throw new Error(`march data has no array "${name}"`)
    return { e, v: readPlanar(bytes, e) }
  }
  const up = get('node_up').v
  const NN = up.length
  const nodeParent = new Int32Array(NN)
  nodeParent[0] = -1
  for (let v = 1; v < NN; v++) nodeParent[v] = v - up[v]

  const undo = (name: string) => {
    const { e, v } = get(name)
    const mod = 2 ** (BYTE_BITS * SIZE[e.type])
    if (e.enc === 'parent') {
      for (let i = 1; i < v.length; i++) v[i] = (v[i] + v[nodeParent[i]]) % mod
    } else if (e.enc === 'prev') {
      for (let i = 1; i < v.length; i++) v[i] = (v[i] + v[i - 1]) % mod
    }
    if (e.type === 'i2') for (let i = 0; i < v.length; i++) if (v[i] >= mod / 2) v[i] -= mod
    return v
  }

  const nb = q.node_box
  const db = q.dot_box
  const nx = undo('node_x')
  const ny = undo('node_y')
  const nodeLon = new Float32Array(NN)
  const nodeLat = new Float32Array(NN)
  for (let i = 0; i < NN; i++) {
    nodeLon[i] = nb[0] + (nx[i] / q.coord_max) * (nb[2] - nb[0])
    nodeLat[i] = nb[1] + (ny[i] / q.coord_max) * (nb[3] - nb[1])
  }
  const edge = undo('node_edge')
  const distQ = new Float64Array(NN)
  const nodeDist = new Float32Array(NN)
  for (let v = 0; v < NN; v++) {
    distQ[v] = v === 0 ? edge[0] : distQ[nodeParent[v]] + edge[v]
    nodeDist[v] = distQ[v] * q.dist_step_km
  }
  const cty = undo('node_county')
  const nodeCounty = new Int32Array(NN)
  for (let i = 0; i < NN; i++) nodeCounty[i] = cty[i] === q.no_county ? -1 : cty[i]
  const nodeWidth = Uint8Array.from(undo('node_width'))

  const dx = undo('dot_x')
  const dy = undo('dot_y')
  const N = dx.length
  const dotLon = new Float32Array(N)
  const dotLat = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    dotLon[i] = db[0] + (dx[i] / q.coord_max) * (db[2] - db[0])
    dotLat[i] = db[1] + (dy[i] / q.coord_max) * (db[3] - db[1])
  }
  const dotNode = Int32Array.from(undo('dot_node'))
  const conn = undo('dot_conn')
  const resid = undo('dot_resid')
  const daily = undo('dot_daily')
  const arrive = undo('dot_arrive')
  const segCnt = Uint8Array.from(undo('dot_segcnt'))
  const home = Uint16Array.from(undo('dot_home'))
  const flags = undo('dot_flags')
  const connPerDist = q.conn_step_km / q.dist_step_km
  const dotConn = new Float32Array(N)
  const dotTotal = new Float32Array(N)
  const dotDaily = new Float32Array(N)
  const dotArrive = new Float32Array(N)
  const dotRest = new Uint8Array(N)
  const dotAir = new Uint8Array(N)
  const dotSegOff = new Int32Array(N)
  const REST_BITS = 0b111
  const AIR_SHIFT = 3
  let off = 0
  for (let i = 0; i < N; i++) {
    dotConn[i] = conn[i] * q.conn_step_km
    const totalQ = Math.round(conn[i] * connPerDist) + distQ[dotNode[i]] - q.zone_steps + resid[i]
    dotTotal[i] = totalQ * q.dist_step_km
    dotDaily[i] = q.daily_min_km + daily[i] * q.daily_step_km
    dotArrive[i] = arrive[i] / q.arrive_steps_per_day
    dotRest[i] = flags[i] & REST_BITS
    dotAir[i] = (flags[i] >> AIR_SHIFT) & 1
    dotSegOff[i] = off
    off += segCnt[i]
  }
  const segDay = Uint8Array.from(undo('seg_day'))
  const segQ = undo('seg_s')
  const segS = new Float32Array(segQ.length)
  for (let i = 0; i < segQ.length; i++) segS[i] = segQ[i] * q.seg_step_km
  if (off !== segS.length) throw new Error('march data: segment counts do not add up')
  return {
    N, NN, nodeLon, nodeLat, nodeParent, nodeDist, nodeCounty, nodeWidth,
    dotLon, dotLat, dotNode, dotConn, dotTotal, dotDaily, dotArrive, dotSegOff,
    dotSegCnt: segCnt, dotHome: home, dotRest, dotAir, segDay, segS,
  }
}

/* ---------- the clock (mirrors positions.py) ---------- */
const WEEK = 7
const HOURS = 24
const EPS = 1e-3

function upto(x: number, rw: number) {
  return x - 1 >= rw ? Math.floor((x - 1 - rw) / WEEK) + 1 : 0
}
function restBetween(a: number, b: number, rw: number) {
  if (b <= a) return 0
  let c = upto(b, rw) - upto(a, rw)
  if (rw === 0 && a <= 0 && b > 0) c -= 1
  return c
}
function isRest(d: number, rw: number) {
  return d > 0 && d % WEEK === rw
}

export interface Counts { gone: number; road: number; wait: number; arr: number }
export interface Views { leaving: boolean; passing: boolean; arriving: boolean }
export type RGBA = [number, number, number, number]

/** Colours from the viewer (LIFE tokens): at home grey, walking pale blue, waiting red, arrived white. */
export const DOT_COLORS: Record<'home' | 'walk' | 'wait' | 'arr', RGBA> = {
  home: [125, 131, 140, 200],
  walk: [201, 214, 230, 215],
  wait: [227, 38, 27, 255],
  arr: [255, 255, 255, 230],
}

const LOG = 18 // binary lifting depth: 2^18 > longest root path
const GOLDEN = 2.399963229728653 // golden angle, for the arrival crowd's sunflower layout
const CROWD_SPREAD_DEG = 0.003
const HALF = 0.5
const FLIGHT_DAYS = 0.3
const END_EPS = 0.001

export class MarchEngine {
  readonly d: MarchData
  readonly m: MarchMeta
  readonly pos: Float32Array
  readonly col: Uint8Array
  readonly rankOf: Int32Array
  readonly counts: Counts = { gone: 0, road: 0, wait: 0, arr: 0 }
  private up: Int32Array
  private distTmp = { s: 0, waiting: false }

  constructor(data: MarchData, meta: MarchMeta) {
    this.d = data
    this.m = meta
    this.pos = new Float32Array(data.N * 2)
    this.col = new Uint8Array(data.N * 4)
    const NN = data.NN
    const up = new Int32Array(NN * LOG)
    for (let v = 0; v < NN; v++) up[v] = data.nodeParent[v]
    for (let k = 1; k < LOG; k++) {
      const base = k * NN
      const prev = (k - 1) * NN
      for (let v = 0; v < NN; v++) {
        const a = up[prev + v]
        up[base + v] = a >= 0 ? up[prev + a] : -1
      }
    }
    this.up = up
    const order = Array.from({ length: data.N }, (_, k) => k)
    order.sort((a, b) => data.dotArrive[a] - data.dotArrive[b])
    this.rankOf = new Int32Array(data.N)
    order.forEach((k, r) => { this.rankOf[k] = r })
  }

  /** The end of the march: the last moment of the last arrival's day (Day last_day), in days. */
  get maxT(): number {
    return this.m.last_day - END_EPS
  }

  private walkProgress(a: number, t: number, rw: number) {
    if (t <= a) return 0
    const day = Math.floor(t)
    const full = day - a - restBetween(a, day, rw)
    let frac = 0
    if (!isRest(day, rw)) {
      const h = (t - day) * HOURS
      frac = Math.min(Math.max((h - this.m.walk_start_hour) / this.m.walk_hours, 0), 1)
    }
    return full + frac
  }

  /** Distance walked by dot i at time t, and whether it is waiting at a full road. */
  distAt(i: number, t: number) {
    const D = this.d
    const k0 = D.dotSegOff[i]
    const k1 = k0 + D.dotSegCnt[i]
    let k = k0
    for (let j = k0; j < k1; j++) {
      if (D.segDay[j] <= t) k = j
      else break
    }
    const nom = D.segS[k] + D.dotDaily[i] * this.walkProgress(D.segDay[k], t, D.dotRest[i])
    const cap = k + 1 < k1 ? D.segS[k + 1] : D.dotTotal[i]
    this.distTmp.s = Math.min(nom, cap)
    this.distTmp.waiting = k + 1 < k1 && nom > cap + EPS
    return this.distTmp
  }

  /** Furthest ancestor u of node v (inclusive) still at least `rem` km from the Mall. */
  private climb(v: number, rem: number) {
    const dist = this.d.nodeDist
    const NN = this.d.NN
    let u = v
    for (let k = LOG - 1; k >= 0; k--) {
      const a = this.up[k * NN + u]
      if (a >= 0 && dist[a] >= rem) u = a
    }
    return u
  }

  private setCol(i: number, c: RGBA, alpha?: number) {
    const o = i * 4
    this.col[o] = c[0]
    this.col[o + 1] = c[1]
    this.col[o + 2] = c[2]
    this.col[o + 3] = alpha === undefined ? c[3] : alpha
  }

  /** Place every dot at time t (days since the start; Day 1 = [0, 1)) and count them. */
  computeFrame(t: number, views: Views = { leaving: true, passing: true, arriving: true }): Counts {
    const D = this.d
    const M = this.m
    const mall = M.mall
    const cosL = Math.cos((mall[1] * Math.PI) / 180)
    const departT = M.walk_start_hour / HOURS
    const c = this.counts
    c.gone = 0
    c.road = 0
    c.wait = 0
    c.arr = 0
    for (let i = 0; i < D.N; i++) {
      let x: number
      let y: number
      if (t >= D.dotArrive[i]) {
        const r = this.rankOf[i]
        const rad = CROWD_SPREAD_DEG * Math.sqrt(r + HALF)
        const th = r * GOLDEN
        x = mall[0] + (rad * Math.cos(th)) / cosL
        y = mall[1] + rad * Math.sin(th)
        this.setCol(i, DOT_COLORS.arr, views.arriving ? DOT_COLORS.arr[3] : 0)
        c.arr++
        c.gone++
      } else if (D.dotAir[i]) {
        const f0 = D.dotArrive[i] - FLIGHT_DAYS
        if (t < f0) {
          x = D.dotLon[i]
          y = D.dotLat[i]
        } else {
          const f = (t - f0) / FLIGHT_DAYS
          x = D.dotLon[i] + (M.iad[0] - D.dotLon[i]) * f
          y = D.dotLat[i] + (M.iad[1] - D.dotLat[i]) * f
        }
        if (t < departT) this.setCol(i, DOT_COLORS.home)
        else {
          this.setCol(i, DOT_COLORS.walk)
          c.gone++
          c.road++
        }
      } else {
        const st = this.distAt(i, t)
        const s = st.s
        const conn = D.dotConn[i]
        const node = D.dotNode[i]
        if (s < conn) {
          const g = conn > 0 ? s / conn : 1
          x = D.dotLon[i] + (D.nodeLon[node] - D.dotLon[i]) * g
          y = D.dotLat[i] + (D.nodeLat[node] - D.dotLat[i]) * g
        } else {
          const rem = D.dotTotal[i] - s + M.arrival_zone_km
          const u = this.climb(node, rem)
          const p = D.nodeParent[u]
          if (p < 0) {
            x = D.nodeLon[u]
            y = D.nodeLat[u]
          } else {
            const du = D.nodeDist[u]
            const dp = D.nodeDist[p]
            let h = du - dp > EPS * EPS * EPS ? (du - rem) / (du - dp) : 0
            h = h < 0 ? 0 : h > 1 ? 1 : h
            x = D.nodeLon[u] + (D.nodeLon[p] - D.nodeLon[u]) * h
            y = D.nodeLat[u] + (D.nodeLat[p] - D.nodeLat[u]) * h
          }
        }
        if (t < departT) this.setCol(i, DOT_COLORS.home)
        else if (st.waiting) {
          this.setCol(i, DOT_COLORS.wait)
          c.wait++
          c.road++
          c.gone++
        } else {
          this.setCol(i, DOT_COLORS.walk)
          c.road++
          c.gone++
        }
      }
      this.pos[2 * i] = x
      this.pos[2 * i + 1] = y
    }
    return c
  }

  /** Where marchers sleep tonight (counties other than their own), for "The passing through". */
  tonight(day: number, top = 6) {
    const D = this.d
    const t = day + 1 - EPS
    const ccount = this.m.counties.name.length
    const arr = new Int32Array(ccount)
    let inHome = 0
    for (let i = 0; i < D.N; i++) {
      if (D.dotAir[i] || t >= D.dotArrive[i]) continue
      const s = this.distAt(i, t).s
      let c: number
      if (s < D.dotConn[i]) c = D.dotHome[i]
      else {
        const rem = D.dotTotal[i] - s + this.m.arrival_zone_km
        const u = this.climb(D.dotNode[i], rem)
        const p = D.nodeParent[u]
        c = D.nodeCounty[p >= 0 ? p : u]
      }
      if (c >= 0 && c !== D.dotHome[i]) arr[c]++
      else inHome++
    }
    const rows: Array<{ county: number; people: number }> = []
    let total = 0
    for (let k = 0; k < ccount; k++) {
      if (arr[k] > 0) {
        rows.push({ county: k, people: arr[k] * this.m.people_per_dot })
        total += arr[k]
      }
    }
    rows.sort((a, b) => b.people - a.people)
    // inHomeCounty: marchers still on their way but not yet out of their own county; they are not counted as away.
    return { rows: rows.slice(0, top), total: total * this.m.people_per_dot, places: rows.length, inHomeCounty: inHome * this.m.people_per_dot }
  }

  /** Road stretches that 20,000+ people pass along, with a width in pixels (viewer rule). */
  corridors(minPx: number, maxPx: number) {
    const D = this.d
    const out: Array<{ p: [[number, number], [number, number]]; w: number }> = []
    for (let v = 0; v < D.NN; v++) {
      const code = D.nodeWidth[v]
      const p = D.nodeParent[v]
      if (code > 0 && p >= 0) {
        out.push({
          p: [[D.nodeLon[v], D.nodeLat[v]], [D.nodeLon[p], D.nodeLat[p]]],
          w: minPx + (maxPx - minPx) * (code / this.m.q.width_max),
        })
      }
    }
    return out
  }
}

/** Day label: "Day 1", "Day 2"... until a start date is chosen (DESIGN_V2: Corey's decision). */
export function dayNumber(t: number): number {
  return Math.floor(t) + 1
}

/** "08:00 · walking" style clock line, from the viewer. */
export function hourText(t: number, walkStart: number, walkHours: number): string {
  const day = Math.floor(t)
  const h = (t - day) * HOURS
  if (day === 0 && h < walkStart) return 'Morning · everyone is still home'
  const hh = Math.floor(h)
  const mm = Math.floor((h - hh) * 60)
  const pad = (n: number) => (n < 10 ? '0' : '') + n
  const clock = `${pad(hh)}:${pad(mm)}`
  if (h < walkStart) return `${clock} · before the day's walk`
  if (h < walkStart + walkHours + 1) return `${clock} · walking`
  return `${clock} · resting`
}

/**
 * The march ON Washington: not defined yet. DESIGN_V2 leaves it to Corey. When it is defined, compute
 * where arrived people gather and what they do from t and the arrival order (rankOf). Must stay a no-op.
 */
export function onWashington(): null {
  return null
}
