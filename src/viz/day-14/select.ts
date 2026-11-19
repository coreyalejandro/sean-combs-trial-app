// Day 14: what Mia posted or sent (above the line) against her own account of the same years
// (below the line). Dated exhibits come from this folder's sourced additions.json (the record lists
// them in prose); her account comes from the Day 12 to 14 records.
import { getDay, type ReportedNumber, type TrialDay } from '@/lib/data'
import additionsJson from './additions.json'
import { monthYear, shortDate } from '@/viz/kits/days-08-14/geom'
import {
  D, withDay, buildSourceBook, firstYear, isoToDate, factFromAddition, factFromNumber, findNumber, leadingNumber, textFact, weakest, yearsIn,
  type AdditionsFile, type DayReader, type Fact, type SourceBook,
} from '@/viz/kits/days-08-14/facts'

export type Glyph = 'post' | 'gift' | 'text' | 'video'
export type Why = 'staff' | 'celebration' | 'fear'
export interface PublicItem { id: string; text: string; date: string | null; end: string | null; glyph: Glyph; why: Why; fact: Fact }
export interface AccountItem { id: string; text: string; date: string; end: string | null; fact: Fact; conflict?: string }
export interface Explanation { id: Why; text: string; fact: Fact }
export interface Day14Model {
  publicItems: PublicItem[]
  account: AccountItem[]
  explanations: Explanation[]
  repetitions: { count: number; fact: Fact } | null
  meetings: Fact | null
  laterJob: { fact: Fact; conflict: string | null } | null
  court: Fact[]
  years: [number, number]
  book: SourceBook
  used: ReportedNumber[]
}

