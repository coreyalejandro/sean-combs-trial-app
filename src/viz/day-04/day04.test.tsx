import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import { expectSourcedPage, renderDay } from '../day-01/kit/testkit'
import Viz, { TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(4)

describe('Day 4 message thread', () => {
  it('dates and orders the messages, with both readings', () => {
    const sel = select(day)
    expect(sel.messages.length).toBeGreaterThanOrEqual(2 + 2)
    const years = sel.messages.map((m) => m.from)
    expect([...years].sort((a, b) => a - b)).toEqual(years)
    expect(sel.messages.every((m) => m.defense.text.length > 0)).toBe(true)
    expect(sel.messages.find((m) => m.id === 'both')?.again.length).toBeGreaterThan(0)
  })
  it('renders paraphrased bubbles, step buttons and a sourced table', () => {
    const { container, getByRole } = renderDay(Viz, TextVersion, day)
    expectSourcedPage(container, day)
    expect(getByRole('button', { name: 'Step through' })).toBeTruthy()
    expect(container.textContent).not.toMatch(/always ready/i)
  })
  it('changes when the record changes', () => {
    const altered = { ...day, key_points: day.key_points.filter((k) => !/^Defense showed/.test(k)) }
    expect(select(altered).messages.length).toBeLessThan(select(day).messages.length)
  })
})
