// Day 13: every dollar amount the picture places on one scale. Mia's 2017 mediation (asked, settled,
// received) is the step-down; the other amounts named at trial are context, by kind.
import { getDay, type ReportedNumber, type TrialDay } from '@/lib/data'
import {
  textFact,
  D, withDay, buildSourceBook, dollarsIn, factFromNumber, findNumber, mergeFacts,
  type DayReader, type Fact, type SourceBook,
} from '@/viz/kits/days-08-14/facts'

export type Kind = 'settlement' | 'ask' | 'payment'
export const KINDS: Array<{ id: Kind; label: string; plain: string }> = [
  { id: 'settlement', label: 'Settlements', plain: 'settlement' },
  { id: 'ask', label: 'Amounts asked or sued for', plain: 'amount asked or sued for' },
  { id: 'payment', label: 'Payments and NDAs', plain: 'payment or NDA' },
]

export interface Amount { id: string; who: string; label: string; value: number; kind: Kind; fact: Fact; alt?: { value: number; note: string } }
export interface Day13Model { mia: Amount[]; context: Amount[]; purpose: Fact | null; book: SourceBook; used: ReportedNumber[] }

export function select(day: TrialDay, read0: DayReader = getDay): Day13Model {
  const read = withDay(day, read0)
  const used: ReportedNumber[] = []
  const num = (n: number, key: string, what: RegExp) => {
    const hit = findNumber(read, n, what)
    if (hit && n === day.day) used.push(hit.num)
    return factFromNumber(key, hit)
  }
  const amount = (id: string, who: string, label: string, kind: Kind, fact: Fact | null): Amount | null =>
    fact && typeof fact.value === 'number' ? { id, who, label, value: fact.value, kind, fact } : null

  // Mia's mediation, from this day's record (Day 13), with Day 14's matching figures merged in.
  const asked = mergeFacts('mia-asked', 'Initial mediation demand', [num(day.day, 'mia-asked-own', /Initial mediation demand/i), num(D('Day 14'), 'mia-asked-next', /Mediation demand/i)])
  const settled = mergeFacts('mia-settled', 'Settlement total', [num(day.day, 'mia-settled-own', /Settlement total/i), num(D('Day 14'), 'mia-settled-next', /^Settlement$/i)])
  const shareHit = num(day.day, 'mia-share', /Mia's share/i)
  const shareAlts = shareHit ? dollarsIn(shareHit.text).filter((d) => d.value !== shareHit.value && d.note) : []
  const share = amount('mia-share', 'Mia', 'to her', 'payment', shareHit ? { ...shareHit, confidence: shareAlts.length ? 'conflict' : shareHit.confidence } : null)
  if (share && shareAlts.length) share.alt = { value: shareAlts[shareAlts.length - 1].value, note: shareAlts[shareAlts.length - 1].note }
  const mia = [amount('mia-asked', 'Mia', 'asked', 'ask', asked), amount('mia-settled', 'Mia', 'settled', 'settlement', settled), share].filter((a): a is Amount => !!a)

  const context = [
    amount('ventura-settlement', 'Ventura', 'lawsuit settled in a day', 'settlement', mergeFacts('ventura-settlement', 'Settlement of her civil lawsuit, the day after it was filed', [num(D('Day 3'), 'v-set-a', /^Settlement$/i), num(D('Day 2'), 'v-set-b', /Settlement of Nov 2023 lawsuit/i)])),
    amount('ventura-hotel', 'Ventura', 'expected from the hotel', 'settlement', num(D('Day 5'), 'v-hotel', /from InterContinental/i)),
    amount('ventura-manuscript', 'Ventura', 'asked for her manuscript', 'ask', num(D('Day 3'), 'v-manuscript', /manuscript/i)),
    amount('bongolan-suit', 'Bongolan', 'civil suit', 'ask', num(D('Day 16'), 'bongolan', /Amount Bongolan sued/i)),
    amount('morgan-nda', 'Morgan', 'payment and NDA', 'payment', num(D('Day 6'), 'morgan', /NDA to Morgan/i)),
    amount('video', 'Hotel video', 'cash for the footage', 'payment', num(D('Day 15'), 'video', /Cash Combs paid for the 2016 video/i)),
    amount('garcia', 'Garcia', 'his share', 'payment', num(D('Day 15'), 'garcia', /Garcia kept/i)),
    amount('regina', 'Regina Ventura', 'demanded, then returned', 'payment', num(D('Day 7'), 'regina', /demanded from Regina Ventura/i)),
  ].filter((a): a is Amount => !!a)

  // What the settlement was for, and what a demand is (review, Nov 2026): read from the day's coverage.
  const purpose = textFact(read, day.day, 'purpose', 'key_points', /^Settlement purpose/i, /^Global/, 'medium')
  return { mia, context, purpose, book: buildSourceBook(day, [...mia, ...context].map((a) => a.fact).concat(purpose ? [purpose] : [])), used }
}
