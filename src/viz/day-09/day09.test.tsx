// Day 9: render and data-change tests (Builder 2).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { getDay } from '@/lib/data'
import Viz, { TextVersion, meta } from './index'
import { select } from './select'
import { alteredDay, alteredReader, renderDay } from '../day-08/kit/testkit'

afterEach(cleanup)
const day = getDay(9)
const base = renderDay(Viz, TextVersion, day)

describe('day 09', () => {
  it('renders the picture and text version from the record, with sources that resolve', () => {
    expect(base.length).toBeGreaterThan(0)
    expect(meta.status).not.toBe('placeholder')
  })
  it("changes when this day's figures change (hotel charge doubled)", () => {
    const changed = renderDay(Viz, TextVersion, alteredDay(day, /candle-wax/, (v) => (typeof v === 'number' ? v * 2 : v)))
    expect(changed).not.toBe(base)
  })
  it('links Frank Black to the most places', () => {
    const m = select(day)
    const count = (a: string) => m.links.filter((l) => l.alias === a).length
    expect(m.aliases[0].name).toBe('Frank Black')
    expect(count('Frank Black')).toBeGreaterThan(count('Frank White'))
  })
  it('reads other days through the reader (a changed bill changes a place note)', () => {
    const a = select(day).places.flatMap((p) => p.notes.map((n) => n.fact.text)).join()
    const b = select(day, alteredReader(24, /Trump International Hotel bill/, (v) => (typeof v === 'number' ? v * 2 : v))).places.flatMap((p) => p.notes.map((n) => n.fact.text)).join()
    expect(a).not.toBe(b)
  })
})
