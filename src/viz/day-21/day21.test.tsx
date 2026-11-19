// Day 21: payments, rent and the total from Days 17 to 22; the two-outlet switch.
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, type TrialDay } from '@/lib/data'
import Viz, { meta, TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(21)
const both = (d: TrialDay) => render(<div><Viz n={d.day} day={d} /><TextVersion n={d.day} day={d} /></div>)

describe('day 21', () => {
  it('finds rent, one-time payments, undated amounts and the total', () => {
    const sel = select(day)
    for (const kind of ['monthly', 'payment', 'undated', 'total'] as const) expect(sel.items.some((i) => i.kind === kind)).toBe(true)
    // Her own income is never shown (pseudonymous witness)
    expect(sel.items.some((i) => i.kind === 'income')).toBe(false)
    expect(sel.items.find((i) => i.id === 'rent')?.open).toBe(true)
    expect(meta.status).not.toBe('placeholder')
  })

  it('renders; the switch leaves only two-outlet amounts', () => {
    const { container, getAllByRole } = both(day)
    expect(within(container).getByRole('table')).toBeTruthy()
    const before = container.querySelectorAll('svg [role="button"]').length
    fireEvent.click(getAllByRole('switch')[0])
    expect(container.querySelectorAll('svg [role="button"]').length).toBeLessThan(before)
  })

  it('changes when the birthday amount doubles', () => {
    const a = both(day).container.textContent
    cleanup()
    const doubled: TrialDay = { ...day, numbers: day.numbers.map((n) => (/sent for .*birthday/i.test(n.what) && typeof n.value === 'number' ? { ...n, value: n.value * 2 } : n)) }
    expect(both(doubled).container.textContent).not.toBe(a)
  })
})
