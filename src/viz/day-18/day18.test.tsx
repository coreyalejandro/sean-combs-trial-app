// Day 18: durations in hours from both women's testimony; the overlap is calculated.
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, type TrialDay } from '@/lib/data'
import Viz, { meta, TextVersion } from './index'
import { select, toHours } from './select'

afterEach(cleanup)
const day = getDay(18)
const both = (d: TrialDay) => render(<div><Viz n={d.day} day={d} /><TextVersion n={d.day} day={d} /></div>)

describe('day 18', () => {
  it('converts reported units to hours', () => {
    const range = day.numbers.find((n) => /^longest/i.test(n.what))
    const h = range ? toHours(range.value, range.unit) : null
    expect(h && h[1] > h[0]).toBe(true)
  })

  it('has rows for both women and recovery, and an overlap', () => {
    const sel = select(day)
    expect(sel.spans.some((s) => s.who === 'ventura')).toBe(true)
    expect(sel.spans.some((s) => s.who === 'jane')).toBe(true)
    expect(sel.spans.some((s) => s.who === 'recovery')).toBe(true)
    expect(sel.overlap).not.toBeNull()
    expect(meta.status).not.toBe('placeholder')
  })

  it('renders without bodily detail, and switches units', () => {
    const { container, getByRole } = both(day)
    expect(within(container).getByRole('table')).toBeTruthy()
    expect(container.querySelector('table')?.textContent).not.toMatch(/UTI|yeast|piercing/i)
    expect(container.querySelector('svg')?.textContent).not.toMatch(/UTI|yeast|piercing/i)
    fireEvent.click(getByRole('button', { name: 'Days' }))
    expect(container.textContent).toMatch(/ days/)
  })

  it('changes when a figure is removed', () => {
    const a = both(day).container.querySelectorAll('tr').length
    cleanup()
    const fewer: TrialDay = { ...day, numbers: day.numbers.filter((n) => !/^shortest/i.test(n.what)) }
    expect(both(fewer).container.querySelectorAll('tr').length).toBeLessThan(a)
  })
})
