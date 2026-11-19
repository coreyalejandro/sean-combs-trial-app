// Number formats shared by the finale's server pages and its client map (no data imports here,
// so the client bundle stays small).
const MILLION = 1e6
const TEN_THOUSAND = 1e4
const THOUSAND = 1e3
const PERCENT = 100

/** "78.4 million", "285,000", "950": the migration viewer's people format. */
export function fmtPeople(x: number): string {
  if (x >= MILLION) return `${(x / MILLION).toFixed(1)} million`
  if (x >= TEN_THOUSAND) return `${Math.round(x / THOUSAND).toLocaleString('en-US')},000`
  return Math.round(x).toLocaleString('en-US')
}

export function fmtInt(x: number): string {
  return Math.round(x).toLocaleString('en-US')
}

export function pct(share: number, digits = 0): string {
  return `${(share * PERCENT).toFixed(digits)}%`
}

export function fmtNum(x: number, digits: number): string {
  return x.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
