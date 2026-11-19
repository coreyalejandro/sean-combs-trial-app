// Builder 1 test helpers (imported only by dayNN.test.tsx files).
import { render, within } from '@testing-library/react'
import { expect } from 'vitest'
import type { ComponentType } from 'react'
import { REDACTED_NAMES_FOR_TESTS } from '@/lib/data/redact'
import type { TrialDay } from '@/lib/data'
import type { DayVizProps } from '@/viz/types'

export function renderDay(Viz: ComponentType<DayVizProps>, TextVersion: ComponentType<DayVizProps>, day: TrialDay) {
  return render(
    <div>
      <Viz n={day.day} day={day} />
      <TextVersion n={day.day} day={day} />
    </div>,
  )
}

/** The checks every Day 1-7 picture must pass: one sourced table, every source id listed, no third-party names. */
export function expectSourcedPage(container: HTMLElement, day: TrialDay) {
  const table = within(container).getByRole('table')
  expect(within(table).getAllByRole('row').length).toBeGreaterThan(day.numbers.length)
  const ids = new Set([...container.querySelectorAll('[data-source-ids]')].flatMap((e) => (e.getAttribute('data-source-ids') ?? '').split(' ').filter(Boolean)))
  expect(ids.size).toBeGreaterThan(0)
  const listed = new Set([...day.sources.map((s) => s.id), ...[...container.querySelectorAll('li[id^="source-"]')].map((e) => e.id.replace(/^source-/, ''))])
  for (const id of ids) expect(listed.has(id), `source ${id} is listed`).toBe(true)
  const html = container.innerHTML
  for (const name of REDACTED_NAMES_FOR_TESTS) expect(html).not.toContain(name)
  expect(html.toLowerCase()).not.toContain('accuser')
  expect(container.querySelectorAll('.conf-label').length).toBeGreaterThan(0)
}
