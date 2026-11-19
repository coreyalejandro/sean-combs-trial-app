// No research or AI process notes on any built page (Corey's rule: notes meant for the makers, shown to a
// reader, are an automatic failure). Reads every HTML file in out/ (run `npm run build` first).
import fs from 'node:fs'
import path from 'node:path'
import { test, expect } from '@playwright/test'
import { builtPages, scanHtml } from '../../scripts/public-text'

const OUT = path.join(__dirname, '..', '..', 'out')

test('no built page prints a research or process note', async ({}, info) => {
  test.skip(info.project.name !== 'desktop-1280', 'reads files, so one run is enough')
  const pages = builtPages(OUT)
  expect(pages.length, 'built pages in out/').toBeGreaterThan(30)
  const found: string[] = []
  for (const f of pages) {
    for (const h of scanHtml(fs.readFileSync(f, 'utf8'))) {
      found.push(`${path.relative(OUT, f)}: [${h.why}] "${h.match}" in: ${h.line}`)
    }
  }
  expect(found, found.join('\n')).toEqual([])
})

test('the checker catches the phrases it is meant to catch', async ({}, info) => {
  test.skip(info.project.name !== 'desktop-1280', 'pure function')
  const bad = [
    '<p>CBS News. Title. 2025-05-12 (read in an earlier research pass)</p>',
    '<li>RESOLVED - jury composition</li>',
    '<p>which this project does not chart (care rule 2)</p>',
    '<p>Daily output paused: not computed.</p>',
    '<td>Days of testimony; this file set\'s numbering</td>',
    '<td>2,012 year</td>',
    '<span aria-label="see trial_days.json">x</span>',
  ]
  for (const html of bad) expect(scanHtml(html).length, html).toBeGreaterThan(0)
  expect(scanHtml('<p>Not guilty means the jury was not persuaded beyond a reasonable doubt.</p>')).toEqual([])
})
