// SVG confidence marks for inside a chart: the same four looks as the shell's ConfidenceMark
// (solid = two or more outlets, hollow = one outlet, dashed = one outlet unconfirmed, split = outlets disagree).
import { layout } from '@/lib/viz/layout'
import type { Level } from './sources'

export function ConfDot({ cx, cy, r, level, color = 'currentColor' }: { cx: number; cy: number; r: number; level: Level; color?: string }) {
  const sw = layout.stroke.mark
  if (level === 'high') return <circle cx={cx} cy={cy} r={r} fill={color} stroke={color} strokeWidth={sw} />
  if (level === 'medium') return <circle cx={cx} cy={cy} r={r - sw / 2} fill="var(--paper)" stroke={color} strokeWidth={sw} />
  if (level === 'low') return <circle cx={cx} cy={cy} r={r - sw / 2} fill="var(--paper)" stroke={color} strokeWidth={sw} strokeDasharray={layout.dashUnconfirmed} />
  return (
    <g>
      <circle cx={cx} cy={cy} r={r - sw / 2} fill="var(--paper)" stroke={color} strokeWidth={sw} />
      <path d={`M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} Z`} fill={color} />
    </g>
  )
}

/** Fill and stroke for a band or bar by confidence: solid fill, outline, dashed outline, or hatch. */
export function confPaint(level: Level, color: string, hatchId: string) {
  if (level === 'high') return { fill: color, stroke: color, strokeDasharray: undefined, fillOpacity: 1 }
  if (level === 'medium') return { fill: color, stroke: color, strokeDasharray: undefined, fillOpacity: 1 / (2 + 1) }
  if (level === 'low') return { fill: `url(#${hatchId})`, stroke: color, strokeDasharray: layout.dashUnconfirmed, fillOpacity: 1 }
  return { fill: `url(#${hatchId})`, stroke: color, strokeDasharray: undefined, fillOpacity: 1 }
}

/** A diagonal hatch pattern used for "one outlet, unconfirmed" and "outlets disagree" fills. */
export function Hatch({ id, color }: { id: string; color: string }) {
  const s = layout.dot + 1
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={s} height={s}>
      <rect width={s} height={s} fill="var(--paper)" />
      <path d={`M0 ${s} L${s} 0 M${-s / 2} ${s / 2} L${s / 2} ${-s / 2} M${s / 2} ${s + s / 2} L${s + s / 2} ${s / 2}`} stroke={color} strokeWidth={layout.stroke.hairline + layout.stroke.hairline / 2} />
    </pattern>
  )
}
