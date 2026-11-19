// Day 13 page checks (Builder 2): axe on the picture, keyboard selection, no-JavaScript fallback,
// no sideways scroll, and a screenshot of the figure at each width.
import fs from 'node:fs'
import path from 'node:path'
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const N = 13
const OUT = process.env.B2_SCREENS || path.join(__dirname, '__screens__')

test.describe(`day ${N} picture`, () => {
  test('passes axe and has no sideways scroll', async ({ page }) => {
    await page.goto(`/day/${N}/`)
    const results = await new AxeBuilder({ page }).include('figure[role="group"]').withTags(['wcag2a', 'wcag2aa']).analyze()
    const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((x) => x.target.join(' ')).join(' | ')}`)).toEqual([])
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
    expect(sw).toBeLessThanOrEqual(cw + 1)
  })

  test('a mark can be chosen by keyboard and opens its detail', async ({ page }) => {
    await page.goto(`/day/${N}/`)
    const mark = page.locator('figure[role="group"] [data-roving-index="0"]:visible, figure[role="group"] [data-mark]:visible').first()
    await mark.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('figure[role="group"] [aria-live="polite"] h3').first()).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/day/${N}/`))
  })

  test('screenshot', async ({ page }, info) => {
    await page.goto(`/day/${N}/`)
    fs.mkdirSync(OUT, { recursive: true })
    await page.locator('figure[role="group"]').screenshot({ path: path.join(OUT, `day-${String(N).padStart(2, '0')}-${info.project.name}.png`) })
  })
})

test.describe(`day ${N} without JavaScript`, () => {
  test.use({ javaScriptEnabled: false })
  test('still has its picture and its table', async ({ page }) => {
    await page.goto(`/day/${N}/`)
    expect(await page.locator('figure[role="group"] svg, figure[role="group"] ol, figure[role="group"] ul').count()).toBeGreaterThan(0)
    expect(await page.locator('#text-version table tr').count()).toBeGreaterThan(1)
  })
})
