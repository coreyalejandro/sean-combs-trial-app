// Day 2: the fields the dual lifeline needs, picked by what they are.
import { getDays, getWitnessesOnDay, type TrialDay } from '@/lib/data'
import { buildIndex, findFact, findNumber, numberRefs, uniqueRefs, weaker, yearIn, yearsIn, type Level, type Ref, type RefIndex } from '../day-01/kit/refs'

export interface LifeEvent {
  id: string
  label: string
  /** First year of the mark; `yearEnd` set when the record gives a range ("2017 or 2018"). */
  year: number
  yearEnd?: number
  detail: string
  level: Level
  refs: Ref[]
}

export interface Day02Selection {
  /** Her age and his age in the year they met, and that year. */
  metYear: number
  herAgeMet: number
  hisAgeMet: number
  gap: number
  startYear: number
  endYear: number
  events: LifeEvent[]
  relationship: { from: number; to: number; readings: Array<{ text: string; level: Level; refs: Ref[] }> } | null
  deal: { size: number; released: number; readings: Array<{ text: string; level: Level; refs: Ref[] }>; note: { text: string; level: Level; refs: Ref[] } | null } | null
  metRefs: Ref[]
  metLevel: Level
  index: RefIndex
}

const NUMBER_WORDS = ['one', 'two']
function countIn(text: string): number | null {
  const m = text.match(/released (?:only )?(\w+)/i)
  if (!m) return null
  const w = NUMBER_WORDS.indexOf(m[1].toLowerCase())
  return w >= 0 ? w + 1 : Number.isFinite(Number(m[1])) ? Number(m[1]) : null
}

