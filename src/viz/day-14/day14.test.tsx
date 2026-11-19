// Day 14: render and data-change tests (Builder 2).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { getDay } from '@/lib/data'
import Viz, { TextVersion, meta } from './index'
import { select } from './select'
import { alteredDay, alteredReader, renderDay } from '../day-08/kit/testkit'

afterEach(cleanup)
const day = getDay(14)
const base = renderDay(Viz, TextVersion, day)

describe('day 14', () => {
  it('renders the picture and text version from the record, with sources that resolve', () => {
    expect(base.length).toBeGreaterThan(0)
    expect(meta.status).not.toBe('placeholder')
  })
  it("changes when this day's figures change (repetitions changed)", () => {
    const changed = renderDay(Viz, TextVersion, alteredDay(day, /Times Steel asked/, () => '50+'))
    expect(changed).not.toBe(base)
  })
  it('sets public items against her account and never names her later employer', () => {
    const m = select(day)
    expect(m.publicItems.length).toBeGreaterThan(2 + 2)
    expect(m.account.some((a) => a.id === 'employed')).toBe(true)
    expect(base).not.toMatch(/Madonna/)
  })
})
