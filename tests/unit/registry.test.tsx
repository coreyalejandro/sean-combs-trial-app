// Every day folder is wired up, has the files builders own, and renders from the data.
import fs from 'node:fs'
import path from 'node:path'
import { render, screen, within, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getDay, getDays } from '@/lib/data'
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
      // The text version carries a table of the day's figures, each tagged with its sources.
      if (day.numbers.length > 0) {
        const table = within(container).getByRole('table')
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
      expect(screen.queryByText(/Cowboys 4 Angels|Cabral/)).toBeNull()
    })
  }
})
