// Builder 1 kit (Days 1 to 7): turning data text into sourced facts, and numbering the sources a picture uses.
// Lives in day-01 because builders may only touch their own folders; see ../SHARED_REQUEST.md.
//
// Every fact a picture prints carries `refs` (its sources). Refs from the day's own pool keep the
// SourcesPanel numbering ([1], [2]); refs from other days' records or from additions.json get letters
// ([a], [b]) and are listed once, inside the figure, by <ExtraSources>.
import type { ExtraSource } from '@/viz/types'
import { allSources, getDays, redactThirdParties, resolveSources, type Confidence, type ReportedNumber, type Source, type TrialDay } from '@/lib/data'

export interface Ref {
  id: string
  outlet: string
  title: string
  url: string
  date: string
  /** The testimony day whose record supplied this source (other days only). */
  fromDay?: number
  /** True for sources added in this folder's additions.json. */
  added?: boolean
  /** Where the source comes from, when it is neither a day record nor an addition ("the verdict record"). */
  origin?: string
}

export type Level = Confidence | 'conflict'

/** One sourced statement taken from the data. */
export interface Fact {
  text: string
  refs: Ref[]
  confidence: Level
  /** Testimony day the statement comes from. */
  day: number
  /** True when no outlet is named in the text, so the whole day's record is cited. */
  wholeRecord?: boolean
}

export interface AdditionSource {
  outlet: string
  outlet_family: string
  title: string
  url: string
  date: string
}

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
}

export interface AdditionsFile {
  day: number
  items: AdditionItem[]
}

export function toRef(s: Source, fromDay?: number): Ref {
  return { id: s.id, outlet: s.outlet, title: s.title, url: s.url, date: s.date, fromDay }
}

/** Outlet words that appear in the data's text, and how each is written in a source's outlet name. */
const OUTLETS: Array<[RegExp, RegExp]> = [
  [/\bAP\b|Associated Press/, /Associated Press|\bAP\b/],
  [/\bCNN\b/, /CNN/],
  [/\bNBC\b/, /NBC/],
  [/\bABC\b|\bGMA\b|Good Morning America/, /ABC|Good Morning America|GMA/],
  [/\bFox\b|\bFOX\b/, /FOX|Fox/],
  [/\bCBS\b/, /CBS/],
  [/\bNPR\b/, /NPR/],
  [/Global News|\bGlobal\b/, /Global News/],
  [/Complex/, /Complex/],
  [/BlackAmericaWeb/, /BlackAmericaWeb/],
  [/Scripps/, /Scripps/],
  [/Yahoo/, /Yahoo/],
]

/** Sources in `pool` whose outlet is named in `text` ("(Fox 5)", "per CNN"). */
export function sourcesNamedIn(text: string, pool: Source[]): Source[] {
  const out: Source[] = []
  for (const [inText, inOutlet] of OUTLETS) {
    if (!inText.test(text)) continue
    for (const s of pool) if (inOutlet.test(s.outlet) && !out.includes(s)) out.push(s)
  }
  return out
}

/** The day's text fields a statement can come from, in the order they are searched. */
export function dayTexts(day: TrialDay): string[] {
  return [...day.key_points, ...day.exhibits, ...day.legal_events, ...day.locations, ...day.discrepancies, day.summary]
}

function singleSourced(day: TrialDay, text: string): boolean {
  const words = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter((w) => w.length > layoutWordMin)
  const t = new Set(words(text))
  return day.single_sourced.some((s) => {
    const w = words(s)
    return w.length > 0 && w.every((x) => t.has(x))
  })
}
// Words shorter than this are ignored when matching a statement to the "single-sourced" list.
const layoutWordMin = 2 + 1

/**
 * Find a statement in a day's record. Returns null when the record no longer contains it,
 * so a picture drops the mark instead of printing something the data does not say.
 * Confidence: "low" if the day lists it as single-sourced, otherwise "medium" (never higher:
 * statements carry no outlet count of their own).
 */
export function findFact(day: TrialDay, pattern: RegExp, opts: { within?: string[]; fallbackNumber?: RegExp } = {}): Fact | null {
  const texts = opts.within ?? dayTexts(day)
  const text = texts.find((t) => pattern.test(t))
  if (!text) return null
  let refs: Ref[] = sourcesNamedIn(text, day.sources).map((s) => toRef(s, day.day))
  let wholeRecord = false
  if (refs.length === 0 && opts.fallbackNumber) {
    const num = day.numbers.find((n) => opts.fallbackNumber?.test(n.what))
    if (num) refs = resolveSources(num, day.sources).map((s) => toRef(s, day.day))
  }
  if (refs.length === 0) {
    // Sources whose headline names the same person or place as the statement ("Florez", "Kid Cudi").
    const names = [...text.matchAll(/\b[A-Z][a-z]{2,}\b/g)].map((m) => m[0]).filter((w) => !COMMON.has(w))
    const titled = day.sources.filter((s) => names.some((n) => new RegExp(`\\b${n}\\b`).test(s.title)))
    refs = titled.map((s) => toRef(s, day.day))
  }
  if (refs.length === 0) {
    refs = day.sources.map((s) => toRef(s, day.day))
    wholeRecord = true
  }
  return { text: redactThirdParties(text), refs, confidence: singleSourced(day, text) ? 'low' : 'medium', day: day.day, wholeRecord }
}

