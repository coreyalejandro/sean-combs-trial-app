// Day 7: the $20,000 path through December 2011, from Regina Ventura's testimony (Day 7) and the bank records
// Derek Ferguson walked through (Day 15). Dates are read from the records' text, never typed.
import { getDays, type TrialDay } from '@/lib/data'
import { formatUSD } from '@/lib/viz/format'
import { buildIndex, findFact, findNumber, monthIn, numberRefs, sourcesNamedIn, toRef, uniqueRefs, weaker, type Level, type Ref, type RefIndex } from '@/viz/kits/days-01-07/refs'

export interface BankEntry {
  date: number
  text: string
  /** wire in from the family, return out, or a transfer the record does not tie to the demand */
  kind: 'in' | 'out' | 'other'
  level: Level
  refs: Ref[]
}

export interface ContextMark {
  id: string
  date: number
  label: string
  /** A shorter label for the drawing. */
  short: string
  level: Level
  refs: Ref[]
}

export interface Day07Selection {
  amount: number
  amountText: string
  year: number
  month: number
  daysInMonth: number
  /** 0 = Sunday; weekday of the 1st, for the phone's month grid (calculated). */
  firstWeekday: number
  demand: { text: string; level: Level; refs: Ref[] }
  loan: { text: string; level: Level; refs: Ref[] } | null
  bank: BankEntry[]
  bankDay: number | null
  context: ContextMark[]
  ruling: { text: string; level: Level; refs: Ref[] } | null
  index: RefIndex
}

const DAY_IN_MONTH = /\b(?:Dec|December)\.?\s+(\d{1,2}),\s*(\d{4})/i

export function select(day: TrialDay): Day07Selection | null {
  const demandNum = findNumber(day, /demanded/i, /usd/i)
  if (!demandNum || typeof demandNum.value !== 'number') return null
  const amount = demandNum.value
  const regina = findFact(day, /^Regina Ventura:/, { fallbackNumber: /demanded/i })
  const demandRefs = numberRefs(day, demandNum)

  // Bank records from the day whose record reports transfers of the same amount in the same month.
  const bankDayRec = getDays().find((d) => d.day > day.day && d.numbers.some((n) => n.value === amount && /usd/i.test(n.unit) && DAY_IN_MONTH.test(n.what))) ?? null
  const bankNum = bankDayRec?.numbers.find((n) => n.value === amount && /usd/i.test(n.unit) && DAY_IN_MONTH.test(n.what)) ?? null
  const bank: BankEntry[] = []
  let year = NaN
  let month = NaN
  if (bankDayRec && bankNum) {
    const segments = bankNum.what.split(/;\s*/)
    // a segment with no outlet in brackets takes the next named outlet ("Dec 23 ...; Dec 27 ... (ABC)")
    const outletOf = segments.map((seg) => seg.match(/\(([^)]*)\)\s*$/)?.[1] ?? null)
    for (let i = outletOf.length - 2; i >= 0; i--) if (!outletOf[i]) outletOf[i] = outletOf[i + 1]
    segments.forEach((seg, i) => {
      const m = seg.match(DAY_IN_MONTH)
      if (!m) return
      year = Number(m[2])
      month = monthIn(seg) ?? NaN
      const named = outletOf[i] ? sourcesNamedIn(outletOf[i] as string, bankDayRec.sources) : []
      const refs = (named.length > 0 ? named : bankDayRec.sources.filter((s) => numberRefs(bankDayRec, bankNum).some((r) => r.id === s.id))).map((s) => toRef(s, bankDayRec.day))
      const text = seg.replace(DAY_IN_MONTH, '').replace(/\([^)]*\)\s*$/, '').replace(/^\s*\$[\d,]+\s*/, '').trim().replace(/'/g, '’')
      const kind: BankEntry['kind'] = /from her father|wire from/i.test(seg) ? 'in' : /return/i.test(seg) ? 'out' : 'other'
      bank.push({ date: Number(m[1]), text, kind, level: bankNum.confidence, refs })
    })
  }
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    const y = Number(regina?.text.match(/(\d{4})/)?.[1])
    year = Number.isFinite(y) ? y : NaN
    month = regina ? monthIn(regina.text) ?? NaN : NaN
  }
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay()

  const loanClause = regina?.text.split(/;\s*/).find((c) => /home equity loan/i.test(c)) ?? null
  const loan = regina && loanClause ? { text: loanClause, level: weaker(regina.confidence, demandNum.confidence), refs: demandRefs } : null

  const context: ContextMark[] = []
  const email = findFact(day, /email Ventura to/i, { within: day.exhibits })
  const emailDate = email?.text.match(DAY_IN_MONTH)
  if (email && emailDate) context.push({ id: 'email', date: Number(emailDate[1]), label: 'Email from Ventura to her mother and an assistant', short: 'Email from Ventura to her mother', level: email.confidence, refs: email.refs })
  const photos = findFact(day, /photos of bruises/i, { within: day.exhibits })
  const photoDate = photos?.text.match(DAY_IN_MONTH)
  const photoNum = findNumber(day, /bruise photos/i)
  if (photos && photoDate) context.push({ id: 'photos', date: Number(photoDate[1]), label: `Photos her mother said she took${photoNum ? ` (${photoNum.value})` : ''}; shown here only as a date`, short: 'Photos her mother took (date only)', level: photoNum ? weaker(photos.confidence, photoNum.confidence) : photos.confidence, refs: photoNum ? numberRefs(day, photoNum) : photos.refs })
  for (const b of bank.filter((x) => x.kind === 'other')) context.push({ id: `bank-${b.date}`, date: b.date, label: `Bank record: ${formatUSD(amount)} ${b.text}; the record does not say how it relates to the demand`, short: `${formatUSD(amount)} ${b.text.replace(/^outgoing transfer/i, 'out')} (link to the demand not stated)`, level: b.level, refs: b.refs })
  context.sort((a, b) => a.date - b.date)

  const rulingFact = findFact(day, /potential extortion/i, { within: day.legal_events })
  const ruling = rulingFact ? { text: 'The judge allowed this testimony over the defense’s objection, as possible evidence of extortion.', level: rulingFact.confidence, refs: rulingFact.refs } : null

  const all = uniqueRefs([...demandRefs, ...(regina?.refs ?? []), ...bank.flatMap((b) => b.refs), ...context.flatMap((c) => c.refs), ...(ruling?.refs ?? []), ...day.numbers.flatMap((n) => numberRefs(day, n))])
  return {
    amount,
    amountText: formatUSD(amount),
    year,
    month,
    daysInMonth,
    firstWeekday,
    demand: { text: 'Combs demanded the money, she testified, under a threat to release private videos.', level: demandNum.confidence, refs: demandRefs },
    loan,
    bank: bank.filter((b) => b.kind !== 'other'),
    bankDay: bankDayRec?.day ?? null,
    context,
    ruling,
    index: buildIndex(day.sources, all),
  }
}
