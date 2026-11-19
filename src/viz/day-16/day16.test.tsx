// Day 16: the chain-of-custody line renders its stops from the record.
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, type TrialDay } from '@/lib/data'
import Viz, { meta, TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(16)
const both = (d: TrialDay) => render(<div><Viz n={d.day} day={d} /><TextVersion n={d.day} day={d} /></div>)

describe('day 16', () => {
  it('finds every stop in the record, in time order', () => {
    const sel = select(day)
    expect(sel.stations.length).toBeGreaterThanOrEqual(2 + 2 + 2 + 2)
    const times = sel.stations.map((s) => s.when.date.getTime())
    expect([...times].sort((a, b) => a - b)).toEqual(times)
    expect(meta.status).not.toBe('placeholder')
  })

  it('renders the stops, a table and sources; Next stop moves on', () => {
    const { container, getByRole } = both(day)
    expect(within(container).getByRole('table')).toBeTruthy()
    expect(container.querySelectorAll('[data-source-ids]').length).toBeGreaterThan(0)
    const before = container.querySelector('[aria-expanded="true"]')?.textContent
    fireEvent.click(getByRole('button', { name: 'Next stop' }))
    expect(container.querySelector('[aria-expanded="true"]')?.textContent).not.toBe(before)
  })

  it('loses a stop when its fact leaves the record', () => {
    const without: TrialDay = { ...day, key_points: day.key_points.filter((k) => !/no anomalies/i.test(k)) }
    expect(select(without).stations.length).toBe(select(day).stations.length - 1)
    const a = both(day).container.querySelectorAll('li button[aria-expanded]').length
    cleanup()
    expect(both(without).container.querySelectorAll('li button[aria-expanded]').length).toBe(a - 1)
  })
})
