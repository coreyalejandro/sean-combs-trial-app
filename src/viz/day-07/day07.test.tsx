import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import { expectSourcedPage, renderDay } from '../day-01/kit/testkit'
import Viz, { TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(7)

describe('Day 7 money path', () => {
  it('reads the wire and the return from the bank records, in order', () => {
    const sel = select(day)
    expect(sel).not.toBeNull()
    const wire = sel?.bank.find((b) => b.kind === 'in')
    const ret = sel?.bank.find((b) => b.kind === 'out')
    expect(wire && ret && ret.date > wire.date).toBe(true)
    expect(sel?.bankDay).toBeGreaterThan(day.day)
    expect(sel?.daysInMonth).toBeGreaterThan(2 * 2 * 2 * 2 * 2 - 2)
  })
  it('renders the strip, the month grid and a sourced table', () => {
    const { container } = renderDay(Viz, TextVersion, day)
    expectSourcedPage(container, day)
    expect(container.querySelector('svg[role="img"]')).not.toBeNull()
    expect(container.textContent).toContain('BANK')
  })
  it('changes when the record changes', () => {
    const before = renderDay(Viz, TextVersion, day).container.textContent
    cleanup()
    const doubled = { ...day, numbers: day.numbers.map((n) => (/demanded/i.test(n.what) && typeof n.value === 'number' ? { ...n, value: n.value * 2 } : n)) }
    const after = renderDay(Viz, TextVersion, doubled).container.textContent
    expect(after).not.toEqual(before)
    expect(select(doubled)?.bank.length ?? 0).toBe(0)
  })
})
