import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import Viz, { TextVersion } from './index'
import { selectDay24, stateAt } from './select'

afterEach(cleanup)

describe('Day 24 jury box tracker', () => {
  const day = getDay(24)
  it('builds the reported jury events in date order', () => {
    const sel = selectDay24(day)
    expect(sel.jurors).toBe(12)
    expect(sel.alternatesStart).toBe(6)
    expect(sel.seat).toBe(6)
    const dates = sel.events.map((e) => e.date)
    expect([...dates].sort()).toEqual(dates)
    expect(dates).toContain('2025-06-16')
    expect(dates).toContain('2025-06-18')
    const last = stateAt(sel, sel.events.length - 1)
    expect(last.seat).toBe('replaced')
    expect(last.alternates).toBe(5)
  })
  it('renders the box, the ordered list and source tags', () => {
    const { container } = render(<div><Viz n={24} day={day} /><TextVersion n={24} day={day} /></div>)
    expect(container.querySelector('input[type="range"]')).not.toBeNull()
    expect(container.querySelectorAll('ol li').length).toBeGreaterThan(6)
    expect(container.querySelectorAll('[data-source-ids]').length).toBeGreaterThan(5)
  })
  it('changes when the record changes', () => {
    const altered = { ...day, legal_events: day.legal_events.filter((l) => !/formally dismissed/i.test(l)) }
    expect(selectDay24(altered).events.length).toBe(selectDay24(day).events.length - 1)
  })
})
