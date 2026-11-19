// Day 19: who did what to whom between Ventura's lawsuit and Combs's arrest, read from the days that reported it.
// Each event is found by what it says; an event the record lacks is simply not drawn.
import { utcDay, utcMonth } from 'd3'
import { redactThirdParties, resolveSources, type ReportedNumber, type Source, type TrialDay } from '@/lib/data'
import { formatUSD, formatUSDShort, toNumber } from '@/lib/viz/format'
import { dayRef } from '@/viz/kits/days-15-21/days'
import { additionSources, citedIn, findAddition, lowest, type AdditionsFile, type Level } from '@/viz/kits/days-15-21/sources'
import { datesInText, isoToDate, type Dated } from '@/viz/kits/days-15-21/time'
import { clause, sourcesFor } from '../day-16/select'
import additionsFile from './additions.json'

const additions = additionsFile as AdditionsFile

export type LaneId = 'ventura' | 'jane' | 'mia' | 'staff' | 'agents' | 'combs'

export const LANES: Array<{ id: LaneId; name: string; short: string }> = [
  { id: 'ventura', name: 'Cassie Ventura', short: 'Ventura' },
  { id: 'jane', name: 'Jane', short: 'Jane' },
  { id: 'mia', name: 'Mia', short: 'Mia' },
  { id: 'staff', name: "Combs's staff", short: 'Staff' },
  { id: 'agents', name: 'Federal agents and prosecutors', short: 'Agents' },
  { id: 'combs', name: 'Combs', short: 'Combs' },
]

export interface TimelineEvent {
  id: string
  /** ISO date; month-precision events sit on the 15th and say so. */
  iso: string
  precision: Dated['precision']
  from: LaneId
  to: LaneId | null
  title: string
  words: string[]
  level: Level
  sources: Source[]
  fromDay: number
}

export interface Day19Selection {
  events: TimelineEvent[]
  used: ReportedNumber[]
  other: ReportedNumber[]
  omitted: number
  pool: Source[]
  extraSources: Source[]
}

const textLevel = (d: TrialDay): Level => lowest(d.confidence.level, 'medium')
const iso = (d: Date) => d.toISOString().slice(0, 'yyyy-mm-dd'.length)
/** The middle day of a date's month: where a month-only event is drawn. */
const midMonth = (d: Date) => {
  const start = utcMonth.floor(d)
  return utcDay.offset(start, Math.floor(utcDay.count(start, utcMonth.offset(start, 1)) / 2))
}

/** Sources and level for a sentence: the outlets it names, else the whole day at "one outlet". */
function fromText(d: TrialDay, text: string): { sources: Source[]; level: Level } {
  const c = citedIn(text, d.sources, textLevel(d))
  return c.sources.length > 0 ? c : { sources: sourcesFor(d, /./), level: textLevel(d) }
}

/** Injury figures, left out of this page and its table (care rule 2). */
const INJURY = /welt|slap|hid before|black eye/i