export function select(day: TrialDay): Day02Selection | null {
  const met = findNumber(day, /age when she met/i)
  if (!met || typeof met.value !== 'number') return null
  const metYear = yearIn(met.what)
  const hisAge = met.what.match(/he was (\d+)/)
  if (metYear === null || !hisAge) return null
  const herAgeMet = met.value
  const hisAgeMet = Number(hisAge[1])
  const metRefs = numberRefs(day, met)
  const events: LifeEvent[] = [
    { id: 'met', label: 'They met', year: metYear, detail: `She was ${herAgeMet}; he was ${hisAgeMet}.`, level: met.confidence, refs: metRefs },
  ]

  const signed = findFact(day, /signed to Bad Boy/i)
  const signedYear = signed ? yearIn(signed.text.match(/signed to Bad Boy[^;(]*/i)?.[0] ?? '') : null
  if (signed && signedYear) {
    const dealNum = findNumber(day, /Bad Boy deal/i)
    events.push({
      id: 'signed',
      label: 'Signed to Bad Boy Records',
      year: signedYear,
      detail: 'Signed to his label, early in the year she gave.',
      level: dealNum ? weaker(signed.confidence, dealNum.confidence) : signed.confidence,
      refs: dealNum ? numberRefs(day, dealNum) : signed.refs,
    })
  }

  // Relationship length: AP's "just over 10" years on Day 2 against "11 years, 2007 to 2018" agreed on cross (Days 4 and 5).
  const lenHere = findNumber(day, /length of relationship/i)
  const lenCross = getDays()
    .filter((d) => d.day > day.day)
    .flatMap((d) => {
      const n = findNumber(d, /relationship/i, /^years$/i)
      const hers = n && (/ventura/i.test(n.what) || getWitnessesOnDay(d.day).some((w) => w.id === 'ventura'))
      return n && hers ? [{ d, n }] : []
    })
  const spanSource = lenCross.find((x) => yearsIn(x.n.what).length >= 2) ?? null
  const spanYears = spanSource ? yearsIn(spanSource.n.what) : lenHere ? yearsIn(lenHere.what) : []
  let relationship: Day02Selection['relationship'] = null
  if (spanYears.length >= 2) {
    const readings = [
      ...(lenHere ? [{ text: `${lenHere.value} ${lenHere.unit} (as reported on Day ${day.day})`, level: lenHere.confidence, refs: numberRefs(day, lenHere) }] : []),
      ...lenCross.map(({ d, n }) => ({ text: `${n.value} ${n.unit} (Day ${d.day}: ${n.what})`, level: n.confidence, refs: numberRefs(d, n) })),
    ]
    relationship = { from: spanYears[0], to: spanYears[spanYears.length - 1], readings }
    events.push({
      id: 'together',
      label: 'Relationship begins',
      year: spanYears[0],
      detail: `The range drawn runs to ${spanYears[spanYears.length - 1]}; outlets disagree on the length.`,
      level: readings.length > 1 ? 'conflict' : readings[0]?.level ?? 'medium',
      refs: uniqueRefs(readings.flatMap((r) => r.refs)),
    })
  }

  const began = findNumber(day, /age at first/i)
  if (began && typeof began.value === 'number') {
    const y = yearIn(began.what) ?? metYear + (began.value - herAgeMet)
    events.push({ id: 'began', label: 'She says the encounters began', year: y, detail: `She was ${began.value}, about ${y}.`, level: began.confidence, refs: numberRefs(day, began) })
  }
  const last = findNumber(day, /^last/i)
  if (last) {
    const ys = yearsIn(last.value)
    if (ys.length > 0) events.push({ id: 'last', label: 'The last, as she dated it', year: ys[0], yearEnd: ys[ys.length - 1] !== ys[0] ? ys[ys.length - 1] : undefined, detail: `${last.value}, as she gave it.`, level: last.confidence, refs: numberRefs(day, last) })
  }

  // The record deal inset: Day 2 (NPR) and Day 11 (NBC) describe the one release differently; Day 11 adds a share of music released.
  const dealHere = findNumber(day, /Bad Boy deal/i)
  const day11 = getDays().find((d) => d.day > day.day && findNumber(d, /contract size/i)) ?? day
  const dealLater = day11 === day ? null : findNumber(day11, /contract size/i)
  const shareLater = day11 === day ? null : findNumber(day11, /share of .*music released/i)
  let deal: Day02Selection['deal'] = null
  const size = dealHere ? Number(dealHere.value) : dealLater ? Number(dealLater.value) : NaN
  if (Number.isFinite(size)) {
    const readings = [
      ...(dealHere ? [{ text: `Day ${day.day} record: ${dealHere.value}-${dealHere.unit.replace(/s$/, '')} deal; ${dealHere.what.replace(/^Bad Boy deal;\s*/i, '')}`, level: dealHere.confidence, refs: numberRefs(day, dealHere) }] : []),
      ...(dealLater ? [{ text: `Day ${day11.day} record: ${dealLater.value} ${dealLater.unit}; ${dealLater.what.replace(/^.*?\(/, '').replace(/\)$/, '')}`, level: dealLater.confidence, refs: numberRefs(day11, dealLater) }] : []),
    ]
    const released = countIn([dealHere?.what, dealLater?.what].filter(Boolean).join('; ')) ?? 0
    deal = {
      size,
      released,
      readings,
      note: shareLater ? { text: `Day ${day11.day}: a former assistant estimated ${String(shareLater.value).replace('~', 'about ')}${/percent/i.test(shareLater.unit) ? '%' : ` ${shareLater.unit}`} of her recorded music was released.`, level: shareLater.confidence, refs: numberRefs(day11, shareLater) } : null,
    }
  }

  events.sort((a, b) => a.year - b.year)
  const endYear = Math.max(...events.map((e) => e.yearEnd ?? e.year), relationship?.to ?? metYear)
  const all = uniqueRefs([
    ...events.flatMap((e) => e.refs),
    ...(relationship?.readings.flatMap((r) => r.refs) ?? []),
    ...(deal ? [...deal.readings.flatMap((r) => r.refs), ...(deal.note?.refs ?? [])] : []),
    ...day.numbers.flatMap((n) => numberRefs(day, n)),
  ])
  return {
    metYear,
    herAgeMet,
    hisAgeMet,
    gap: hisAgeMet - herAgeMet,
    startYear: metYear,
    endYear,
    events,
    relationship,
    deal,
    metRefs,
    metLevel: met.confidence,
    index: buildIndex(day.sources, all),
  }
}
