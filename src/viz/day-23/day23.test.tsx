import { cleanup, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import Viz, { TextVersion } from './index'
import { selectDay23 } from './select'

afterEach(cleanup)

describe('Day 23 waffle comparison', () => {
  const day = getDay(23)
  it('reads the three searches from their days', () => {
    const sel = selectDay23(day)
    expect(sel.sites.map((s) => s.total)).toEqual([5, 56, 1100])
    expect(sel.sites.map((s) => s.day)).toEqual([5, 8, 23])
    // One outlet family cannot be "two or more outlets"
    expect(sel.sites[2].confidence).not.toBe('high')
  })
  it('renders grids, tables and source tags', () => {
    const { container } = render(<div><Viz n={23} day={day} /><TextVersion n={23} day={day} /></div>)
    expect(within(container).getAllByRole('table').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('[data-source-ids]').length).toBeGreaterThan(5)
    expect(container.innerHTML).not.toMatch(/Lamon/)
  })
  it('changes when an amount changes', () => {
    const altered = { ...day, numbers: day.numbers.map((n) => (/astroglide seized/i.test(n.what) ? { ...n, value: 1800 } : n)) }
    expect(selectDay23(altered).sites[2].total).toBe(2000)
    const { container } = render(<Viz n={23} day={altered} />)
    expect(container.innerHTML).toMatch(/2,000/)
  })
})
