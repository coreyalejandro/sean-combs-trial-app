// Day 20: the docket tracker's events and counts come from the record.
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, getWitnesses, type TrialDay } from '@/lib/data'
import Viz, { meta, TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(20)
const both = (d: TrialDay) => render(<div><Viz n={d.day} day={d} /><TextVersion n={d.day} day={d} /></div>)

describe('day 20', () => {
  it('counts denied mistrial motions and immunity orders from the data', () => {
    const sel = select(day)
    expect(sel.counts.motionsDenied).toBe(sel.events.filter((e) => e.kind === 'mistrial' && e.outcome === 'denied').length)
    expect(sel.counts.immunity).toBe(getWitnesses().filter((w) => w.immunity).length)
    expect(sel.events.find((e) => e.id === 'mistrial-2')?.outcome).toBe('denied')
    expect(meta.status).not.toBe('placeholder')
  })

  it('renders and filters by kind', () => {
    const { container, getByRole } = both(day)
    expect(within(container).getByRole('table')).toBeTruthy()
    const all = container.querySelectorAll('svg [role="button"]').length
    fireEvent.click(getByRole('button', { name: 'Juror issues' }))
    expect(container.querySelectorAll('svg [role="button"]').length).toBeLessThan(all)
  })

  it('drops the ruling when the record drops it', () => {
    const without: TrialDay = { ...day, legal_events: day.legal_events.filter((t) => !/second mistrial/i.test(t)) }
    expect(select(without).counts.motionsDenied).toBe(select(day).counts.motionsDenied - 1)
  })
})
