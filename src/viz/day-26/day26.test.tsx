import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import Viz, { TextVersion } from './index'
import { selectDay26 } from './select'

afterEach(cleanup)

describe('Day 26 people-by-task grid', () => {
  const day = getDay(26)
  it('draws only links the records support, and keeps Ferguson unlinked', () => {
    const sel = selectDay26(day)
    expect(sel.links.some((l) => l.from === 'kaplan' && l.to === 'clean')).toBe(true)
    expect(sel.links.some((l) => l.from === 'khorram' && l.to === 'paul')).toBe(true)
    expect(sel.links.some((l) => l.from === 'ferguson' || l.to === 'ferguson')).toBe(false)
    expect(sel.unlinked.find((u) => u.id === 'ferguson')?.evidence).toMatch(/never saw/)
    for (const l of sel.links) expect(l.evidence.length).toBeGreaterThan(0)
    // Mia is not drawn in a diagram of an alleged enterprise; the link resting on Clark's account was removed.
    expect(sel.people.some((p) => p.id === 'mia')).toBe(false)
    expect(sel.links.some((l) => l.to === 'clark')).toBe(false)
    expect(sel.directors.find((d) => d.id === 'khorram')?.label).toMatch(/not charged, did not testify/)
  })
  it('renders the grid, the acquittal and source tags', () => {
    const { container } = render(<div><Viz n={26} day={day} /><TextVersion n={26} day={day} /></div>)
    expect(container.querySelectorAll('[data-testid=day26-hive] button').length).toBeGreaterThan(10)
    expect(container.textContent).toMatch(/not guilty of racketeering conspiracy/)
    expect(container.querySelectorAll('table')).toHaveLength(1)
    expect(container.querySelectorAll('dl').length).toBeGreaterThan(5)
    expect(container.querySelectorAll('[data-source-ids]').length).toBeGreaterThan(5)
  })
  it('changes when the record changes', () => {
    const altered = { ...day, key_points: day.key_points.filter((k) => !/marijuana/.test(k)) }
    expect(selectDay26(altered).links.length).toBeLessThan(selectDay26(day).links.length)
  })
})
