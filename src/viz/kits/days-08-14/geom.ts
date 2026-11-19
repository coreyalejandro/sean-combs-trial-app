// Builder 2 kit: layout sizes derived from the shared constants in src/lib/viz/layout.ts
// (the no-hand-typed-numbers rule allows only -1, 0, 1 and 2 in day folders).
import { layout } from '@/lib/viz/layout'
import { formatUSD } from '@/lib/viz/format'

const { gap, tap, margin, chartWidth, phoneWidth, fontSize, dot, stroke } = layout

export const g = {
  gap,
  tap,
  half: gap / 2,
  quarter: gap / (2 * 2),
  dot,
  bigDot: dot + 2,
  rowH: tap + gap,
  labelW: margin.left * (2 + 2),
  wideW: chartWidth,
  narrowW: phoneWidth - gap * 2,
  top: margin.top,
  bottom: margin.bottom,
  font: fontSize,
  stroke,
  dash: layout.dashUnconfirmed,
} as const

/** "$600 an hour", "$55,000 a year", "$100,000" from a value and its unit. */
export function money(value: number, unit: string): string {
  const base = formatUSD(value)
  if (/\/\s*hour/i.test(unit)) return `${base} an hour`
  if (/\/\s*year/i.test(unit)) return `${base} a year`
  if (/\/\s*month/i.test(unit)) return `${base} a month`
  return base
}

/** Truncate a label to a number of characters (for SVG labels; full text is always in the panel). */
export function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

/** Break text into lines of at most `max` characters, on spaces (for SVG labels). */
export function wrap(text: string, max: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line)
      line = word
    } else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines
}

/** Approximate characters that fit in a width at a font size (Libre Franklin averages about half an em). */
export const charsFor = (width: number, fontSize: number) => Math.max(1, Math.floor(width / (fontSize / 2 + 1)))

const SHORT = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })
const MONTH_YEAR = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' })
/** "Dec 22" */
export const shortDate = (d: Date) => SHORT.format(d)
/** "December 2011" */
export const monthYear = (d: Date) => MONTH_YEAR.format(d)

/** A reported value as words: money with its period, other values with their unit ("5 days", "about 40 hours"). */
export function valueText(value: number | string | null, unit: string): string {
  if (value === null) return ''
  if (/usd/i.test(unit) && typeof value === 'number') return money(value, unit)
  const v = typeof value === 'string' ? value.replace(/^~\s*/, 'about ').replace(/\s+-\s+/g, ' to ') : value.toLocaleString('en-US')
  if (!unit || /^(date|dates|month|year|years|duration)$/i.test(unit) || String(v).includes(unit)) return String(v)
  if (/^a\.m\.$/i.test(unit)) return `${v} a.m.`
  if (/^hours$/i.test(unit) && /a\.m\.|p\.m\./.test(String(v))) return String(v)
  return `${v} ${unit}`
}
