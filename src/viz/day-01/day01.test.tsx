import { cleanup, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay } from '@/lib/data'
import Viz, { TextVersion } from './index'
import { select } from './select'

afterEach(cleanup)
const day = getDay(1)

function renderBoth(d = day) {
  return render(
    <div>
      <Viz n={1} day={d} />
      <TextVersion n={1} day={d} />
    </div>,
  )
}

describe('Day 1 claim diff', () => {
  it('pairs each side’s opening claims by topic, from the record', () => {
    const sel = select(day)
    expect(sel.openings.map((o) => o.side)).toEqual(['prosecution', 'defense'])
    const payment = sel.rows.find((r) => r.id === 'payment')
    expect(payment?.prosecution?.text).toMatch(/hotel video/)
    expect(payment?.defense?.text).toMatch(/publicity/)
    expect(payment?.prosecution?.figures.some((f) => f.num.unit === 'USD')).toBe(true)
    expect(payment?.laterDays).toContain(15)
    expect(sel.litIds).toEqual(['florez', 'phillip'])
  })

  it('renders the picture, a sourced table and the hidden verdict', () => {
    const { container } = renderBoth()
    const table = within(container).getByRole('table')
    expect(within(table).getAllByRole('row').length).toBeGreaterThan(day.numbers.length)
    expect(container.querySelectorAll('[data-topic]').length).toBeGreaterThanOrEqual(2 + 2)
    expect(container.textContent).toContain('See how the jury decided')
    // every source id used is either in the day's pool or listed by the picture
    const ids = new Set([...container.querySelectorAll('[data-source-ids]')].flatMap((e) => (e.getAttribute('data-source-ids') ?? '').split(' ').filter(Boolean)))
    const listed = new Set([...day.sources.map((s) => s.id), ...[...container.querySelectorAll('li[id^="source-"]')].map((e) => e.id.replace('source-', ''))])
    for (const id of ids) expect(listed.has(id), id).toBe(true)
    expect(container.textContent).not.toMatch(/accuser/i)
  })

  it('changes when the record changes', () => {
    const before = renderBoth().container.textContent ?? ''
    cleanup()
    const doubled = { ...day, numbers: day.numbers.map((n) => (n.unit === 'USD' && typeof n.value === 'number' ? { ...n, value: n.value * 2 } : n)) }
    const after = renderBoth(doubled).container.textContent ?? ''
    expect(after).not.toEqual(before)
    cleanup()
    const noDefense = { ...day, key_points: day.key_points.filter((k) => !/^Defense opening/.test(k)) }
    const r3 = renderBoth(noDefense)
    expect(r3.container.textContent).toContain('Not in the record of this opening')
  })
})
