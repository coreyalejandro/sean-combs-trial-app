import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import { expectSourcedPage, renderDay } from '@/viz/kits/days-01-07/testkit'
import type { AdditionsFile } from '@/viz/kits/days-01-07/refs'
import additions from './additions.json'
import Viz, { TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(6)

describe('Day 6 dot map', () => {
  it('places sourced accounts by witness, year and city', () => {
    const sel = select(day)
    expect(sel.witnesses.length).toBeGreaterThanOrEqual(2 + 2)
    expect(sel.accounts.every((a) => a.refs.length > 0)).toBe(true)
    expect(sel.yearFrom).toBeLessThanOrEqual(sel.yearTo)
    expect(sel.accounts.some((a) => a.placeId === 'place-jamaica')).toBe(true)
  })
  it('renders the maps, the list and a sourced table', () => {
    const { container } = renderDay(Viz, TextVersion, day)
    expectSourcedPage(container, day)
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(2)
    expect(container.querySelectorAll('[data-roving-index]').length).toBe(select(day).accounts.length)
  })
  it('changes when the record or the additions change', () => {
    const fewer: AdditionsFile = { ...(additions as AdditionsFile), items: (additions as AdditionsFile).items.filter((i) => !i.id.includes('kaplan')) }
    expect(select(day, fewer).accounts.length).toBe(select(day).accounts.length - 1)
    const noMorgan = { ...day, key_points: day.key_points.filter((k) => !/^Morgan:/.test(k)), summary: day.summary.replace(/Kerry Morgan/g, '') }
    expect(select(noMorgan).accounts.some((a) => a.witnessId === 'morgan')).toBe(false)
  })
})
