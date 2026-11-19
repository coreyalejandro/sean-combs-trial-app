// Number, range and date formatters shared by every visualization.
// Formatters only format values that came from the data; they never supply values.

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const int = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const dec1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

export function formatUSD(n: number): string {
  return usd0.format(n)
}

/** "$1.2 million", "$100,000" */
export function formatUSDShort(n: number): string {
  const million = 1e6
  if (Math.abs(n) >= million) return `$${dec1.format(n / million)} million`
  return usd0.format(n)
}

export function formatInt(n: number): string {
  return int.format(n)
}

/** "25 to 30" (DESIGN_29 wording: never an en dash in prose). */
export function formatRange(low: number | string, high: number | string, unit = ''): string {
  return `${low} to ${high}${unit ? ' ' + unit : ''}`
}

export function about(text: string): string {
  return `about ${text}`
}

/** Display a reported value as text: numbers get thousands separators; text values pass through. */
export function formatValue(value: number | string, unit: string): string {
  if (typeof value === 'number') {
    if (/usd/i.test(unit)) return formatUSD(value)
    return `${formatInt(value)}${unit ? ' ' + unit : ''}`
  }
  return unit && !value.includes(unit) ? `${value} ${unit}` : value
}

/** Parse a reported value to a number when it is one ("~190" -> 190, "8-10" -> null). */
export function toNumber(value: number | string): number | null {
  if (typeof value === 'number') return value
  const m = value.replace(/[~,$\s]/g, '').match(/^-?\d+(\.\d+)?$/)
  return m ? Number(m[0]) : null
}
