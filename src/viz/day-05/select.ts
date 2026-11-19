// Day 5: the items the arresting agent listed, one icon per unit, from the agent's testimony and the day's figures.
import { formatDate, getWitnesses, type TrialDay } from '@/lib/data'
import { formatUSD } from '@/lib/viz/format'
import { buildIndex, findFact, findNumber, numberRefs, uniqueRefs, type Level, type Ref, type RefIndex } from '@/viz/kits/days-01-07/refs'

export type IconKind = 'cash' | 'bottle' | 'pills' | 'powder' | 'light'

export interface Item {
  /** Cites the day's coverage as a whole (no single article is tied to it). */
  whole?: boolean
  id: IconKind
  name: string
  /** How many icons; `perIcon` says what one icon stands for. */
  icons: number
  perIcon: string
  countReported: boolean
  detail: string
  level: Level
  refs: Ref[]
}

export interface Day05Selection {
  items: Item[]
  agent: { name: string; role: string } | null
  arrest: { date: string; place: string; level: Level; refs: Ref[] } | null
  belongings: { text: string; level: Level; refs: Ref[] } | null
  stand: { days: number[]; allDays: number[]; count: string; level: Level; refs: Ref[]; endedToday: boolean } | null
  /** The agent's whole list, as the record gives it (for the text version). */
  listed: string[]
  index: RefIndex
}

/** One icon per this many dollars: the place value of the amount's leading digit ($9,000 -> $1,000). */
function placeValue(n: number): number {
  return Number('1'.padEnd(String(Math.trunc(n)).length, '0'))
}

export function select(day: TrialDay): Day05Selection {
  const binda = findFact(day, /^Binda:/)
  const agentRec = getWitnesses().find((w) => w.days.includes(day.day) && w.group === 'police-and-agents') ?? null
  const agentRole = day.witnesses.find((w) => agentRec && agentRec.raw_names.includes(w.name))?.role ?? agentRec?.role ?? ''
  const body = binda?.text.replace(/^Binda:\s*/, '') ?? ''
  const contents = body.match(/contained (.*?)(\. Cross|$)/)?.[1] ?? ''
  const listed = contents.split(/,\s*(?=[a-z$])/).map((x) => x.trim()).filter(Boolean)
  const items: Item[] = []

  const cash = findNumber(day, /cash found/i, /usd/i)
  if (cash && typeof cash.value === 'number') {
    const unit = placeValue(cash.value)
    items.push({ id: 'cash', name: 'in cash, in a fanny pack', icons: Math.round(cash.value / unit), perIcon: `${formatUSD(unit)} in cash`, countReported: true, detail: `${formatUSD(cash.value)} in cash in a fanny pack.`, level: cash.confidence, refs: numberRefs(day, cash) })
  }
  const oil = findNumber(day, /baby oil bottles/i)
  if (oil && typeof oil.value === 'number') items.push({ id: 'bottle', name: 'bottles of baby oil', icons: oil.value, perIcon: 'one bottle', countReported: true, detail: `${oil.value} bottles of baby oil, in the bathtub.`, level: oil.confidence, refs: numberRefs(day, oil) })
  if (binda) {
    const pills = listed.find((x) => /alias/i.test(x))
    const alias = pills?.match(/alias '([^']+)'/)?.[1]
    if (pills) items.push({ id: 'pills', name: alias ? `pills under the name “${alias}”` : 'pills under an alias', icons: 1, perIcon: 'one pill bottle (count not reported)', countReported: false, detail: `${pills.replace(/^[a-z]/, (c) => c.toUpperCase()).replace(/'/g, '’')}.`, level: binda.confidence, refs: binda.refs, whole: Boolean(binda.wholeRecord) })
    const powder = listed.find((x) => /powder/i.test(x))
    if (powder) items.push({ id: 'powder', name: 'powder, tested for drugs', icons: 1, perIcon: 'one sample (amount not reported)', countReported: false, detail: 'A powder that was tested for drugs.', level: binda.confidence, refs: binda.refs, whole: Boolean(binda.wholeRecord) })
    const light = listed.find((x) => /lighting/i.test(x))
    if (light) items.push({ id: 'light', name: 'lighting device', icons: 1, perIcon: 'one device', countReported: false, detail: 'A lighting device.', level: binda.confidence, refs: binda.refs, whole: Boolean(binda.wholeRecord) })
  }

  const arrestNum = findNumber(day, /arrest date/i)
  const place = binda?.text.match(/at ([^;,]*\([^)]*\))/)?.[1] ?? binda?.text.match(/at (Park Hyatt[^;,]*)/)?.[1] ?? ''
  const arrest = arrestNum ? { date: formatDate(String(arrestNum.value)), place, level: arrestNum.confidence, refs: numberRefs(day, arrestNum) } : null
  const belongingsClause = binda?.text.match(/Cross: ([^.]*)/)?.[1]
  const belongings = binda && belongingsClause ? { text: belongingsClause, level: binda.confidence, refs: binda.refs } : null

  const standNum = findNumber(day, /on the witness stand/i)
  const ventura = getWitnesses().find((w) => w.id === 'ventura')
  const stand = standNum && ventura
    ? {
        days: ventura.days,
        allDays: Array.from({ length: Math.max(...ventura.days, day.day) }, (_, i) => i + 1),
        count: `${standNum.value} ${standNum.unit}`,
        level: standNum.confidence,
        refs: numberRefs(day, standNum),
        endedToday: Math.max(...ventura.days) === day.day,
      }
    : null

  const all = uniqueRefs([...items.flatMap((i) => i.refs), ...(arrest?.refs ?? []), ...(belongings?.refs ?? []), ...(stand?.refs ?? []), ...day.numbers.flatMap((n) => numberRefs(day, n))])
  return {
    items,
    agent: agentRec ? { name: agentRec.display_name, role: agentRole } : null,
    arrest,
    belongings,
    stand,
    listed,
    index: buildIndex(day.sources, all),
  }
}
