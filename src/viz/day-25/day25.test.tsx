import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, getDays } from '@/lib/data'
import Viz, { TextVersion } from './index'
import { selectDay25 } from './select'

afterEach(cleanup)

describe('Day 25 evidence treemap', () => {
  const day = getDay(25)
  it('counts every exhibit in the records', () => {
    const sel = selectDay25(day)
    const all = getDays().reduce((n, d) => n + d.exhibits.length, 0)
    expect(sel.total).toBe(all)
    expect(sel.groups.reduce((n, g) => n + g.exhibits.length, 0)).toBe(all)
    expect(sel.sealed).toBeGreaterThan(0)
  })
  it('never shows graphic, sexual or quoted message text, or third-party names', () => {
    const { container } = render(<div><Viz n={25} day={day} /><TextVersion n={25} day={day} /></div>)
    const html = container.innerHTML
    expect(html).not.toMatch(/Horny|Crack Pipe|fat lip|black eye|Cabral|Cowboys 4 Angels|Jules Theodore|freak/i)
    expect(container.querySelectorAll('[data-source-ids]').length).toBeGreaterThan(2)
  })
  it('changes when the record changes', () => {
    const altered = { ...day, exhibits: [...day.exhibits, 'Bank records (defense)'] }
    const sel = selectDay25(altered)
    expect(sel.total).toBe(selectDay25(day).total + 1)
    expect(sel.bySide.defense).toBe(selectDay25(day).bySide.defense + 1)
  })
})
