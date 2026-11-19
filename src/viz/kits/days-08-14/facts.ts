// Builder 2 kit (Days 8 to 14): one shape for every fact a picture shows, whether it comes from
// a day's `numbers`, from another day's record, or from a day folder's sourced additions.json.
// Facts carry their source records; `buildSourceBook` gives each one a page id and footnote number.
// Sources are matched by URL: the same article can be listed under different ids on different days.
// (Source ids are now unique per article; the Day 2 and 3 ids that clashed with Days 13 and 14 were renamed.)
import { getDays, redactThirdParties, resolveSources, type Confidence, type ReportedNumber, type Source, type TrialDay } from '@/lib/data'

export type Level = Confidence | 'conflict'

/** A source a fact rests on. */
export interface SrcRec {
  id: string
  url: string
  outlet: string
  title: string
  date: string
  /** Testimony day whose record lists this source (null for additions.json references). */
  fromDay: number | null
}

/** A source as the page shows it: `key` is its page id (#source-key), `n` its footnote number. */
export interface SourceLink extends SrcRec {
  key: string
  n: number
}

/** One fact shown in a picture. Plain data, safe to pass to client components. */
export interface Fact {
  key: string
  /** Plain-language description of what the figure or event is (already redacted). */
  text: string
  /** The value as reported (number or text), when there is one. */
  value: number | string | null
  unit: string
  confidence: Level
  /** Testimony days whose record holds this fact. */
  days: number[]
  refs: SrcRec[]
}

export type DayReader = (n: number) => TrialDay

export interface AdditionSource { outlet: string; outlet_family: string; title: string; url: string; date: string }
export interface AdditionItem {
  id: string
  kind: string
  text: string
  value?: number | string
  unit?: string
  date?: string
  from_days: number[]
  confidence: Confidence
  sources: AdditionSource[]
  [extra: string]: unknown
}
export interface AdditionsFile { day: number; items: AdditionItem[] }

const rec = (s: Source, fromDay: number): SrcRec => ({ id: s.id, url: s.url, outlet: s.outlet, title: s.title, date: s.date, fromDay })

/** Find a reported number on day `n` by what it is (never by position). */
export function findNumber(read: DayReader, n: number, what: RegExp, unit?: RegExp): { num: ReportedNumber; day: TrialDay } | null {
  const day = read(n)
  const num = day.numbers.find((x) => what.test(x.what) && (!unit || unit.test(x.unit)))
  return num ? { num, day } : null
}

/** A Fact from a reported number on its own day, with sources resolved against that day's list. */
export function factFromNumber(key: string, hit: { num: ReportedNumber; day: TrialDay } | null, level?: Level): Fact | null {
  if (!hit) return null
  return {
    key,
    text: redactThirdParties(hit.num.what),
    value: hit.num.value,
    unit: hit.num.unit,
    confidence: level ?? hit.num.confidence,
    days: [hit.day.day],
    refs: resolveSources(hit.num, hit.day.sources).map((s) => rec(s, hit.day.day)),
  }
}

/** Shortcut: find and wrap in one call. */
export function numberFact(read: DayReader, n: number, key: string, what: RegExp, opts: { unit?: RegExp; level?: Level } = {}): Fact | null {
  return factFromNumber(key, findNumber(read, n, what, opts.unit), opts.level)
}

/** A Fact from day text (a key point, exhibit or legal event) backed by that day's sources from the named outlets. */
export function textFact(read: DayReader, n: number, key: string, field: 'key_points' | 'exhibits' | 'legal_events', match: RegExp, outlets: RegExp, confidence: Level, text?: string): Fact | null {
  const day = read(n)
  const found = day[field].find((x) => match.test(x))
  if (!found) return null
  return {
    key,
    text: redactThirdParties(text ?? found),
    value: null,
    unit: '',
    confidence,
    days: [n],
    refs: day.sources.filter((s) => outlets.test(s.outlet)).map((s) => rec(s, n)),
  }
}

/** Text (a key point, exhibit or legal event) from day `n` that matches, redacted. */
export function findText(read: DayReader, n: number, field: 'key_points' | 'exhibits' | 'legal_events' | 'discrepancies' | 'locations', match: RegExp): string | null {
  const t = read(n)[field].find((x) => match.test(x))
  return t ? redactThirdParties(t) : null
}

/** The day that lists a URL among its sources (for additions.json references that reuse one). */
function dayOfUrl(url: string): number | null {
  const hit = getDays().find((d) => d.sources.some((s) => s.url === url))
  return hit ? hit.day : null
}

export function factFromAddition(item: AdditionItem | undefined, level?: Level): Fact | null {
  if (!item) return null
  return {
    key: item.id,
    text: redactThirdParties(item.text),
    value: item.value ?? item.date ?? null,
    unit: item.unit ?? '',
    confidence: level ?? item.confidence,
    days: item.from_days,
    refs: item.sources.map((s, i) => {
      const n = dayOfUrl(s.url)
      const known = n ? getDays().find((d) => d.day === n)?.sources.find((x) => x.url === s.url) : undefined
      return known && n ? rec(known, n) : { id: `add-${item.id}-${i}`, url: s.url, outlet: s.outlet, title: s.title, date: s.date, fromDay: null }
    }),
  }
}

export function additionById(file: AdditionsFile, id: string): AdditionItem | undefined {
  return file.items.find((i) => i.id === id)
}

