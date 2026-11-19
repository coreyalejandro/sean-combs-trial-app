// @vitest-environment node
// The finale's engine against its own data: the quantized file decodes, the counts match the simulation's
// daily series, and (when the original migration-map build is on this machine) every dot is where the
// original viewer would put it, to within the quantization step.
import fs from 'node:fs'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { decode, inflate, MarchEngine, onWashington, type MarchData, type MarchMeta } from './engine'

const PUB = path.resolve(__dirname, '../../../public/finale-data')
const ORIGINAL = '/mnt/user-data/outputs/migration-map/build/viewer/data'

let meta: MarchMeta
let data: MarchData
let engine: MarchEngine

beforeAll(async () => {
  meta = JSON.parse(fs.readFileSync(path.join(PUB, 'meta.json'), 'utf8'))
  const file = fs.readFileSync(path.join(PUB, 'march.qbin'))
  const raw = await inflate(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength))
  expect(raw.byteLength).toBe(meta.bytes)
  data = decode(raw, meta)
  engine = new MarchEngine(data, meta)
})

describe('finale data', () => {
  it('has one dot per 1,000 people and adds up to the CDC-based total', () => {
    expect(data.N * meta.people_per_dot).toBeCloseTo(meta.totals.central, -4)
    expect(data.nodeParent[0]).toBe(-1)
    for (let v = 1; v < data.NN; v += 997) expect(data.nodeParent[v]).toBeLessThan(v)
  })

  it('everyone is home before the first morning and gone after it', () => {
    const before = engine.computeFrame(0.1)
    expect(before.gone).toBeLessThan(data.N * 0.02) // only dots already inside the arrival zone count
    const after = engine.computeFrame(0.6)
    expect(after.gone).toBe(data.N)
  })

  it('arrivals at the end of key days match the simulation daily series', () => {
    for (const day of [1, meta.half_day, meta.last_day]) {
      const c = engine.computeFrame(day - 1e-6)
      const expected = meta.arrived_cum[day - 1] / meta.people_per_dot
      expect(Math.abs(c.arr - expected) / data.N).toBeLessThan(0.002)
    }
    expect(engine.computeFrame(engine.maxT).arr).toBe(data.N)
  })

  it('the passing-through panel finds marchers sleeping away from home', () => {
    const res = engine.tonight(meta.half_day - 1)
    expect(res.total).toBeGreaterThan(0)
    expect(res.rows.length).toBeGreaterThan(0)
    expect(res.rows[0].people).toBeGreaterThanOrEqual(res.rows[res.rows.length - 1].people)
  })

  it('changes when the data changes (arrivals moved later)', () => {
    const shifted = { ...data, dotArrive: data.dotArrive.map((a) => a + meta.half_day) }
    const e2 = new MarchEngine(shifted, meta)
    expect(e2.computeFrame(meta.half_day).arr).toBeLessThan(engine.computeFrame(meta.half_day).arr)
  })

  it('leaves the march ON Washington undefined', () => {
    expect(onWashington()).toBeNull()
  })
})

describe.runIf(fs.existsSync(path.join(ORIGINAL, 'march.bin')))('matches the original viewer data', () => {
  it('puts every dot within a few hundred metres of where the original viewer puts it', () => {
    const om = JSON.parse(fs.readFileSync(path.join(ORIGINAL, 'meta.json'), 'utf8'))
    const buf = fs.readFileSync(path.join(ORIGINAL, 'march.bin'))
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const T = { f4: Float32Array, i4: Int32Array, i2: Int16Array, u2: Uint16Array, u1: Uint8Array } as const
    const A: Record<string, ArrayLike<number>> = {}
    for (const e of om.layout as Array<{ name: string; type: keyof typeof T; offset: number; count: number }>) {
      A[e.name] = new T[e.type](ab, e.offset, e.count)
    }
    const orig: MarchData = {
      N: A.dot_lon.length, NN: A.node_lon.length,
      nodeLon: A.node_lon as Float32Array, nodeLat: A.node_lat as Float32Array, nodeParent: A.node_parent as Int32Array,
      nodeDist: A.node_dist as Float32Array, nodeCounty: Int32Array.from(A.node_county), nodeWidth: new Uint8Array(A.node_lon.length),
      dotLon: A.dot_lon as Float32Array, dotLat: A.dot_lat as Float32Array, dotNode: A.dot_node as Int32Array,
      dotConn: A.dot_conn as Float32Array, dotTotal: A.dot_total as Float32Array, dotDaily: A.dot_daily as Float32Array,
      dotArrive: A.dot_arrive as Float32Array, dotSegOff: A.dot_segoff as Int32Array, dotSegCnt: Uint8Array.from(A.dot_segcnt),
      dotHome: Uint16Array.from(A.dot_home), dotRest: A.dot_rest as Uint8Array, dotAir: A.dot_air as Uint8Array,
      segDay: Uint8Array.from(A.seg_day), segS: A.seg_s as Float32Array,
    }
    const e0 = new MarchEngine(orig, meta)
    for (const t of [0.5, 3.4, 20.45, meta.half_day - 0.5, 300.4]) {
      const c0 = { ...e0.computeFrame(t) }
      const c1 = { ...engine.computeFrame(t) }
      for (const k of ['gone', 'road', 'wait', 'arr'] as const) expect(Math.abs(c1[k] - c0[k])).toBeLessThanOrEqual(data.N * 0.003)
      let far = 0
      for (let i = 0; i < data.N; i++) {
        if (t >= orig.dotArrive[i] || t >= data.dotArrive[i]) continue // the crowd at the Mall is ordered by rank
        const dLon = Math.abs(e0.pos[2 * i] - engine.pos[2 * i])
        const dLat = Math.abs(e0.pos[2 * i + 1] - engine.pos[2 * i + 1])
        if (dLon > 0.01 || dLat > 0.01) far++ // about 1 km
      }
      expect(far / data.N).toBeLessThan(0.002)
    }
  })
})