/** Capitalised words too common to identify a source by its headline. */
const COMMON = new Set(['The', 'She', 'Her', 'His', 'Combs', 'Sean', 'Diddy', 'Ventura', 'Cassie', 'Trial', 'Day', 'Text', 'Texts', 'Photos', 'Photo', 'Message', 'Messages', 'Cross', 'Redirect', 'Direct', 'Judge', 'Defense', 'Prosecution', 'Two', 'Four', 'Dec', 'December', 'March', 'August', 'Los', 'Angeles', 'New', 'York', 'Hotel', 'Records', 'Record'])

/** One clause of a statement ("a; b; c" -> the clause matching `pattern`). */
export function clause(text: string, pattern: RegExp): string | null {
  return text.split(/;\s*/).find((c) => pattern.test(c)) ?? null
}

/** A reported number found by what it is, never by position. */
export function findNumber(day: TrialDay, pattern: RegExp, unit?: RegExp): ReportedNumber | null {
  return day.numbers.find((n) => pattern.test(n.what) && (!unit || unit.test(n.unit))) ?? null
}

export function numberRefs(day: TrialDay, num: ReportedNumber): Ref[] {
  return resolveSources(num, day.sources).map((s) => toRef(s, day.day))
}

/**
 * Refs for an additions.json item. A source that is the same article as one in trial_days.json reuses that
 * source's id (so it is listed once); others get namespaced ids that never collide with the data's.
 */
export function additionRefs(item: AdditionItem): Ref[] {
  return item.sources.map((s, i) => {
    const known = allSources().find((x) => x.url === s.url)
    if (known) return toRef(known, getDays().find((d) => d.sources.some((x) => x.id === known.id))?.day)
    return { id: `add-${item.id}-${i + 1}`, outlet: s.outlet, title: s.title, url: s.url, date: s.date, added: true }
  })
}

export interface RefIndex {
  /** Link text for every ref id used on the page: the number it has in the page's Sources panel. */
  labels: Record<string, string>
  /** Sources beyond the day's own list; the day module's extraSources() hands them to the shell's panel. */
  extras: Ref[]
}

export function buildIndex(pool: Source[], refs: Ref[]): RefIndex {
  // Numbers match the page's Sources panel: the day's own sources first, then the extras in this order
  // (the shell lists extraSources(day) after the day's own, de-duplicated by id and by URL, numbered on).
  const labels: Record<string, string> = {}
  const byUrl = new Map<string, string>()
  pool.forEach((s, i) => {
    labels[s.id] = String(i + 1)
    byUrl.set(s.url, labels[s.id])
  })
  const extras: Ref[] = []
  let numbered = pool.length
  for (const r of refs) {
    if (labels[r.id]) continue
    const same = byUrl.get(r.url)
    if (same) {
      // The same article under another id: same number; still handed to the panel, which gives it an anchor.
      labels[r.id] = same
    } else {
      numbered += 1
      labels[r.id] = String(numbered)
      byUrl.set(r.url, labels[r.id])
    }
    extras.push(r)
  }
  return { labels, extras }
}

/** The extras in the shape the shell's Sources panel lists them. */
export function toExtraSources(extras: Ref[]): ExtraSource[] {
  return extras.map((r) => ({
    id: r.id,
    outlet: r.outlet,
    title: r.title,
    url: r.url,
    date: r.date,
    origin: r.fromDay ? `cited in the Day ${r.fromDay} record` : r.origin ?? 'added for this picture',
  }))
}

/** De-duplicated refs, keeping first-seen order. */
export function uniqueRefs(refs: Ref[]): Ref[] {
  const seen = new Set<string>()
  return refs.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)))
}

/** The lower of two confidence levels ("conflict" counts as its own level and wins). */
export function weaker(a: Level, b: Level): Level {
  if (a === 'conflict' || b === 'conflict') return 'conflict'
  const order: Level[] = ['low', 'medium', 'high']
  return order.indexOf(a) <= order.indexOf(b) ? a : b
}

/** First four-digit year in a text ("2011-12" -> 2011), or null. */
export function yearIn(text: string | number): number | null {
  const m = String(text).match(/\b(1[89]\d\d|20\d\d)\b/)
  return m ? Number(m[1]) : null
}

/** All four-digit years in a text, in order. */
export function yearsIn(text: string | number): number[] {
  return [...String(text).matchAll(/\b(1[89]\d\d|20\d\d)\b/g)].map((m) => Number(m[1]))
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Month index (0-11) named or abbreviated in a text ("Dec", "December"), or null. */
export function monthIn(text: string): number | null {
  const i = MONTHS.findIndex((m) => new RegExp(`\\b${m.slice(0, MONTH_ABBR)}`, 'i').test(text))
  return i < 0 ? null : i
}
const MONTH_ABBR = 2 + 1

export function monthName(i: number): string {
  return MONTHS[i]
}
