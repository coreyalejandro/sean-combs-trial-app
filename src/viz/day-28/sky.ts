// Day 28 constellation geometry: x = the day a witness first took the stand, y = their group band,
// star size = days on the stand. Event lines chain each event's witnesses in the order they testified.
import { scaleLinear, scaleSqrt } from 'd3'
import { layout } from '@/lib/viz/layout'
import { EVENTS, GROUPS, GROUP_LABEL, type Day28Selection } from './select'

export interface StarMark {
  id: string
  x: number
  y: number
  r: number
  group: string
  label: string
  aria: string
  pseudonym: boolean
}

export interface SkyGeometry {
  width: number
  height: number
  stars: StarMark[]
  bands: Array<{ group: string; label: string; y: number }>
  lines: Array<{ key: string; event: string; d: string }>
  ticks: Array<{ x: number; label: string }>
  axisY: number
  narrow: boolean
}

export function skyGeometry(sel: Day28Selection, width: number, narrow: boolean): SkyGeometry {

  const { margin, tap, gap, dot } = layout
  const band = narrow ? tap : tap + gap
  const top = margin.top + (narrow ? gap : gap * 2)
  const used = GROUPS.filter((g) => sel.stars.some((s) => s.w.group === g))
  const height = top + used.length * band + margin.bottom
  const x = scaleLinear().domain([1, sel.lastDay]).range([narrow ? margin.right : margin.left * 2 + tap * 2, width - margin.right])
  const maxDays = Math.max(...sel.stars.map((s) => s.w.days.length))
  const r = scaleSqrt().domain([1, maxDays]).range([dot - 2, dot * 2 + 1])
  const bands = used.map((g, i) => ({ group: g, label: GROUP_LABEL[g], y: top + i * band + band / 2 }))
  const slot = new Map<string, number>()
  const stars: StarMark[] = sel.stars.map((s) => {
    const b = bands.find((x2) => x2.group === s.w.group)
    const k = `${s.w.group}-${s.w.first_day}`
    const n = slot.get(k) ?? 0
    slot.set(k, n + 1)
    const dy = n === 0 ? 0 : (n % 2 === 1 ? -1 : 1) * Math.ceil(n / 2) * (dot * 2 + 2)
    const dx = n * (dot * 2 + 2)
    const days = s.w.days.length
    return {
      id: s.w.id,
      x: x(s.w.first_day) + dx,
      y: (b?.y ?? top) + dy,
      r: r(days),
      group: s.w.group,
      label: s.w.display_name,
      pseudonym: s.w.pseudonym,
      aria: `${s.w.display_name}${s.w.pseudonym ? ' (pseudonym)' : ''}: witness ${s.order} of ${sel.total}, first on the stand on Day ${s.w.first_day}, ${days} ${days === 1 ? 'day' : 'days'} on the stand${s.w.immunity ? ', testified with immunity' : ''}.`,
    }
  })
  const lines = EVENTS.map((e) => {
    const pts = sel.stars.filter((s) => s.events.includes(e.id)).map((s) => stars.find((m) => m.id === s.w.id)).filter((m): m is StarMark => Boolean(m))
    return { key: e.id, event: e.label, d: pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('') }
  }).filter((l) => l.d.includes('L'))
  const ticks = x.ticks(narrow ? dot - 1 : dot + 2).filter((t) => Number.isInteger(t)).map((t) => ({ x: x(t), label: `Day ${t}` }))
  return { width, height, stars, bands, lines, ticks, axisY: height - margin.bottom / 2, narrow }
}
