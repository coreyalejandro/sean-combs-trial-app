// Day 20: one shape per outcome, used in the chart, the phone list and the legend. Always paired with the word.
import { layout } from '@/lib/viz/layout'
import type { Level } from '@/viz/kits/days-15-21/sources'
import type { Outcome } from './select'

export function OutcomeShape({ x, y, r, outcome, level, color = 'var(--ink)' }: { x: number; y: number; r: number; outcome: Outcome; level?: Level; color?: string }) {
  const sw = layout.stroke.mark
  const dash = level && level !== 'high' && level !== 'medium' ? layout.dashUnconfirmed : undefined
  switch (outcome) {
    case 'granted':
      return <circle cx={x} cy={y} r={r} fill={color} stroke={color} strokeWidth={sw} />
    case 'denied':
      return <path d={`M${x - r} ${y - r}L${x + r} ${y + r}M${x + r} ${y - r}L${x - r} ${y + r}`} stroke={color} strokeWidth={layout.stroke.emphasis} strokeLinecap="round" />
    case 'struck':
      return <path d={`M${x - r} ${y - r}h${r * 2}v${r * 2}h${-r * 2}ZM${x - r} ${y + r}L${x + r} ${y - r}`} fill="var(--paper)" stroke={color} strokeWidth={sw} strokeDasharray={dash} />
    case 'pending':
      return <circle cx={x} cy={y} r={r - sw / 2} fill="var(--paper)" stroke={color} strokeWidth={sw} strokeDasharray={dash} />
    case 'reserved':
      return <path d={`M${x} ${y - r - 1}L${x + r + 1} ${y}L${x} ${y + r + 1}L${x - r - 1} ${y}Z`} fill="var(--paper)" stroke={color} strokeWidth={sw} strokeDasharray={dash} />
    case 'warning':
      return <path d={`M${x} ${y - r - 1}L${x + r + 1} ${y + r}L${x - r - 1} ${y + r}Z`} fill={color} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
    case 'kept':
      return <rect x={x - r + sw / 2} y={y - r + sw / 2} width={r * 2 - sw} height={r * 2 - sw} fill="var(--paper)" stroke={color} strokeWidth={sw} strokeDasharray={dash} />
    default:
      return <line x1={x} x2={x} y1={y - r * 2} y2={y + r * 2} stroke="var(--neutral)" strokeWidth={layout.stroke.emphasis} strokeDasharray={layout.dashUnconfirmed} />
  }
}

export function ShapeIcon({ outcome, level }: { outcome: Outcome; level?: Level }) {
  const r = layout.dot + 1
  const size = r * (2 + 2)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false">
      <OutcomeShape x={size / 2} y={size / 2} r={r} outcome={outcome} level={level} />
    </svg>
  )
}
