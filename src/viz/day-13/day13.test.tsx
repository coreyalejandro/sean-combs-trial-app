// Day 13: render and data-change tests (Builder 2).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { getDay } from '@/lib/data'
import Viz, { TextVersion, meta } from './index'
import { select } from './select'
import { alteredDay, alteredReader, renderDay } from '../day-08/kit/testkit'

afterEach(cleanup)
const day = getDay(13)
const base = renderDay(Viz, TextVersion, day)

describe('day 13', () => {
  it('renders the picture and text version from the record, with sources that resolve', () => {
    expect(base.length).toBeGreaterThan(0)
    expect(meta.status).not.toBe('placeholder')
  })
  it("changes when this day's figures change (demand doubled)", () => {
    const changed = renderDay(Viz, TextVersion, alteredDay(day, /Initial mediation demand/, (v) => (typeof v === 'number' ? v * 2 : v)))
    expect(changed).not.toBe(base)
  })
  it('steps down from asked to received, and shows the disputed share', () => {
    const m = select(day)
    const [asked, settled, share] = m.mia
    expect(asked.value).toBeGreaterThan(settled.value)
    expect(settled.value).toBeGreaterThan(share.value)
    expect(share.fact.confidence).toBe('conflict')
    expect(share.alt?.value).toBe(250000)
  })
})
