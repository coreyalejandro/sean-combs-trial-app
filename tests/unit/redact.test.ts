// Care rules 3, 4 and 6: every day-file string that names a third party (or could identify a witness) is redacted.
import { describe, expect, it } from 'vitest'
import raw from '@/data/trial_days.json'
import { redactThirdParties, REDACTED_NAMES_FOR_TESTS } from '@/lib/data/redact'

function strings(v: unknown): string[] {
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) return v.flatMap(strings)
  if (v && typeof v === 'object') return Object.values(v).flatMap(strings)
  return []
}

describe('redactThirdParties', () => {
  it('leaves no protected name in any string of the data file', () => {
    for (const s of strings(raw)) {
      const out = redactThirdParties(s)
      for (const name of REDACTED_NAMES_FOR_TESTS) expect(out, s).not.toContain(name)
    }
  })
  it('reads naturally where it replaces', () => {
    expect(redactThirdParties('Flight records for escort Jules Theodore')).toBe('Flight records for a sex worker named in court records')
    expect(redactThirdParties('Madonna job: 6 months (Fox) vs 8 months (NBC).')).toBe('Her later job: 6 months (Fox) vs 8 months (NBC).')
    expect(redactThirdParties("Escort 'Paul' and 'Anton' (named in redirect)")).toBe('Two sex workers named in court records (named in redirect)')
  })
})
