import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import { expectSourcedPage, renderDay } from '../day-01/kit/testkit'
import Viz, { TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(5)

describe('Day 5 isotype', () => {
  it('draws one icon per unit from the figures', () => {
    const sel = select(day)
    const cash = sel.items.find((i) => i.id === 'cash')
    const oil = sel.items.find((i) => i.id === 'bottle')
    const cashNum = day.numbers.find((n) => /cash found/i.test(n.what))
    expect(cash?.icons).toBe(Number(String(cashNum?.value)[0]))
    expect(oil?.icons).toBe(day.numbers.find((n) => /baby oil bottles/i.test(n.what))?.value)
    expect(sel.agent?.name).toBe('Yasin Binda')
    expect(sel.stand?.endedToday).toBe(true)
  })
  it('renders icons as buttons and a sourced table', () => {
    const { container } = renderDay(Viz, TextVersion, day)
    expectSourcedPage(container, day)
    const icons = container.querySelectorAll('[data-roving-index]')
    expect(icons.length).toBe(select(day).items.reduce((t, i) => t + i.icons, 0))
  })
  it('changes when the record changes', () => {
    const before = renderDay(Viz, TextVersion, day).container.querySelectorAll('[data-roving-index]').length
    cleanup()
    const altered = { ...day, numbers: day.numbers.filter((n) => !/baby oil bottles/i.test(n.what)) }
    expect(renderDay(Viz, TextVersion, altered).container.querySelectorAll('[data-roving-index]').length).toBeLessThan(before)
  })
})
