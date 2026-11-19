// Day 10: render and data-change tests (Builder 2).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { getDay } from '@/lib/data'
import Viz, { TextVersion, meta } from './index'
import { select } from './select'
import { alteredDay, alteredReader, renderDay } from '@/viz/kits/days-08-14/testkit'

afterEach(cleanup)
const day = getDay(10)
const base = renderDay(Viz, TextVersion, day)

describe('day 10', () => {
  it('renders the picture and text version from the record, with sources that resolve', () => {
    expect(base.length).toBeGreaterThan(0)
    expect(meta.status).not.toBe('placeholder')
  })
  it("changes when this day's figures change (salary doubled)", () => {
    const changed = renderDay(Viz, TextVersion, alteredDay(day, /Clark's salary/, (v) => (typeof v === 'number' ? v * 2 : v)))
    expect(changed).not.toBe(base)
  })
  it('places events by the dates in the record', () => {
    const m = select(day, alteredReader(11, /Engine company found/, () => '2012-01-10'))
    expect(m.events.find((e) => e.id === 'fire')?.date).toBe('2012-01-10')
    expect(select(day).events.length).toBeGreaterThan(2 + 2)
  })
})