export function select(day: TrialDay): Day19Selection {
  const events: TimelineEvent[] = []
  const used: ReportedNumber[] = []
  const extra: Source[] = []
  const d2 = dayRef('Day 2')
  const d5 = dayRef('Day 5')
  const d13 = dayRef('Day 13')
  const d14 = dayRef('Day 14')
  const d23 = dayRef('Day 23')
  const d24 = dayRef('Day 24')
  const push = (e: TimelineEvent) => events.push({ ...e, title: redactThirdParties(e.title), words: e.words.map(redactThirdParties) })

  // The lawsuit: month from the record, day from additions.json
  const filedMonth = day.numbers.find((n) => /lawsuit filed/i.test(n.what))
  const filedAdd = findAddition(additions, 'lawsuit-filed')
  const filed = filedAdd?.date ? isoToDate(filedAdd.date) : filedMonth ? isoToDate(String(filedMonth.value)) : null
  if (filed && filedMonth) {
    used.push(filedMonth)
    const addSrc = filedAdd ? additionSources(filedAdd, day.sources) : []
    extra.push(...addSrc)
    push({
      id: 'lawsuit', iso: iso(filed.precision === 'day' ? filed.date : midMonth(filed.date)), precision: filed.precision, from: 'ventura', to: 'combs',
      title: 'Ventura files a federal lawsuit against Combs', words: [filedAdd?.text ?? filedMonth.what],
      level: filedAdd ? lowest(filedAdd.confidence, filedMonth.confidence) : filedMonth.confidence,
      sources: [...resolveSources(filedMonth, day.sources), ...addSrc], fromDay: day.day,
    })
    // Settled the next day (Day 2's record: "day after filing")
    const settled = d2.numbers.find((n) => /settlement .*day after filing/i.test(n.what))
    const amount = settled ? toNumber(settled.value) : null
    if (settled && amount && filed.precision === 'day') {
      const abc = day.numbers.find((n) => /settlement figure/i.test(n.what))
      if (abc) used.push(abc)
      push({
        id: 'settled', iso: iso(utcDay.offset(filed.date, 1)), precision: 'day', from: 'combs', to: 'ventura',
        title: `The suit is settled the next day, for ${formatUSDShort(amount)}`, words: [settled.what, ...(abc ? [abc.what] : [])],
        level: settled.confidence, sources: [...resolveSources(settled, d2.sources), ...(abc ? resolveSources(abc, day.sources) : [])], fromDay: d2.day,
      })
    }
    // Recorded calls to Jane: "three days" after filing, "22 minutes" apart
    const after = day.numbers.find((n) => /filing to the first recorded call/i.test(n.what))
    const gap = day.numbers.find((n) => /between first and second recorded call/i.test(n.what))
    const afterDays = after ? toNumber(after.value) : null
    if (after && afterDays !== null && filed.precision === 'day') {
      used.push(after)
      if (gap) used.push(gap)
      const kp = day.key_points.find((k) => /recorded calls/i.test(k))
      push({
        id: 'calls', iso: iso(utcDay.offset(filed.date, afterDays)), precision: 'day', from: 'staff', to: 'jane',
        title: `Recorded calls to Jane from the chief of staff's phone${gap ? `, ${gap.value} ${gap.unit} apart` : ''}`,
        words: [kp ? clause(kp, /recorded calls/i) ?? '' : '', `First call ${after.value} ${after.unit} after the lawsuit was filed (calculated date).`].filter(Boolean),
        level: lowest(after.confidence, gap?.confidence ?? 'high'), sources: resolveSources(after, day.sources), fromDay: day.day,
      })
    }
  }

  // A security staffer calls Mia (Day 13)
  const miaCall = d13.key_points.find((k) => /security staffer called her/i.test(k))
  const miaCallDate = miaCall ? datesInText(miaCall.match(/\(([^)]*\d{4})\)/)?.[1] ?? '')[0] : undefined
  if (miaCall && miaCallDate) {
    push({
      id: 'mia-call', iso: iso(miaCallDate.date), precision: miaCallDate.precision, from: 'staff', to: 'mia',
      title: 'A Combs security staffer calls Mia', words: [clause(miaCall, /security staffer/i) ?? ''].filter(Boolean),
      level: lowest(textLevel(d13), 'low'), sources: d13.sources.slice(0, 1), fromDay: d13.day,
    })
  }

  // Late December: Jane texts the chief of staff about a threat to release private videos (Days 19 and 24)
  const threat = day.key_points.find((k) => /threatened .*release tapes/i.test(k))
  const threat24 = d24.key_points.find((k) => /Jane to chief of staff/i.test(k))
  const threatDate = threat ? datesInText(threat)[0] : undefined
  if (threat && threatDate) {
    push({
      id: 'threat', iso: iso(midMonth(threatDate.date)), precision: 'month', from: 'jane', to: 'staff',
      title: 'Jane texts the chief of staff that Combs threatened to release private videos of her',
      words: ['As Jane testified; the page does not describe the videos.', ...(threat24 ? [`Shown again on Day ${d24.day}: ${clause(threat24, /Jane to chief of staff/i)}.`] : [])].filter(Boolean),
      level: threat24 ? 'high' : textLevel(day), sources: [...sourcesFor(day, /threat|Khorram|tapes/i), ...(threat24 ? sourcesFor(d24, /Khorram|message/i) : [])], fromDay: day.day,
    })
  }

  // Mia's first meetings with prosecutors (Day 14; outlets disagree on the timing)
  const notes = d14.exhibits.find((e) => /meetings with prosecutors/i.test(e))
  const disagree = d14.discrepancies.find((t) => /disclosure timing/i.test(t))
  if (notes) {
    const yr = Number(notes.match(/\d{4}/)?.[0])
    const dates = datesInText(notes, yr)
    dates.forEach((dt, i) => push({
      id: `mia-meeting-${i}`, iso: iso(dt.date), precision: dt.precision, from: 'mia', to: 'agents',
      title: 'Mia meets prosecutors', words: [clause(notes, /meetings with prosecutors/i) ?? notes, ...(disagree ? [disagree] : [])],
      level: disagree ? 'conflict' : textLevel(d14), sources: sourcesFor(d14, /meeting|prosecutor|disclos/i), fromDay: d14.day,
    }))
  }

  // Messages from Combs to Mia (Day 13) and at least six calls in one day (Day 24)
  const msgs = d13.exhibits.find((e) => /messages from Combs/i.test(e))
  if (msgs) {
    const yr = Number(msgs.match(/\d{4}/)?.[0])
    datesInText(msgs, yr).forEach((dt, i) => push({
      id: `mia-msg-${i}`, iso: iso(dt.date), precision: dt.precision, from: 'combs', to: 'mia',
      title: 'Combs messages Mia', words: [msgs], level: textLevel(d13), sources: sourcesFor(d13, /message|text|Feb/i), fromDay: d13.day,
    }))
  }
  const calls6 = d24.numbers.find((n) => /calls to 'Mia' in one day/i.test(n.what))
  const calls6Date = calls6 ? datesInText(calls6.what)[0] : undefined
  if (calls6 && calls6Date) {
    push({
      id: 'mia-calls', iso: iso(midMonth(calls6Date.date)), precision: 'month', from: 'combs', to: 'mia',
      title: `Combs calls Mia at least ${toNumber(calls6.value) ?? calls6.value} times in one day`, words: [calls6.what],
      level: calls6.confidence, sources: resolveSources(calls6, d24.sources), fromDay: d24.day,
    })
  }

  // The searches (day from additions.json), the agent's card, and the lawyer Combs paid for
  const raid = findAddition(additions, 'searches')
  const raidKp = day.key_points.find((k) => /federal raids/i.test(k))
  const raidDate = raid?.date ? isoToDate(raid.date) : raidKp ? datesInText(raidKp.replace(/'March 2023'/g, ''))[0] : null
  if (raidDate) {
    const src = raid ? additionSources(raid, day.sources) : sourcesFor(day, /raid|search/i)
    extra.push(...src)
    const seized = d23.key_points.find((k) => /search of Combs' Los Angeles home/i.test(k))
    push({
      id: 'search', iso: iso(raidDate.date), precision: raidDate.precision, from: 'agents', to: 'combs',
      title: "Federal agents search Combs's homes in Los Angeles and Miami", words: [raid?.text ?? '', seized ? `Day ${d23.day}: ${clause(seized, /seized/i)}.` : ''].filter(Boolean),
      level: raid?.confidence ?? textLevel(day), sources: src, fromDay: day.day,
    })
  }
  if (raidKp && raidDate) {
    push({
      id: 'card', iso: iso(utcDay.offset(raidDate.date, 1)), precision: 'month', from: 'agents', to: 'jane',
      title: 'An agent leaves a card with Jane', words: [clause(raidKp, /left a card/i) ?? ''].filter(Boolean),
      level: textLevel(day), sources: sourcesFor(day, /raid|agent|card/i), fromDay: day.day,
    })
    push({
      id: 'lawyer', iso: iso(utcDay.offset(raidDate.date, 2)), precision: 'month', from: 'combs', to: 'jane',
      title: "Combs arranges and pays for Jane's lawyer", words: [clause(raidKp, /lawyer/i) ?? ''].filter(Boolean),
      level: textLevel(day), sources: sourcesFor(day, /lawyer|legal fees/i), fromDay: day.day,
    })
  }

  // May: CNN publishes the 2016 video; Combs talks to Jane about it
  const cnn = day.key_points.find((k) => /CNN release/i.test(k))
  const cnnDate = cnn ? datesInText(cnn)[0] : undefined
  if (cnn && cnnDate) {
    const c = fromText(day, cnn)
    push({
      id: 'cnn', iso: iso(midMonth(cnnDate.date)), precision: 'month', from: 'combs', to: 'jane',
      title: 'CNN publishes the hotel hallway video; Combs talks to Jane about it', words: [cnn.replace(/^May 2024:\s*/, '')],
      level: c.level, sources: c.sources, fromDay: day.day,
    })
  }

  // June 18: the incident at Jane's home (no further detail), and cash the next day
  const home = day.numbers.find((n) => n.unit === 'date' && /Jane's .*home/i.test(n.what))
  const doors = day.numbers.find((n) => /damaged doors/i.test(n.what))
  const homeDate = home ? isoToDate(String(home.value)) : null
  if (home && homeDate) {
    used.push(home)
    if (doors) used.push(doors)
    push({
      id: 'home', iso: String(home.value), precision: 'day', from: 'combs', to: 'jane',
      title: `Jane testified to a violent incident at her home${doors ? `; photos of ${doors.value} damaged doors were shown` : ''}`,
      words: ['This page gives no further detail of the incident.'], level: lowest(home.confidence, doors?.confidence ?? 'high'),
      sources: resolveSources(home, day.sources), fromDay: day.day,
    })
    const cash = day.numbers.find((n) => /cash from bodyguard next day/i.test(n.what))
    const cashAmount = cash ? toNumber(cash.value) : null
    if (cash && cashAmount) {
      used.push(cash)
      push({
        id: 'cash', iso: iso(utcDay.offset(homeDate.date, 1)), precision: 'day', from: 'staff', to: 'jane',
        title: `About ${formatUSD(cashAmount)} in cash from a bodyguard, the next day`, words: [cash.what],
        level: cash.confidence, sources: resolveSources(cash, day.sources), fromDay: day.day,
      })
    }
  }
  const payment = d23.numbers.find((n) => /payment .*arrange/i.test(n.what))
  const paymentDate = payment ? datesInText(payment.what)[0] : undefined
  const paymentAmount = payment ? toNumber(payment.value) : null
  if (payment && paymentDate && paymentAmount) {
    push({
      id: 'payment', iso: iso(utcDay.offset(midMonth(paymentDate.date), 2 + 1)), precision: 'month', from: 'staff', to: null,
      title: `A staff member helps arrange a ${formatUSD(paymentAmount)} payment to an escort`, words: [payment.what],
      level: payment.confidence, sources: resolveSources(payment, d23.sources), fromDay: d23.day,
    })
  }

  // The arrest (Day 5)
  const arrest = d5.numbers.find((n) => /arrest date/i.test(n.what))
  if (arrest) {
    push({
      id: 'arrest', iso: String(arrest.value), precision: 'day', from: 'agents', to: 'combs',
      title: 'Combs is arrested', words: [arrest.what], level: arrest.confidence, sources: resolveSources(arrest, d5.sources), fromDay: d5.day,
    })
  }

  events.sort((a, b) => a.iso.localeCompare(b.iso))
  const omittedList = day.numbers.filter((n) => INJURY.test(n.what))
  const pool = day.sources
  const ids = new Set(pool.map((s) => s.id))
  return {
    events,
    used,
    other: day.numbers.filter((n) => !used.includes(n) && !omittedList.includes(n)),
    omitted: omittedList.length,
    pool,
    extraSources: [...extra, ...events.flatMap((e) => e.sources)].filter((s) => !ids.has(s.id)),
  }
}
