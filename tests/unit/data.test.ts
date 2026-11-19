import { describe, expect, it } from 'vitest'
import raw from '@/data/trial_days.json'
import charges from '@/data/shared/charges.json'
import witnessesFile from '@/data/shared/witnesses.json'
import { chargeSchema, trialDataSchema, witnessRecordSchema } from '@/lib/data/schema'
import { allSources, getDays, getGaps, getVerdict, getWitnesses, resolveSources } from '@/lib/data'

// The testimony calendar (SOURCE_AUDIT.md, "Calendar check"). Day N = Nth day of testimony.
const DATES = [
  '2025-05-12', '2025-05-13', '2025-05-14', '2025-05-15', '2025-05-16', '2025-05-19', '2025-05-20',
  '2025-05-21', '2025-05-22', '2025-05-27', '2025-05-28', '2025-05-29', '2025-05-30', '2025-06-02',
  '2025-06-03', '2025-06-04', '2025-06-05', '2025-06-06', '2025-06-09', '2025-06-10', '2025-06-11',
  '2025-06-12', '2025-06-13', '2025-06-16', '2025-06-17', '2025-06-20', '2025-06-23', '2025-06-24',
]

describe('trial_days.json', () => {
  it('passes the schema', () => {
    const r = trialDataSchema.safeParse(raw)
    if (!r.success) console.error(r.error.issues.slice(0, 5))
    expect(r.success).toBe(true)
  })

  it('has days 1 to 28 on the testimony dates, in order', () => {
    const days = getDays()
    expect(days.map((d) => d.day)).toEqual(DATES.map((_, i) => i + 1))
    expect(days.map((d) => d.date)).toEqual(DATES)
  })

  it('has no testimony day on June 18, and records it as a gap after Day 25', () => {
    expect(getDays().some((d) => d.date === '2025-06-18')).toBe(false)
    const gaps = getGaps()
    expect(gaps).toHaveLength(1)
    expect(gaps[0].afterDay).toBe(25)
    expect(gaps[0].note).toMatch(/June 18/)
  })

  it('every source has a URL and every day has sources', () => {
    for (const s of allSources()) expect(s.url).toMatch(/^https?:\/\//)
    for (const d of getDays()) expect(d.sources.length).toBeGreaterThan(0)
  })

  it('each source id names one article (ids are unique across days)', () => {
    const urls = new Map<string, Set<string>>()
    for (const d of [...getDays(), getVerdict()]) for (const s of d.sources) urls.set(s.id, (urls.get(s.id) ?? new Set()).add(s.url))
    const shared = [...urls].filter(([, u]) => u.size > 1).map(([id]) => id)
    expect(shared).toEqual([])
  })

  it('every reported number resolves to at least one listed source', () => {
    const missing: string[] = []
    for (const d of getDays()) {
      for (const n of d.numbers) if (resolveSources(n, d.sources).length === 0) missing.push(`Day ${d.day}: ${n.what} [${n.source}]`)
    }
    const v = getVerdict()
    for (const n of v.numbers) if (resolveSources(n, v.sources).length === 0) missing.push(`Verdict: ${n.what} [${n.source}]`)
    expect(missing).toEqual([])
  })
})

describe('shared tables', () => {
  it('charges: five counts, valid, sources exist in the verdict', () => {
    const list = (charges as { charges: unknown[] }).charges
    expect(list).toHaveLength(5)
    const ids = new Set(getVerdict().sources.map((s) => s.id))
    for (const c of list) {
      const parsed = chargeSchema.parse(c)
      for (const id of parsed.source_ids) expect(ids.has(id)).toBe(true)
    }
  })

  it('witnesses: 34 rows, valid, and every day witness entry is matched', () => {
    const list = getWitnesses()
    expect(list).toHaveLength(34)
    for (const w of (witnessesFile as { witnesses: unknown[] }).witnesses) witnessRecordSchema.parse(w)
    for (const d of getDays()) {
      for (const w of d.witnesses) {
        if (/expected next/.test(w.name)) continue
        expect(list.some((r) => r.raw_names.includes(w.name) && r.days.includes(d.day)), `Day ${d.day}: ${w.name}`).toBe(true)
      }
    }
  })

  it('pseudonymous witnesses display only the pseudonym', () => {
    const pseud = getWitnesses().filter((w) => w.pseudonym)
    expect(pseud.map((w) => w.display_name).sort()).toEqual(['Jane', 'Mia'])
    for (const w of pseud) expect(w.role).toMatch(/pseudonym/)
  })
})
