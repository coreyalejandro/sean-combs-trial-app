// Day 19: swimlane events in time order, from several days; zoom and lane filters.
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, type TrialDay } from '@/lib/data'
import Viz, { meta, TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(19)
const both = (d: TrialDay) => render(<div><Viz n={d.day} day={d} /><TextVersion n={d.day} day={d} /></div>)

describe('day 19', () => {
  it('orders events from the lawsuit to the arrest', () => {
    const sel = select(day)
    expect(sel.events[0].id).toBe('lawsuit')
    expect(sel.events[sel.events.length - 1].id).toBe('arrest')
    const isos = sel.events.map((e) => e.iso)
    expect([...isos].sort()).toEqual(isos)
    expect(meta.status).not.toBe('placeholder')
  })

  it('leaves injury detail out', () => {
    const { container } = both(day)
    expect(container.textContent).not.toMatch(/welt|slap/i)
    expect(within(container).getByRole('table')).toBeTruthy()
  })

  it('zooms to a month and filters lanes', () => {
    const { container, getAllByRole } = both(day)
    const all = container.querySelectorAll('[role="button"]').length
    fireEvent.click(getAllByRole('button', { name: /^Nov/ })[0])
    expect(container.querySelectorAll('[role="button"]').length).toBeLessThan(all)
    fireEvent.click(getAllByRole('checkbox')[0])
    expect((getAllByRole('checkbox')[0] as HTMLInputElement).checked).toBe(false)
  })

  it('loses an event when the record loses it', () => {
    const fewer: TrialDay = { ...day, numbers: day.numbers.filter((n) => !/cash from bodyguard/i.test(n.what)) }
    expect(select(fewer).events.length).toBe(select(day).events.length - 1)
  })
})
