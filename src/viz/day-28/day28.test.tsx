import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, getWitnesses } from '@/lib/data'
import Viz, { TextVersion } from './index'
import { selectDay28 } from './select'

afterEach(cleanup)

describe('Day 28 witness constellation', () => {
  const day = getDay(28)
  it('has one star per witness, matching the reported count', () => {
    const sel = selectDay28(day)
    expect(sel.total).toBe(getWitnesses().length)
    expect(sel.total).toBe(Number(sel.totalNum?.value))
    expect(sel.stars.map((s) => s.w.first_day)).toEqual([...sel.stars.map((s) => s.w.first_day)].sort((a, b) => a - b))
  })
  it('shows pseudonyms only, and the defense side', () => {
    const { container } = render(<div><Viz n={28} day={day} /><TextVersion n={28} day={day} /></div>)
    expect(container.innerHTML).toMatch(/No witnesses/)
    expect(container.querySelectorAll('[data-roving-index]').length).toBe(getWitnesses().length * 2)
    expect(container.querySelectorAll('[data-source-ids]').length).toBeGreaterThan(2)
  })
  it('changes when the record changes', () => {
    const altered = { ...day, numbers: day.numbers.filter((n) => !/prosecution witnesses in total/i.test(n.what)) }
    const { container } = render(<Viz n={28} day={altered} />)
    expect(container.innerHTML).not.toMatch(/matches the reported count/)
  })
})
