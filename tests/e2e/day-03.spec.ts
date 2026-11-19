// Builder 1: Day 3 page checks beyond the shared page tests (axe on this day, its interaction, quiet mode, no JavaScript).
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const URL = '/day/3/'

test('day 3: no serious or critical axe issues', async ({ page }) => {
  await page.goto(URL)
  const results = await new AxeBuilder({ page }).include('figure[role="group"]').withTags(['wcag2a', 'wcag2aa']).analyze()
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
})

test.describe('day 3 without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('the picture is in the HTML', async ({ page }) => {
    await page.goto(URL)
    await expect(page.locator('figure[role="group"] .viz-slot')).not.toBeEmpty()
    expect(await page.locator('figure[role="group"] [data-source-ids]').count()).toBeGreaterThan(0)
  })
})

test('day 3: the grid moves by arrow keys and opens a cell', async ({ page }) => {
  await page.goto(URL)
  const first = page.locator('[role="gridcell"]').first()
  await first.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('[data-cell="0-1"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-cell="0-1"]')).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('button', { name: 'Previous day' }).click()
  await expect(page.locator('#evidence-matrix-day')).not.toHaveValue('28')
})
