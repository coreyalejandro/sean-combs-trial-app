import { cleanup, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import { expectSourcedPage, renderDay } from '../day-01/kit/testkit'
import Viz, { TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(3)

describe('Day 3 evidence matrix', () => {
  it('builds five dated rows and fills cells from many days', () => {
    const sel = select(day)
    expect(sel.rows.length).toBe(2 + 2 + 1)
    const days = new Set(sel.pieces.map((p) => p.day))
    expect(days.size).toBeGreaterThan(2 + 2)
    expect(sel.pieces.some((p) => p.row === 'hotel' && p.kind === 'video')).toBe(true)
    // the fill only grows
    for (let i = 1; i < sel.filledByDay.length; i++) expect(sel.filledByDay[i]).toBeGreaterThanOrEqual(sel.filledByDay[i - 1])
  })
  it('renders an ARIA grid and a sourced table', () => {
    const { container } = renderDay(Viz, TextVersion, day)
    expectSourcedPage(container, day)
    const grid = within(container).getByRole('grid')
    expect(within(grid).getAllByRole('gridcell').length).toBe(select(day).rows.length * (2 + 2 + 2))
  })
  it('changes when the record changes', () => {
    const before = select(day)
    const altered = { ...day, exhibits: day.exhibits.filter((e) => !/Uber selfies/.test(e)) }
    const after = select(altered)
    expect(after.pieces.length).toBe(before.pieces.length - 1)
    const noRow = { ...day, numbers: day.numbers.filter((n) => !/Malibu/.test(n.what)) }
    expect(select(noRow).rows.length).toBe(before.rows.length - 1)
  })
})
