// Day 21: every payment named in Jane's testimony, read from the days it was reported (Days 17 to 22).
// Monthly money is a band; one-time payments are dots sized by amount; undated amounts and the total stand apart.
import { utcDay, utcMonth, utcYear } from 'd3'
import { redactThirdParties, resolveSources, type ReportedNumber, type Source, type TrialDay } from '@/lib/data'
import { formatUSD, toNumber } from '@/lib/viz/format'
import { dayRef } from '@/viz/kits/days-15-21/days'
import { lowest, type Level } from '@/viz/kits/days-15-21/sources'
import { datesInText, formatMonth, isoToDate, MONTHS_PER_YEAR, toIso } from '@/viz/kits/days-15-21/time'

export type Kind = 'monthly' | 'asked-monthly' | 'payment' | 'asked' | 'undated' | 'total' | 'income'

export interface Money {
  id: string
  kind: Kind
  label: string
  /** Dollars (per month for monthly kinds); a range has lo < hi. */
  lo: number
  hi: number
  /** ISO start (and end, for bands). Undated items have none. */
  start: string | null
  end: string | null
  /** What the date rests on, in words. */
  when: string
  words: string[]
  level: Level
  sources: Source[]
  fromDays: number[]
  /** Set when the app computed the amount or date. */
  formula?: string
  open?: boolean
}

export interface Day21Selection {
  items: Money[]
  domain: [string, string]
  used: ReportedNumber[]
  other: ReportedNumber[]
  omitted: number
  pool: Source[]
  extraSources: Source[]
}

const range = (v: number | string): [number, number] | null => {
  const parts = String(v).split(/\s*-\s*/).map((p) => toNumber(p))
  if (parts.some((p) => p === null) || parts.length === 0) return null
  const n = parts as number[]
  return [Math.min(...n), Math.max(...n)]
}
const midMonth = (d: Date) => utcDay.offset(utcMonth.floor(d), Math.floor(utcDay.count(utcMonth.floor(d), utcMonth.offset(utcMonth.floor(d), 1)) / 2))

/** Sexual detail counted elsewhere in the day's record, left out of this page (care rule 2). */
const INTIMATE = /men at the|escorts jane declined|gap in 2022 with no hotel nights/i

