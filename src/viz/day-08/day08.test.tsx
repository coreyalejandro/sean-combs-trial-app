// Day 8: render and data-change tests (Builder 2).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { getDay } from '@/lib/data'
import Viz, { TextVersion, meta } from './index'
import { gap, select } from './select'
import { alteredDay, alteredReader, renderDay } from '@/viz/kits/days-08-14/testkit'

afterEach(cleanup)
const day = getDay(8)
const base = renderDay(Viz, TextVersion, day)

describe('day 08', () => {
  it('renders the picture and text version from the record, with sources that resolve', () => {
    expect(base.length).toBeGreaterThan(0)
    expect(meta.status).not.toBe('placeholder')
  })
  it("changes when this day's figures change (Hughes's fee doubled)", () => {
    const changed = renderDay(Viz, TextVersion, alteredDay(day, /Hughes's fee/, (v) => (typeof v === 'number' ? v * 2 : v)))
    expect(changed).not.toBe(base)
  })
  it('reads other days through the reader (a changed start year moves the row)', () => {
    const m = select(day, alteredReader(12, /Mia's employment/, () => '2010-2017'))
    expect(m.rows.find((r) => r.id === 'mia')?.start.year).toBe(2010)
    expect(gap(m.rows.find((r) => r.id === 'mia')!, 'legal')).toBe(7)
  })
  it('shows a zero wait and a missing date honestly', () => {
    const m = select(day)
    expect(gap(m.rows.find((r) => r.id === 'mescudi')!, 'legal')).toBe(0)
    expect(gap(m.rows.find((r) => r.id === 'bongolan')!, 'legal')).toBeNull()
  })
})
