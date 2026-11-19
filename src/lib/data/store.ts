// The public edition of the trial data. Everything the site prints comes through here.
// trial_days.json keeps the reporting as researched; this layer removes notes about how the research was done
// (which outlet was re-read, what was "single-sourced", tool notes about dates) and applies the care rules
// (third parties unnamed, no "accuser" label) to every piece of text, so no page can print a raw note by accident.
// tests/e2e/public-text.spec.ts checks every built page for anything that slips through.
import raw from '@/data/trial_days.json'
import { redactThirdParties } from './redact'
import type { TrialData } from './types'

/** Research-process fragments removed from any text before it is shown. Order matters (specific before general). */
const PROCESS_NOTES: Array<[RegExp, string]> = [
  // Notes inside parentheses: "(Global News; single source)", "(CBS live blog, single source)", "(single source)"
  [/\s*\((?:[^()]*?[;,]\s*)?single[- ]sourced?\)/gi, ''],
  [/\s*\((?:[^()]*?[;,]\s*)?re-?opened\)/gi, ''],
  [/\s*\((?:[^()]*?[;,]\s*)?earlier pass\)/gi, ''],
  [/\s*\(see key points\)/gi, ''],
  [/\s*\((?:fetch tool|inferred)[^()]*\)/gi, ''],
  [/\s*\(live blog rcna\d+\)/gi, ''],
  [/\s*\(rcna\d+\)/gi, ''],
  [/,\s*re-?opened\b/gi, ''],
  [/\s*[-;,]\s*single[- ]sourced?\b\.?/gi, ''],
  [/\s*\bsingle[- ]sourced?\b/gi, ''],
  [/^(?:RESOLVED|CONFLICT(?: \((?:open|unresolved)\))?)\s*-\s*/i, ''],
  [/\s*;\s*discrepancy flagged\)/gi, ')'],
  [/\s*\(\s*\)/g, ''],
]

/** A source's title as a reader should see it: no internal ids, broadcaster day counts or notes about the page. */
export function plainSourceTitle(title: string): string {
  return publicText(
    title
      .replace(/\s*\((?:live blog\s*)?rcna\d+\)/g, '')
      .replace(/\s*\([^)]*(?:ABC count|entries|relative timestamps|Day \d+)[^)]*\)/g, '')
      .replace(/^NBC News live blog/, 'Live updates from the Sean Combs trial')
      .replace(/\bSean Diddy Combs trial day \d+ \(live blog\)/, 'Sean Diddy Combs trial live updates')
      .replace(/\b(Diddy trial|Sean 'Diddy' Combs trial) Day \d+ recap\b/, '$1 recap'),
  )
}

export function publicText(text: string): string {
  const cleaned = PROCESS_NOTES.reduce((t, [re, rep]) => t.replace(re, rep), text)
  return redactThirdParties(cleaned).replace(/\s{2,}/g, ' ').trim()
}

/** Fields that are identifiers or lookup keys, never shown as prose: left exactly as recorded. */
const KEYS = new Set(['id', 'url', 'source', 'outlets', 'source_ids', 'day', 'date', 'confidence', 'level', 'opened_this_pass'])

function clean<T>(v: T, key = ''): T {
  if (typeof v === 'string') {
    if (key === 'date') return v.replace(/\s*\(.*$/, '') as unknown as T
    if (key === 'title') return plainSourceTitle(v) as unknown as T
    return (KEYS.has(key) ? v : publicText(v)) as unknown as T
  }
  if (Array.isArray(v)) return v.map((x) => clean(x, key)) as unknown as T
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = KEYS.has(k) && typeof x !== 'string' && k !== 'confidence' ? x : clean(x, k)
    return out as T
  }
  return v
}

export const data: TrialData = clean(raw as unknown as TrialData)
