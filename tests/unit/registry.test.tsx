// Every day folder is wired up, has the files builders own, and renders from the data.
import fs from 'node:fs'
import path from 'node:path'
import { render, within, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, getDays } from '@/lib/data'
import { REDACTED_NAMES_FOR_TESTS } from '@/lib/data/redact'
import { SourcesPanel } from '@/components/shell/SourcesPanel'
import { allDayModules, getDayModule } from '@/viz/registry'

afterEach(cleanup)

const vizRoot = path.resolve(__dirname, '../../src/viz')

describe('viz registry', () => {
  it('has all 28 days, each meta matching its day', () => {
    expect(allDayModules()).toHaveLength(getDays().length)
    for (const d of getDays()) expect(getDayModule(d.day).meta.day).toBe(d.day)
  })

  for (const d of getDays()) {
    const nn = String(d.day).padStart(2, '0')
    it(`day-${nn}: folder has index.tsx, meta.ts, README.md, additions.json and complete copy`, () => {
      for (const f of ['index.tsx', 'meta.ts', 'README.md', 'additions.json']) {
        expect(fs.existsSync(path.join(vizRoot, `day-${nn}`, f)), f).toBe(true)
      }
      const { meta } = getDayModule(d.day)
      for (const k of ['title', 'question', 'form', 'caption', 'howToRead', 'altShort'] as const) expect(meta[k].length, k).toBeGreaterThan(0)
      expect([1, 2, 3]).toContain(meta.contentLevel)
    })

    it(`day-${nn}: picture and text version render from the day record`, () => {
      const { Viz, TextVersion } = getDayModule(d.day)
      const day = getDay(d.day)
      const { container } = render(<div><Viz n={d.day} day={day} /><TextVersion n={d.day} day={day} /></div>)
      // The text version carries a table of the day's figures, each tagged with its sources. A text version may hold
      // more than one table (for example a second listing); the first is the day's figures.
      if (day.numbers.length > 0) {
        const table = within(container).getAllByRole('table')[0]
        const rows = within(table).getAllByRole('row')
        expect(rows.length).toBeGreaterThan(1)
        expect(container.querySelectorAll('[data-source-ids]').length).toBeGreaterThan(0)
      }
      // Data-change check: a copy of the record with one figure removed must change the output.
      if (day.numbers.length > 1) {
        const before = container.querySelectorAll('tr').length
        cleanup()
        const altered = { ...day, numbers: day.numbers.slice(1) }
        const r2 = render(<div><Viz n={d.day} day={altered} /><TextVersion n={d.day} day={altered} /></div>)
        expect(r2.container.querySelectorAll('tr').length).toBeLessThan(before)
      }
      for (const name of REDACTED_NAMES_FOR_TESTS) expect(document.body.innerHTML).not.toContain(name)
    })
  }

  for (const d of getDays()) {
    const nn = String(d.day).padStart(2, '0')
    it(`day-${nn}: every source tag on the page resolves to exactly one listed source`, () => {
      const { Viz, TextVersion, extraSources } = getDayModule(d.day)
      const day = getDay(d.day)
      const { container } = render(
        <div>
          <Viz n={d.day} day={day} />
          <TextVersion n={d.day} day={day} />
          <SourcesPanel sources={day.sources} confidence={day.confidence} discrepancies={day.discrepancies} extras={extraSources(day)} />
        </div>,
      )
      const ids = new Set([...container.querySelectorAll('[data-source-ids]')].flatMap((e) => (e.getAttribute('data-source-ids') ?? '').split(' ').filter(Boolean)))
      for (const id of ids) expect(container.querySelectorAll(`[id="source-${id}"]`).length, `source ${id}`).toBe(1)
      // No anchor id is used twice (the picture no longer lists sources itself; the panel does, once).
      const anchors = [...container.querySelectorAll('[id^="source-"]')].map((e) => e.id)
      expect(anchors.length).toBe(new Set(anchors).size)
    })
  }
})
