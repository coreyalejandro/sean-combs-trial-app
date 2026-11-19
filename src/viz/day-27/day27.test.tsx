import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import Viz, { TextVersion } from './index'
import { mapGeometry } from './mapgeo'
import { selectDay27 } from './select'

afterEach(cleanup)

describe('Day 27 arc map', () => {
  const day = getDay(27)
  it('draws arcs only where both ends are named, rings otherwise', () => {
    const sel = selectDay27(day)
    const g = mapGeometry(sel, 960, 480)
    expect(g.arcs.map((a) => a.tripId)).toEqual(['trip-atlanta-newark'])
    expect(g.rings.length).toBeGreaterThan(4)
    const atl = sel.trips.find((t) => t.id === 'trip-atlanta-newark')
    expect(atl?.count).toBe(5)
    expect(sel.trips.find((t) => t.id === 'trip-2009-flights')?.count).toBe(3)
    for (const t of sel.trips) expect(t.sources.length).toBeGreaterThan(0)
  })
  it('renders the map, trip list, tables and no worker names', () => {
    const { container } = render(<div><Viz n={27} day={day} /><TextVersion n={27} day={day} /></div>)
    expect(container.innerHTML).not.toMatch(/Cabral|Cowboys 4 Angels|Jules Theodore/)
    expect(container.querySelectorAll('[data-source-ids]').length).toBeGreaterThan(5)
  })
  it('changes when the record changes', () => {
    const before = render(<TextVersion n={27} day={day} />).container.querySelectorAll('tr').length
    cleanup()
    const after = render(<TextVersion n={27} day={{ ...day, numbers: day.numbers.slice(1) }} />).container.querySelectorAll('tr').length
    expect(after).toBeLessThan(before)
  })
})
