// Day 15: the Sankey renders from the record, and changes when the record changes.
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, type TrialDay } from '@/lib/data'
import Viz, { meta, TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(15)
const both = (d: TrialDay) => render(<div><Viz n={d.day} day={d} /><TextVersion n={d.day} day={d} /></div>)

describe('day 15', () => {
  it('draws the cash, Garcia\'s share and the calculated rest from the data', () => {
    const sel = select(day)
    const cash = sel.nodes.find((n) => n.id === 'cash')
    const garcia = sel.nodes.find((n) => n.id === 'garcia')
    const rest = sel.nodes.find((n) => n.id === 'rest')
    expect(cash?.amount).toBeGreaterThan(0)
    expect(rest?.amount).toBe((cash?.amount ?? 0) - (garcia?.amount ?? 0))
    expect(sel.payHours?.hours).toBeGreaterThan(0)
    expect(meta.status).not.toBe('placeholder')
  })

  it('renders a table, source tags and confidence words', () => {
    const { container } = both(day)
    const table = within(container).getByRole('table')
    expect(within(table).getAllByRole('row').length).toBeGreaterThan(day.numbers.length)
    expect(container.querySelectorAll('[data-source-ids]').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.conf-label').length).toBeGreaterThan(0)
    expect(container.textContent).toContain('calculated')
  })

  it('the confidence switch hides one-outlet parts', () => {
    const { container, getAllByRole } = both(day)
    const before = container.querySelectorAll('[aria-pressed]').length
    fireEvent.click(getAllByRole('switch')[0])
    expect(container.querySelectorAll('[aria-pressed]').length).toBeLessThan(before)
  })

  it('changes when an amount doubles', () => {
    const doubled: TrialDay = { ...day, numbers: day.numbers.map((n) => (/kept\b/i.test(n.what) && typeof n.value === 'number' ? { ...n, value: n.value * 2 } : n)) }
    const a = both(day).container.textContent
    cleanup()
    const b = both(doubled).container.textContent
    expect(b).not.toBe(a)
  })
})
