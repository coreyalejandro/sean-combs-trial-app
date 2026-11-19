// Day 12: render and data-change tests (Builder 2).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { getDay } from '@/lib/data'
import Viz, { TextVersion, meta } from './index'
import { parseClockRange, select } from './select'
import { alteredDay, alteredReader, renderDay } from '@/viz/kits/days-08-14/testkit'

afterEach(cleanup)
const day = getDay(12)
const base = renderDay(Viz, TextVersion, day)

describe('day 12', () => {
  it('renders the picture and text version from the record, with sources that resolve', () => {
    expect(base.length).toBeGreaterThan(0)
    expect(meta.status).not.toBe('placeholder')
  })
  it("changes when this day's figures change (sleep stretch doubled)", () => {
    const changed = renderDay(Viz, TextVersion, alteredDay(day, /Longest stretch without sleep she reported/, (v) => (typeof v === 'number' ? v * 2 : v)))
    expect(changed).not.toBe(base)
  })
  it('calculates hours from a clock range and reads other days', () => {
    expect(parseClockRange('7 a.m. - 4 a.m.')).toEqual({ start: 7, end: 4 })
    const m = select(day)
    expect(m.people.find((p) => p.id === 'clark')?.span?.hours).toBe(21)
    const m2 = select(day, alteredReader(6, /James's workdays/, () => '21'))
    expect(m2.people.find((p) => p.id === 'james')?.span?.hours).toBe(21)
  })
})
