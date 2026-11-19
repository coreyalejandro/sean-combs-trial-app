// Day 8 text version: the long description and table rows, from the same selection as the picture.
import type { TableRow } from './kit/ui'
import { money } from './kit/geom'
import { MODES, gap, type Day08Model, type Mode } from './select'

const years = (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`

export function describe(m: Day08Model): { paragraphs: string[]; rows: TableRow[] } {
  const legal: Mode = 'legal'
  const withGap = m.rows.filter((r) => gap(r, legal) !== null)
  const gaps = withGap.map((r) => gap(r, legal) as number)
  const longest = withGap[gaps.indexOf(Math.max(...gaps))]
  const shortest = withGap[gaps.indexOf(Math.min(...gaps))]
  const missing = m.rows.filter((r) => gap(r, legal) === null)

  const paragraphs = [
    `A dumbbell chart with ${m.rows.length} rows, one per account heard at trial. In each row a black dot marks the year of the earliest event the person described, a red dot marks the year of ${MODES[0].long}, and a red bar joins them, with one white bead for each year in between. A switch moves the red dot to ${MODES[1].long} instead.`,
    withGap.length > 0
      ? `Measured to the first step toward a court or police, the waits run from ${years(Math.min(...gaps))} (${shortest.who}) to ${years(Math.max(...gaps))} (${longest.who}). These gaps are calculated by subtracting one year from the other.`
      : 'No account has both dates reported in coverage.',
    missing.length > 0 ? `Not stated in coverage: ${missing.map((r) => `${r.who} (${r.ends[legal].label.toLowerCase()})`).join('; ')}.` : '',
    m.concepts.length > 0
      ? `Above the chart: the ${m.concepts.length} general patterns Dr. Dawn Hughes described (${m.concepts.map((c) => c.label.toLowerCase()).join(', ')}). She did not evaluate anyone in this case.`
      : '',
  ].filter(Boolean)

  const rows: TableRow[] = []
  for (const r of m.rows) {
    const who = `${r.who}${r.pseudonym ? ' (pseudonym)' : ''}`
    rows.push({ key: `${r.id}-start`, value: r.start.year ?? 'not stated', what: `${who}: ${r.start.label.toLowerCase()}`, fact: r.start.fact })
    for (const mode of MODES) {
      const e = r.ends[mode.id]
      if (mode.id === 'official' && e.fact && r.ends.legal.fact && e.fact.key === r.ends.legal.fact.key) continue
      rows.push({ key: `${r.id}-${mode.id}`, value: e.year ?? 'not stated in coverage', what: `${who}: ${e.label.toLowerCase()} (${mode.label.toLowerCase()})`, fact: e.fact })
    }
    for (const mode of MODES) {
      const n = gap(r, mode.id)
      if (n === null) continue
      if (mode.id === 'official' && r.ends.official.fact?.key === r.ends.legal.fact?.key) continue
      rows.push({ key: `${r.id}-gap-${mode.id}`, value: years(n), what: `${who}: wait to ${mode.label.toLowerCase()}`, fact: null, calc: `${r.ends[mode.id].year} minus ${r.start.year}` })
    }
  }
  for (const f of m.fees) {
    rows.push({ key: f.key, value: typeof f.value === 'number' ? money(f.value, f.unit) : String(f.value), what: f.text, fact: f })
  }
  return { paragraphs, rows }
}