/** Every source a page cites: the day's own list first (same numbers as the Sources panel), then the rest. */
export interface SourceBook {
  /** url -> link (with its page id and footnote number). */
  byUrl: Record<string, SourceLink>
  /** Sources cited by the picture that the day's own Sources panel does not list. */
  extras: SourceLink[]
}

let ambiguous: Set<string> | null = null
/** Source ids used by two different articles somewhere in the record. */
function ambiguousIds(): Set<string> {
  if (!ambiguous) {
    const urls = new Map<string, Set<string>>()
    for (const d of getDays()) for (const s of d.sources) urls.set(s.id, (urls.get(s.id) ?? new Set()).add(s.url))
    ambiguous = new Set([...urls].filter(([, u]) => u.size > 1).map(([id]) => id))
  }
  return ambiguous
}

export function buildSourceBook(day: TrialDay, facts: Array<Fact | null | undefined>): SourceBook {
  const byUrl: Record<string, SourceLink> = {}
  day.sources.forEach((s, i) => {
    byUrl[s.url] = { ...rec(s, day.day), key: s.id, n: i + 1 }
  })
  const extras: SourceLink[] = []
  const taken = new Set(day.sources.map((s) => s.id))
  for (const f of facts) {
    if (!f) continue
    for (const r of f.refs) {
      if (byUrl[r.url]) continue
      let key = ambiguousIds().has(r.id) || taken.has(r.id) ? `${r.id}-d${r.fromDay ?? 'x'}` : r.id
      while (taken.has(key)) key = `${key}-b`
      taken.add(key)
      const link: SourceLink = { ...r, key, n: day.sources.length + extras.length + 1 }
      byUrl[r.url] = link
      extras.push(link)
    }
  }
  return { byUrl, extras }
}

/** Pick the less certain of two levels (a conflict is the least certain). */
export function weakest(a: Level, b: Level): Level {
  const order: Level[] = ['conflict', 'low', 'medium', 'high']
  return order.indexOf(a) <= order.indexOf(b) ? a : b
}

/** Merge facts that say the same thing: union of days and sources, weakest confidence kept. */
export function mergeFacts(key: string, text: string, parts: Array<Fact | null>): Fact | null {
  const ok = parts.filter((p): p is Fact => !!p)
  if (ok.length === 0) return null
  return {
    key,
    text,
    value: ok[0].value,
    unit: ok[0].unit,
    confidence: ok.map((p) => p.confidence).reduce((a, b) => strongest(a, b)),
    days: [...new Set(ok.flatMap((p) => p.days))].sort((a, b) => a - b),
    refs: ok.flatMap((p) => p.refs).filter((r, i, all) => all.findIndex((x) => x.url === r.url) === i),
  }
}

/** Two independent records of the same fact: keep the stronger stated confidence. */
export function strongest(a: Level, b: Level): Level {
  return weakest(a, b) === a ? b : a
}

// ---------- dates in reported values and text ----------

const YEAR = /\b(19|20)\d\d\b/g

/** Every four-digit year in a value or text ("2009-2017" -> [2009, 2017]). */
export function yearsIn(v: number | string | null | undefined): number[] {
  if (v === null || v === undefined) return []
  return [...String(v).matchAll(YEAR)].map((m) => Number(m[0]))
}

export const firstYear = (v: number | string | null | undefined): number | null => yearsIn(v)[0] ?? null
export const lastYear = (v: number | string | null | undefined): number | null => {
  const ys = yearsIn(v)
  return ys.length ? ys[ys.length - 1] : null
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** "Dec 14, 2011" / "December 14, 2011" / "2011-12-14" -> ISO date strings, in order of appearance. */
export function datesIn(text: string): string[] {
  const out: Array<{ at: number; iso: string }> = []
  const pad = (x: number) => String(x).padStart(2, '0')
  for (const m of text.matchAll(/\b(19|20)(\d\d)-(\d\d)-(\d\d)\b/g)) out.push({ at: m.index ?? 0, iso: m[0] })
  for (const m of text.matchAll(/\b([A-Z][a-z]{2})[a-z]*\.? (\d{1,2}),? ((?:19|20)\d\d)\b/g)) {
    const [, mon, dd, yyyy] = m
    const mi2 = MONTHS.indexOf(mon.toLowerCase())
    if (mi2 >= 0) out.push({ at: m.index ?? 0, iso: `${yyyy}-${pad(mi2 + 1)}-${pad(Number(dd))}` })
  }
  return out.sort((a, b) => a.at - b.at).map((x) => x.iso)
}

/** Parse an ISO date (or "YYYY-MM") as a UTC Date. */
export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1))
}

/** Leading whole number in a value ("100+" -> 100, "~40" -> 40). */
export function leadingNumber(v: number | string | null | undefined): number | null {
  if (typeof v === 'number') return v
  if (!v) return null
  const m = String(v).replace(/,/g, '').match(/\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

/** Every dollar amount written in a text ("$200,000 (Fox, NBC) vs $250,000 (Global News)"). */
export function dollarsIn(text: string): Array<{ value: number; note: string }> {
  return [...text.matchAll(/\$([\d,]+(?:\.\d+)?)\s*(?:\(([^)]*)\))?/g)].map((m) => ({ value: Number(m[1].replace(/,/g, '')), note: m[2] ?? '' }))
}

/** A testimony day written as words ("Day 19" -> 19), so day references read as references, not figures. */
export const D = (ref: string): number => Number(ref.replace(/\D/g, ''))

/** A reader that returns `day` itself for its own number (so a changed record changes the picture). */
export const withDay = (day: TrialDay, read: DayReader): DayReader => (n: number) => (n === day.day ? day : read(n))