export function select(day: TrialDay): Day21Selection {
  const items: Money[] = []
  const used: ReportedNumber[] = []
  const d17 = dayRef('Day 17')
  const d18 = dayRef('Day 18')
  const d19 = dayRef('Day 19')
  const d20 = dayRef('Day 20')
  const d22 = dayRef('Day 22')
  const find = (d: TrialDay, re: RegExp) => d.numbers.find((n) => re.test(n.what) && /USD/i.test(n.unit))
  const src = (d: TrialDay, n: ReportedNumber) => resolveSources(n, d.sources)
  const mark = (d: TrialDay, n: ReportedNumber) => { if (d.day === day.day) used.push(n) }

  // Monthly support by 2021 (Day 17)
  const support = find(d17, /support combs sent jane by/i)
  const supportYear = support?.what.match(/by (\d{4})/)?.[1]
  const supportRange = support ? range(support.value) : null
  if (support && supportYear && supportRange) {
    const y = isoToDate(supportYear)?.date
    if (y) {
      items.push({
        id: 'support', kind: 'monthly', label: 'Monthly support by this year', lo: supportRange[0], hi: supportRange[1], start: toIso(y), end: toIso(utcYear.offset(y, 1)),
        when: `by ${supportYear} (months not reported)`, words: [support.what], level: support.confidence, sources: src(d17, support), fromDays: [d17.day],
      })
    }
  }

  // Rent: $10,000 a month from March 2023 (Day 18, with the Day 17 lease), still paid at trial
  const rent = find(d18, /allowance combs offered/i)
  const lease = find(d17, /rent on the home/i)
  const rentStart = rent ? datesInText(rent.what)[0] : undefined
  const asked = find(d18, /allowance jane asked/i)
  if (rent && rentStart) {
    const amount = toNumber(rent.value) ?? 0
    mark(d18, rent)
    items.push({
      id: 'rent', kind: 'monthly', label: 'Rent, paid each month', lo: amount, hi: amount, start: toIso(rentStart.date), end: null, open: /still paid/i.test(rent.what),
      when: `from ${formatMonth(rentStart.date)}${/still paid/i.test(rent.what) ? '; still paid at the time of trial' : ''}`,
      words: [rent.what, ...(lease ? [`Day ${d17.day}: ${lease.what} (${lease.outlets.join(', ')}).`] : [])],
      level: rent.confidence, sources: [...src(d18, rent), ...(lease ? src(d17, lease) : [])], fromDays: [d18.day, ...(lease ? [d17.day] : [])],
    })
    if (asked) {
      const a = toNumber(asked.value) ?? 0
      items.push({
        id: 'rent-asked', kind: 'asked-monthly', label: 'What Jane asked for each month', lo: a, hi: a, start: toIso(rentStart.date), end: null,
        when: `${formatMonth(rentStart.date)} (asked, not paid)`, words: [asked.what], level: asked.confidence, sources: src(d18, asked), fromDays: [d18.day],
      })
    }
  }

  // The birthday: at least $13,000 sent, $15,000 asked (this day)
  const bday = day.numbers.find((n) => /sent for .*birthday/i.test(n.what) && /USD/i.test(n.unit))
  const bdayDate = bday ? datesInText(bday.what)[0] : undefined
  const bdayAsk = day.numbers.find((n) => /originally asked/i.test(n.what) && /USD/i.test(n.unit))
  if (bday && bdayDate) {
    mark(day, bday)
    const amount = toNumber(bday.value) ?? 0
    items.push({
      id: 'birthday', kind: 'payment', label: 'For a birthday outfit and dinner (at least this much)', lo: amount, hi: amount, start: toIso(midMonth(bdayDate.date)), end: null,
      when: `${formatMonth(bdayDate.date)} (day not reported)`, words: [bday.what], level: bday.confidence, sources: src(day, bday), fromDays: [day.day],
    })
    if (bdayAsk) {
      mark(day, bdayAsk)
      const a = toNumber(bdayAsk.value) ?? 0
      items.push({
        id: 'birthday-asked', kind: 'asked', label: 'What she had asked for the birthday', lo: a, hi: a, start: toIso(midMonth(bdayDate.date)), end: null,
        when: 'the same month (asked, not paid)', words: [bdayAsk.what], level: bdayAsk.confidence, sources: src(day, bdayAsk), fromDays: [day.day],
      })
    }
  } else if (bdayAsk) {
    // the ask without its dated payment: shown as an undated amount
    mark(day, bdayAsk)
    const a = toNumber(bdayAsk.value) ?? 0
    items.push({
      id: 'birthday-asked', kind: 'undated', label: 'What Jane had asked for', lo: a, hi: a, start: null, end: null,
      when: 'date not reported (asked, not paid)', words: [bdayAsk.what], level: bdayAsk.confidence, sources: src(day, bdayAsk), fromDays: [day.day],
    })
  }

  // About $12,000 in cash the day after the June 2024 incident (Day 19)
  const cash = find(d19, /cash from bodyguard next day/i)
  const incident = d19.numbers.find((n) => n.unit === 'date' && /home/i.test(n.what))
  const incidentDate = incident ? isoToDate(String(incident.value)) : null
  if (cash && incidentDate) {
    const amount = toNumber(cash.value) ?? 0
    items.push({
      id: 'cash', kind: 'payment', label: 'Cash from a bodyguard, the day after the incident at her home', lo: amount, hi: amount,
      start: toIso(utcDay.offset(incidentDate.date, 1)), end: null, when: 'the next day (calculated from the date of the incident)', words: [cash.what],
      level: cash.confidence, sources: src(d19, cash), fromDays: [d19.day], formula: 'date of the incident plus one day',
    })
  }

  // Two separate $20,000 items, each from one outlet, with no date (Day 20)
  const twenty = find(d20, /unsolicited transfer/i)
  if (twenty) {
    const amount = toNumber(twenty.value) ?? 0
    const parts = twenty.what.split(/;\s*/)
    const outletsInSource = twenty.source.split(/[;(]/)[0].split(/[,;]\s*|\s+/).filter(Boolean)
    parts.forEach((p, i) => {
      const outlet = p.match(/\(([^)]+)\)/)?.[1] ?? outletsInSource[i] ?? ''
      const sources = resolveSources({ source: outlet, outlets: [outlet] }, d20.sources)
      items.push({
        id: `twenty-${i}`, kind: 'undated', label: p.replace(/\s*\([^)]*\)\s*$/, ''), lo: amount, hi: amount, start: null, end: null,
        when: 'date not reported', words: [p, 'Reported as two separate amounts, each by one outlet.'], level: lowest(twenty.confidence, 'low'),
        sources: sources.length ? sources : src(d20, twenty), fromDays: [d20.day],
      })
    })
  }

  // The total wired (Day 20, NBC) and the same total on Day 22 (ABC): two outlets agreeing
  const total20 = find(d20, /total combs wired/i)
  const total22 = find(d22, /total combs wired/i)
  const total = total20 ?? total22
  if (total) {
    const amount = toNumber(total.value) ?? 0
    const agree = total20 && total22 && toNumber(total20.value) === toNumber(total22.value)
    const s20 = total20 ? src(d20, total20) : []
    const s22 = total22 ? src(d22, total22) : []
    const families = new Set([...s20, ...s22].map((x) => x.outlet.split(/\s/)[0].toLowerCase()))
    items.push({
      id: 'total', kind: 'total', label: 'Wired over the whole relationship, in total', lo: amount, hi: amount, start: null, end: null, when: 'over the relationship',
      words: [total20?.what, total22?.what].filter((x): x is string => !!x),
      level: agree && families.size >= 2 ? 'high' : total.confidence, sources: [...s20, ...s22], fromDays: [total20 ? d20.day : null, total22 ? d22.day : null].filter((x): x is number => x !== null),
    })
  }

  // Jane's own income, child support and business are not shown (privacy of a pseudonymous witness; review, Nov 2026).

  const dated = items.flatMap((i) => [i.start, i.end]).filter((x): x is string => !!x).sort()
  const first = isoToDate(dated[0] ?? day.date)?.date ?? new Date(0)
  const last = isoToDate(dated[dated.length - 1] ?? day.date)?.date ?? new Date(0)
  const omittedList = day.numbers.filter((n) => INTIMATE.test(n.what))
  const pool = day.sources
  const ids = new Set(pool.map((s) => s.id))
  return {
    items: items.map((i) => ({ ...i, label: redactThirdParties(i.label), words: i.words.map(redactThirdParties) })),
    domain: [toIso(utcYear.floor(first)), toIso(utcYear.offset(utcYear.floor(last), 1))],
    used,
    other: day.numbers.filter((n) => !used.includes(n) && !omittedList.includes(n)),
    omitted: omittedList.length,
    pool,
    extraSources: items.flatMap((i) => i.sources).filter((s) => !ids.has(s.id)),
  }
}