export function select(day: TrialDay, read0: DayReader = getDay, additions: AdditionsFile = additionsJson as AdditionsFile): Day14Model {
  const read = withDay(day, read0)
  const used: ReportedNumber[] = []
  const num = (n: number, key: string, what: RegExp) => {
    const hit = findNumber(read, n, what)
    if (hit && n === day.day) used.push(hit.num)
    return factFromNumber(key, hit)
  }
  const d12 = D('Day 12'), d13 = D('Day 13'), d14 = D('Day 14')

  const publicItems: PublicItem[] = additions.items
    .map((item) => {
      const fact = factFromAddition(item)
      if (!fact) return null
      return { id: item.id, text: fact.text, date: item.date ?? null, end: typeof item.end === 'string' ? item.end : null, glyph: (item.glyph as Glyph) ?? 'text', why: (item.explained_by as Why) ?? 'fear', fact }
    })
    .filter((x): x is PublicItem => !!x)

  // Her account of the same years.
  const employed = num(d12, 'employed', /Mia's employment/i)
  const left = num(d13, 'left', /Revolt Films shut/i)
  const mediation = num(d13, 'mediation', /^Mediation/i)
  const call = num(d13, 'call', /Security staffer's call/i)
  const prosecutors = num(d14, 'prosecutors', /first meetings with prosecutors/i)
  const disclosure = read(d14).discrepancies.find((x) => /Disclosure timing/i.test(x)) ?? null
  const messages = num(d13, 'messages', /Combs's messages to Mia/i)
  const iso = (v: Fact['value']) => String(v ?? '').match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? String(yearsIn(v)[0] ?? '')
  const acc = (id: string, text: string, fact: Fact | null, end: string | null = null, conflict?: string): AccountItem | null =>
    fact ? { id, text, date: iso(fact.value), end, fact: conflict ? { ...fact, confidence: weakest('conflict', fact.confidence) } : fact, conflict } : null
  const span = employed ? yearsIn(employed.value) : []
  const account = [
    employed && span.length > 1 ? acc('employed', 'Working for Combs', employed, String(span[span.length - 1])) : null,
    acc('left', 'Left after Revolt Films shut down', left),
    acc('mediation', 'Mediation over her claims', mediation),
    acc('call', "A security staffer called her after Ventura's lawsuit", call),
    acc('prosecutors', 'First meetings with prosecutors', prosecutors, null, disclosure ?? undefined),
    acc('messages', 'Messages from Combs; she was terrified and did not respond', messages),
  ].filter((x): x is AccountItem => !!x)

  // Her explanations, as the record words them.
  const explanations = [
    { id: 'staff' as const, fact: textFact(read, d13, 'why-staff', 'key_points', /staff had to post support/i, /^(Fox News|NBC News)$/, 'medium', 'She said staff had to post support for Combs.') },
    { id: 'celebration' as const, fact: textFact(read, d13, 'why-celebration', 'key_points', /did not treat it as a celebration/i, /^(Fox News|NBC News)$/, 'medium', 'The defense framed the date of one birthday post as the anniversary of an alleged assault; she said she did not treat it as a celebration.') },
    { id: 'fear' as const, fact: textFact(read, d14, 'why-fear', 'key_points', /out of fear and job pressure/i, /^(Fox News|NBC News)$/, 'medium', 'She said the texts and posts were sent out of fear and job pressure.') },
  ]
    .filter((e): e is { id: Why; fact: Fact } => !!e.fact)
    .map((e) => ({ id: e.id, text: e.fact.text, fact: e.fact }))
  const terrified = textFact(read, d14, 'why-terrified', 'key_points', /terrified and brainwashed/i, /^(Fox News|NBC News)$/, 'medium', "On redirect she said she 'was terrified and brainwashed', and gave that as the reason for waiting to tell.")
  if (terrified) explanations.push({ id: 'fear', text: terrified.text, fact: terrified })

  const reps = num(d14, 'repetitions', /Times Steel asked/i)
  const repetitions = reps ? { count: leadingNumber(reps.value) ?? 0, fact: { ...reps, text: 'Times the defense lawyer asked her a version of the same question about whether she would post this (NPR’s count)' } } : null
  const meetings = num(d14, 'meetings', /Meetings with prosecutors since/i)
  // The employer's name is left out: it could narrow who Mia is (care rule 3). Only the lengths are shown.
  const jobRaw = read(d14).discrepancies.find((x) => /job: .*months/i.test(x)) ?? null
  const jobLengths = jobRaw ? [...jobRaw.matchAll(/(\d+) months \(([^)]+)\)/g)].map((m) => `${m[1]} months (${m[2]})`) : []
  const jobConflict = jobLengths.length > 1 ? `Outlets disagree on how long: ${jobLengths.join(' or ')}.` : null
  const laterJobText = read(d14).key_points.find((k) => /worked for .* after leaving/i.test(k))
  const laterJob = laterJobText
    ? { fact: { key: 'later-job', text: 'After leaving, she worked for another employer for several months', value: null, unit: '', confidence: jobConflict ? ('conflict' as const) : ('medium' as const), days: [d14], refs: textFact(read, d14, 'later-job-src', 'key_points', /worked for .* after leaving/i, /^(Fox News|NBC News)$/, 'medium')?.refs ?? [] }, conflict: jobConflict }
    : null

  const legal = (re: RegExp, key: string, text: string) => textFact(read, d14, key, 'legal_events', re, /^(Fox News|NBC News|NPR)/, 'medium', text)
  const court = [
    legal(/money grab/i, 'struck', "The defense's 'money grab' phrase was struck; jurors were told to disregard it."),
    legal(/argumentative and repetitive/i, 'cautioned', 'The judge found some cross-examination questions argumentative and repetitive and cautioned the defense lawyer.'),
  ].filter((f): f is Fact => !!f)

  const allYears = [...publicItems.flatMap((p) => yearsIn(`${p.date ?? ''} ${p.end ?? ''}`)), ...account.flatMap((a) => yearsIn(`${a.date} ${a.end ?? ''}`))]
  const years: [number, number] = [Math.min(...allYears), Math.max(...allYears)]
  const facts = [...publicItems.map((p) => p.fact), ...account.map((a) => a.fact), ...explanations.map((e) => e.fact), repetitions?.fact, meetings, laterJob?.fact, ...court]
  return { publicItems, account, explanations, repetitions, meetings, laterJob, court, years, book: buildSourceBook(day, facts), used }
}

/** "Nov 4, 2014", "December 2016", "2013 to 2016" or "date not stated". */
export function whenLabel(date: string | null, end?: string | null): string {
  if (!date) return 'date not stated'
  const parts = date.split('-')
  const one = (d: string, p: number) => (p === 1 ? d : p === 2 ? monthYear(isoToDate(d)) : `${shortDate(isoToDate(d))}, ${firstYear(d)}`)
  const label = one(date, parts.length)
  return end ? `${label} to ${end}` : label
}
