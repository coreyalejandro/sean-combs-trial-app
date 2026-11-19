// Builder 2 kit: shared checks for the Day 8 to 14 render and data-change tests.
import { render, cleanup, within } from '@testing-library/react'
import { expect } from 'vitest'
import { getDay, type TrialDay } from '@/lib/data'
import { REDACTED_NAMES_FOR_TESTS } from '@/lib/data/redact'
import type { DayVizProps } from '@/viz/types'
import { getDayModule } from '@/viz/registry'
import { SourcesPanel } from '@/components/shell/SourcesPanel'
import { buildSourceBook } from './facts'

type Comp = (p: DayVizProps) => JSX.Element

/** Render picture and text version; check the table, source tags, and that every tag resolves. */
export function renderDay(Viz: Comp, TextVersion: Comp, day: TrialDay) {
  const extras = getDayModule(day.day).extraSources(day)
  const r = render(<div><Viz n={day.day} day={day} /><TextVersion n={day.day} day={day} /><SourcesPanel sources={day.sources} confidence={day.confidence} extras={extras} /></div>)
  const table = within(r.container).getByRole('table')
  expect(within(table).getAllByRole('row').length).toBeGreaterThan(1)
  const tagged = [...r.container.querySelectorAll('[data-source-ids]')]
  expect(tagged.length).toBeGreaterThan(0)
  const listed = new Set([...day.sources.map((s) => s.id), ...[...r.container.querySelectorAll('[id^="source-"]')].map((e) => e.id.replace(/^source-/, ''))])
  for (const el of tagged) for (const id of (el.getAttribute('data-source-ids') ?? '').split(' ').filter(Boolean)) expect(listed.has(id), `source ${id} is listed`).toBe(true)
  const html = r.container.innerHTML
  for (const name of REDACTED_NAMES_FOR_TESTS) expect(html).not.toContain(name)
  expect(html.toLowerCase()).not.toContain('accuser')
  cleanup()
  return html
}

/** A reader that returns day `n` with the number matching `what` changed by `change`. */
export function alteredReader(n: number, what: RegExp, change: (v: number | string) => number | string) {
  return (m: number): TrialDay => {
    const d = getDay(m)
    if (m !== n) return d
    return { ...d, numbers: d.numbers.map((x) => (what.test(x.what) ? { ...x, value: change(x.value) } : x)) }
  }
}

/** A copy of the day with the number matching `what` changed. */
export function alteredDay(day: TrialDay, what: RegExp, change: (v: number | string) => number | string): TrialDay {
  return { ...day, numbers: day.numbers.map((x) => (what.test(x.what) ? { ...x, value: change(x.value) } : x)) }
}

export { buildSourceBook }
