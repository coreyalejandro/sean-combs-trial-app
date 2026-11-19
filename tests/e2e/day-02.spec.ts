// Builder 1: Day 2 page checks beyond the shared page tests (axe on this day, its interaction, quiet mode, no JavaScript).
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const URL = '/day/2/'

test('day 2: no serious or critical axe issues', async ({ page }) => {
  await page.goto(URL)
  const results = await new AxeBuilder({ page }).include('figure[role="group"]').withTags(['wcag2a', 'wcag2aa']).analyze()
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
})

test.describe('day 2 without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('the picture is in the HTML', async ({ page }) => {
    await page.goto(URL)
    await expect(page.locator('figure[role="group"] .viz-slot')).not.toBeEmpty()
    expect(await page.locator('figure[role="group"] [data-source-ids]').count()).toBeGreaterThan(0)
  })
})

test('day 2: the slider reads both ages', async ({ page }) => {
  await page.goto(URL)
  const slider = page.locator('input[type="range"]')
  await slider.focus()
  const before = await page.locator('figure[role="group"] [aria-live="polite"]').first().textContent()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('figure[role="group"] [aria-live="polite"]').first()).not.toHaveText(before ?? '')
})
