// Day 11: render and data-change tests (Builder 2).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { getDay } from '@/lib/data'
import Viz, { TextVersion, meta } from './index'
import { select } from './select'
import { alteredDay, alteredReader, renderDay } from '../day-08/kit/testkit'

afterEach(cleanup)
const day = getDay(11)
const base = renderDay(Viz, TextVersion, day)

describe('day 11', () => {
  it('renders the picture and text version from the record, with sources that resolve', () => {
    expect(base.length).toBeGreaterThan(0)
    expect(meta.status).not.toBe('placeholder')
  })
  it("changes when this day's figures change (one figure removed)", () => {
    const changed = renderDay(Viz, TextVersion, { ...day, numbers: day.numbers.filter((n) => !/Engine company/.test(n.what)) })
    expect(changed).not.toBe(base)
  })
  it('marks steps the testimony says did not happen', () => {
    const m = select(day)
    expect(m.steps.find((s) => s.id === 'collected')?.status).toBe('not-done')
    expect(m.steps.find((s) => s.id === 'report')?.status).toBe('done')
    const noGlove = select({ ...day, key_points: day.key_points.map((k) => k.replace('not collected', 'collected')) }, (n) => (n === day.day ? { ...day, key_points: day.key_points.map((k) => k.replace('not collected', 'collected')) } : getDay(n)))
    expect(noGlove.steps.find((s) => s.id === 'collected')?.status).toBe('done')
  })
})
