// The finale's jobs table: "workers gone" is a count of people. A unit slip (thousands counted twice) once
// printed 1,464.8 million nurses; these checks keep every row inside what the U.S. workforce can hold.
import { describe, expect, it } from 'vitest'
import meta from '../../../public/finale-data/meta.json'
import { summary } from './summary'
import { fmtPeople } from './format'

// BLS: about 163 million employed people aged 16 and over in 2024 (CPS table 11). A generous ceiling.
const US_WORKFORCE_CEILING = 200e6

describe('finale jobs table units', () => {
  const total = summary.jobs.find((j) => /^Total/.test(j.job))

  it('counts people, not thousands: all workers gone is a share of the U.S. workforce', () => {
    expect(total).toBeDefined()
    expect(total!.workers).toBeLessThan(US_WORKFORCE_CEILING * total!.share)
    expect(total!.workers).toBeGreaterThan(1e6)
  })

  it('no single job loses more workers than the whole workforce', () => {
    for (const j of summary.jobs) if (j !== total) expect(j.workers, j.job).toBeLessThan(total!.workers)
  })

  it('matches the map data the viewer uses', () => {
    const rows = (meta as unknown as { jobs?: Array<{ job: string; workers: number }> }).jobs ?? []
    for (const r of rows) {
      const s = summary.jobs.find((j) => j.job === r.job)
      if (s) expect(Math.abs(s.workers - r.workers), r.job).toBeLessThanOrEqual(1)
    }
  })

  it('prints nurses gone in the low millions, not thousands of millions', () => {
    const nurses = summary.jobs.find((j) => j.job === 'Registered nurses')
    expect(nurses).toBeDefined()
    expect(fmtPeople(nurses!.workers)).toBe('1.5 million')
  })
})
