// The verdict bridge renders from the verdict record: five counts with outcomes and sources, and the
// sentence ruler with its four marks read from getVerdict().numbers.
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getCharges, getVerdict } from '@/lib/data'
import { SentenceRuler, VerdictCounts } from './VerdictBridge'

describe('verdict bridge', () => {
  it('lists every count with its outcome in words and links to listed sources', () => {
    render(<VerdictCounts />)
    const table = screen.getByRole('table', { name: 'How the jury decided each count' })
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(getCharges().length)
    getCharges().forEach((c, i) => {
      expect(rows[i].textContent).toContain(c.outcome)
      for (const id of c.source_ids) expect(rows[i].querySelector(`a[href="#source-${id}"]`)).not.toBeNull()
    })
    const ids = new Set(getVerdict().sources.map((s) => s.id))
    for (const el of document.querySelectorAll('[data-source-ids]')) {
      for (const id of (el.getAttribute('data-source-ids') ?? '').split(' ').filter(Boolean)) expect(ids.has(id)).toBe(true)
    }
  })

  it('puts the four sentence marks on the ruler, from the record', () => {
    render(<SentenceRuler />)
    const marks = document.querySelectorAll('.vt-mark')
    expect(marks).toHaveLength(4)
    const v = getVerdict()
    const imposed = v.numbers.find((n) => /Sentence imposed/.test(n.what))!
    expect(document.querySelector('.vt-mark.is-imposed')!.textContent).toContain(String(imposed.value))
    expect(document.body.textContent).toContain('calculated')
  })
})
