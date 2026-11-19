import { cleanup, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import Viz, { TextVersion } from './index'
import { selectDay22 } from './select'

afterEach(cleanup)
const BANNED = /Cowboys 4 Angels|Cabral|Jules Theodore|accuser/i

describe('Day 22 testimony Gantt', () => {
  const day = getDay(22)
  it('parses every session of Jane\'s testimony from the records', () => {
    const sel = selectDay22(day)
    expect(sel.rows.map((r) => r.n)).toEqual([17, 18, 19, 20, 21, 22])
    expect(sel.rows[0].segments[0].exam).toBe('direct')
    expect(sel.rows[3].segments[0].exam).toBe('cross')
    expect(sel.rows[5].segments.map((s) => s.exam)).toEqual(['closed', 'cross', 'redirect', 're-cross'])
    expect(sel.rows[1].lunch).not.toBeNull()
    expect(sel.rowsWithTimes).toBe(5)
    expect(sel.totalMinutes).toBeGreaterThan(0)
    expect(sel.finalAnswer?.text).toMatch(/worth/)
  })
  it('renders the picture and the text version with tables and source tags', () => {
    const { container } = render(<div><Viz n={22} day={day} /><TextVersion n={22} day={day} /></div>)
    expect(within(container).getAllByRole('table')).toHaveLength(1)
    expect(container.querySelectorAll('dl').length).toBeGreaterThan(5)
    expect(container.querySelectorAll('[data-source-ids]').length).toBeGreaterThan(5)
    expect(container.querySelectorAll('[data-roving-index]').length).toBeGreaterThan(5)
    expect(container.innerHTML).toMatch(/2:27 p\.m\./)
    expect(container.innerHTML).not.toMatch(BANNED)
  })
  it('changes when the record changes', () => {
    const before = render(<div><Viz n={22} day={day} /></div>).container.innerHTML
    cleanup()
    const altered = { ...day, numbers: day.numbers.map((n) => (/days jane was on the stand/i.test(n.what) ? { ...n, value: 10 } : n)) }
    const after = render(<div><Viz n={22} day={altered} /></div>).container.innerHTML
    expect(after).not.toEqual(before)
    expect(after).toMatch(/10 court days/)
  })
})
