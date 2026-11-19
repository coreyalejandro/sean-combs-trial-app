// Turning a number's free-text `source` field into real Source records with URLs.
import { data as publicData } from './store'
import type { ReportedNumber, Source, TrialDay } from './types'

const data = publicData

/**
 * Every source in the file (all days plus the verdict), de-duplicated by URL (the same article listed on
 * several days appears once). Source ids are unique per article; tests/unit/data.test.ts checks that.
 */
export function allSources(): Source[] {
  const seen = new Map<string, Source>()
  for (const d of data.days) for (const s of d.sources) if (!seen.has(s.url)) seen.set(s.url, s)
  for (const s of data.verdict.sources) if (!seen.has(s.url)) seen.set(s.url, s)
  return [...seen.values()]
}

/** The day (or 'verdict') whose record first lists a source id. */
export function sourceHome(id: string): number | 'verdict' | null {
  for (const d of data.days) if (d.sources.some((s) => s.id === id)) return d.day
  if (data.verdict.sources.some((s) => s.id === id)) return 'verdict'
  return null
}

export function sourceById(id: string): Source | undefined {
  for (const d of data.days) for (const s of d.sources) if (s.id === id) return s
  return data.verdict.sources.find((s) => s.id === id)
}

export function sourcesForDay(day: TrialDay): Source[] {
  return day.sources
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Outlet-family aliases used when a number names outlets instead of source ids. */
const FAMILY_ALIASES: Record<string, string[]> = {
  abc: ['abc', 'gma', 'goodmorningamerica', 'abc7', 'wokv'],
  fox: ['fox', 'fox5'],
  nbc: ['nbc'],
  cbs: ['cbs'],
  ap: ['ap', 'associatedpress'],
  cnn: ['cnn'],
  npr: ['npr'],
  pbs: ['pbs'],
  global: ['global'],
}

function outletMatches(outletName: string, sourceOutlet: string): boolean {
  const key = norm(outletName)
  const target = norm(sourceOutlet)
  const aliases = FAMILY_ALIASES[key] ?? [key]
  return aliases.some((a) => a.length > 0 && target.includes(a))
}

/**
 * Resolve a reported number to the sources that back it, within the given list
 * (normally the day's own sources). First by source ids named in `source`; if none
 * match, by the outlet names in `outlets` (and in `source`). Returns [] only if nothing matches.
 */
export function resolveSources(num: Pick<ReportedNumber, 'source' | 'outlets'>, pool: Source[]): Source[] {
  const tokens: string[] = num.source.match(/[A-Za-z0-9_]+/g) ?? []
  const byId = pool.filter((s) => tokens.includes(s.id))
  if (byId.length > 0) return byId
  const outletNames = new Set<string>(num.outlets)
  for (const part of num.source.split(/[;|,()]/)) {
    const p = part.replace(/also confirmed:/i, '').trim()
    if (p) outletNames.add(p.split(' ')[0])
  }
  const byOutlet = pool.filter((s) => [...outletNames].some((o) => outletMatches(o, s.outlet)))
  return byOutlet
}
