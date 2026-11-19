// Number, range and date formatters shared by every visualization.
// Formatters only format values that came from the data; they never supply values.

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const int = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const dec1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

/** "$100,000"; keeps cents when the amount has them ("$10.50", never "$11"). */
export function formatUSD(n: number): string {
  return Number.isInteger(n) ? usd0.format(n) : usd2.format(n)
}

/** "$1.2 million", "$100,000" */
export function formatUSDShort(n: number): string {
  const million = 1e6
  if (Math.abs(n) >= million) return `$${dec1.format(n / million)} million`
  return formatUSD(n)
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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT_MONTHS = MONTHS.map((m) => m.slice(0, 3))

/** ISO dates inside text read as words: "2016-03-05" -> "March 5, 2016", "2016-03" -> "March 2016". */
export function plainDates(text: string): string {
  return text
    .replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, y, m, d) => `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`)
    .replace(/\b(\d{4})-(\d{2})\b(?!-)/g, (all, y, m) => (Number(m) >= 1 && Number(m) <= 12 ? `${MONTHS[Number(m) - 1]} ${y}` : all))
}

/** Units that only say what kind of value it is ("year", "date", "time") are not printed after it. */
const KIND_UNITS = /^(?:year|years?\s*\(.*\)|date|dates|time|month|deadline)$/i

/** Display a reported value as text: numbers get thousands separators (never years); dates read as words. */
export function formatValue(value: number | string, unit: string): string {
  if (typeof value === 'number') {
    if (/usd/i.test(unit)) {
      // "USD/hour" -> "$10.50 per hour"; "USD (more than)" -> "$100,000 (more than)"; plain "USD" -> "$100,000"
      const rest = unit.replace(/usd/i, '').replace(/^\s*\/\s*/, ' per ').replace(/\s+/g, ' ').trimEnd()
      return `${formatUSD(value)}${rest && !rest.startsWith(' ') ? ' ' + rest : rest}`
    }
    if (/^(?:year|date)\b/i.test(unit) && Number.isInteger(value) && value > 1900 && value < 2100) {
      // "2017" with unit "date (Mar 18)" -> "March 18, 2017"; unit "year" -> "2017"
      const md = unit.match(/\((\w{3})\w* (\d{1,2})\)/)
      const mi = md ? SHORT_MONTHS.indexOf(md[1]) : -1
      return mi >= 0 ? `${MONTHS[mi]} ${Number(md?.[2])}, ${value}` : String(value)
    }
    return `${formatInt(value)}${unit ? ' ' + unit : ''}`
  }
  const text = plainDates(value)
  if (!unit || KIND_UNITS.test(unit.trim()) || text.includes(unit)) return text
  if (/^years?$/i.test(unit.trim()) && /\b(?:19|20)\d{2}\b/.test(text)) return text
  return `${text} ${unit}`
}

/** Parse a reported value to a number when it is one ("~190" -> 190, "8-10" -> null). */
export function toNumber(value: number | string): number | null {
  if (typeof value === 'number') return value
  const m = value.replace(/[~,$\s]/g, '').match(/^-?\d+(\.\d+)?$/)
  return m ? Number(m[0]) : null
}

/** First words that are names or proper nouns: never lower-cased when a label is set mid-sentence. */
const PROPER_START = new Set([
  'Combs', 'Sean', 'Cassie', 'Ventura', 'Jane', 'Mia', 'George', 'Kaplan', 'Eddy', 'Garcia', 'Bryana', 'Bongolan', 'Jonathan', 'Perez',
  'Brendan', 'Paul', 'Kid', 'Cudi', 'Capricorn', 'Clark', 'Regina', 'David', 'James', 'Dawn', 'Kerry', 'Morgan', 'Deonte', 'Nash', 'Derek',
  'Ferguson', 'Kristina', 'Khorram', 'Judge', 'Juror', 'Bad', 'Trump', 'InterContinental', 'Los', 'New', 'Miami', 'Atlanta', 'Newark',
  'Dr', 'Dr.', 'Frank', 'Israel', 'Daniel', 'Sharay', 'Gerard', 'Mylah', 'Lance', 'Christopher', 'Sylvia', 'Enrique', 'Ananya', 'DeLeassa',
  'Joseph', 'Yasin', 'Frédéric', 'Mann', 'Rule', 'Count', 'Counts', 'CNN', 'NBC', 'ABC', 'AP', 'GMA', 'NPR', 'Fox', 'HSI', 'NDA', 'L’Ermitage',
  "L'Ermitage", 'Beverly', 'Park', 'Instagram', 'WhatsApp', 'Porsche', 'Christmas', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
])

/** A label set mid-sentence: lower-cases the first letter unless the label starts with a name ("George Kaplan ..."). */
export function midSentence(label: string): string {
  const first = label.split(/[\s:,]/)[0]
  if (PROPER_START.has(first) || /^[A-Z]{2,}/.test(first)) return label
  return label.charAt(0).toLowerCase() + label.slice(1)
}
