import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import { expectSourcedPage, renderDay } from '../day-01/kit/testkit'
import Viz, { TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(2)

describe('Day 2 dual lifeline', () => {
  it('reads ages, the gap and the dated marks from the record', () => {
    const sel = select(day)
    expect(sel).not.toBeNull()
    expect(sel?.gap).toBe((sel?.hisAgeMet ?? 0) - (sel?.herAgeMet ?? 0))
    expect(sel?.events.map((e) => e.id)).toEqual(expect.arrayContaining(['met', 'signed', 'together', 'began', 'last']))
    expect(sel?.relationship?.readings.length).toBeGreaterThan(1)
    expect(sel?.deal?.released).toBe(1)
  })
  it('renders both drawings, the slider and a sourced table', () => {
    const { container } = renderDay(Viz, TextVersion, day)
    expectSourcedPage(container, day)
    expect(container.querySelectorAll('svg[role="img"]').length).toBe(2)
    expect(container.querySelector('input[type="range"]')).not.toBeNull()
  })
  it('changes when the record changes', () => {
    const before = renderDay(Viz, TextVersion, day).container.textContent
    cleanup()
    const altered = { ...day, numbers: day.numbers.map((n) => (/age when she met/i.test(n.what) && typeof n.value === 'number' ? { ...n, value: n.value * 2 } : n)) }
    expect(renderDay(Viz, TextVersion, altered).container.textContent).not.toEqual(before)
    cleanup()
    const noDeal = { ...day, numbers: day.numbers.filter((n) => !/Bad Boy deal/i.test(n.what)) }
    expect(select(noDeal)?.events.find((e) => e.id === 'signed')?.refs).not.toEqual(select(day)?.events.find((e) => e.id === 'signed')?.refs)
  })
})
