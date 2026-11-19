// Day 15 long description and table rows, from the same selection as the picture.
import { formatDate, redactThirdParties } from '@/lib/data'

/** "2016-03-05" -> "March 2016". */
function monthYearOf(iso: string): string {
  const [y, m] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' })
}
import { formatInt, formatUSD, formatUSDShort, formatValue } from '@/lib/viz/format'
import type { TableRow } from '@/viz/kits/days-15-21/VizTable'
import { levelWords, numSources } from '@/viz/kits/days-15-21/sources'
import type { Day15Selection } from './select'
import { usdCents } from './select'

export function describe(sel: Day15Selection): { paragraphs: string[]; rows: TableRow[] } {
  const node = (id: string) => sel.nodes.find((n) => n.id === id)
  const cash = node('cash')
  const garcia = node('garcia')
  const rest = node('rest')
  const sup = node('supervisor')
  const off = node('officer')
  const nda = node('nda')
  const p: string[] = []

  if (cash?.amount) {
    p.push(
      `The picture is a flow diagram (Sankey). One band of ${formatUSD(cash.amount)} in cash (${levelWords(cash.level)}) enters on the left${sel.incidentDate ? `, paid for the video of the hotel incident of ${formatDate(String(sel.incidentDate.value))}` : ''}. Band widths are proportional to dollars.`,
    )
  }
  if (garcia?.amount && rest?.amount) {
    p.push(
      `It splits in two: ${formatUSD(garcia.amount)} kept by Garcia, a hotel security officer on the overnight shift (${levelWords(garcia.level)}), and the other ${formatUSD(rest.amount)} (calculated: ${rest.formula}).`,
    )
  }
  if (sup?.amount && off?.amount) {
    p.push(
      `CNN reported that the other part went ${formatUSD(sup.amount)} to his supervisor and ${formatUSD(off.amount)} to another security officer (one outlet). NBC instead reported ${formatUSD(sup.amount)} as the price his boss first wanted, so the picture marks this split "outlets disagree" and stripes it.`,
    )
  } else if (rest?.amount) {
    p.push('How the rest was divided is not clearly reported, so it is drawn as one striped band.')
  }
  if (nda?.amount) {
    p.push(`A thin dashed line leads from Garcia to the non-disclosure agreement he signed, which set a ${formatUSDShort(nda.amount)} penalty for breaking it (${levelWords(nda.level)}). He testified he did not read it.`)
  }
  p.push(
    'The switch "Show only amounts reported by two or more outlets" removes every part reported by a single outlet, leaving the cash, Garcia\'s share and an undivided remainder.',
  )
  if (sel.payHours && sel.wage) {
    p.push(
      `Under the diagram, a pay ruler compares his share with his wage at the time, ${usdCents.format(Number(sel.wage.value))} an hour (${levelWords(sel.wage.confidence)}): ${sel.payHours.formula} is about ${formatInt(sel.payHours.hours)} hours of work (calculated).`,
    )
  }
  if (sel.steps.length > 0) p.push(`How the deal came together, as Garcia testified: ${sel.steps.join('; ')}.`)

  const rows: TableRow[] = sel.nodes.map((n) => ({
    key: n.id,
    what: n.name + (n.note ? `. ${n.note}` : ''),
    value: n.amount === null ? 'not stated' : `${formatUSD(n.amount)}${n.formula ? ` (calculated: ${n.formula})` : ''}`,
    level: n.level,
    sources: n.sources,
    // The money moved after the incident: the video was handed over the day after the deal, the cash after the papers were signed (CNN).
    when: sel.incidentDate ? `${monthYearOf(String(sel.incidentDate.value))}, after the incident of ${formatDate(String(sel.incidentDate.value), { year: false })}` : undefined,
  }))
  // Reported figures the picture uses outside the flow (the date, the first price, the wage, the penalty).
  for (const num of sel.used) {
    if (/cash .*paid|counted in|kept\b|NDA/i.test(num.what)) continue
    const value = num === sel.wage ? `${usdCents.format(Number(num.value))} an hour` : formatValue(num.value, num.unit)
    rows.push({ key: num.what, what: redactThirdParties(num.what), value, level: num.confidence, sources: numSources(num, sel.pool) })
  }
  if (sel.payHours && sel.wage) {
    rows.push({
      key: 'hours',
      what: 'His share, in hours of that pay',
      value: `about ${formatInt(sel.payHours.hours)} hours (calculated: ${sel.payHours.formula})`,
      level: sel.payHours.level,
      sources: numSources(sel.wage, sel.pool),
    })
  }
  return { paragraphs: p, rows }
}
