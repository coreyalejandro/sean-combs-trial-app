// Day 17: records, witness and ruling layers; the two cities and the calculated distance.
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, type TrialDay } from '@/lib/data'
import Viz, { meta, TextVersion } from './index'
import { select, stripDays } from './select'

afterEach(cleanup)
const day = getDay(17)
const both = (d: TrialDay) => render(<div><Viz n={d.day} day={d} /><TextVersion n={d.day} day={d} /></div>)

describe('day 17', () => {
  it('places the hotel stay in New York and the photo date in Los Angeles, on the same day', () => {
    const sel = select(day)
    const stay = sel.marks.find((m) => m.id === 'stay')
    const photos = sel.marks.find((m) => m.id === 'photos')
    expect(stay?.lane).toBe('ny')
    expect(photos?.lane).toBe('la')
    expect(photos && stay && photos.start >= stay.start && photos.start <= stay.end).toBe(true)
    expect(sel.miles).toBeGreaterThan(0)
    expect(stripDays(sel.marks).length).toBeGreaterThan(1)
    expect(sel.ruling?.words.join(' ')).toMatch(/Perry Mason/)
    expect(meta.status).not.toBe('placeholder')
  })

  it('renders, and the layer buttons hide what they name', () => {
    const { container, getByRole } = both(day)
    expect(within(container).getByRole('table')).toBeTruthy()
    expect(container.textContent).toMatch(/What the judge ruled/)
    fireEvent.click(getByRole('button', { name: 'What the judge ruled' }))
    expect(container.querySelector('[aria-pressed="false"]')).toBeTruthy()
  })

  it('changes when the stay changes', () => {
    const moved: TrialDay = { ...day, numbers: day.numbers.filter((n) => !/stay at/i.test(n.what)) }
    const a = both(day).container.textContent
    cleanup()
    expect(both(moved).container.textContent).not.toBe(a)
  })
})
