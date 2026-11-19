// Builder 1: Day 1 page checks beyond the shared page tests (axe on this day, its interaction, quiet mode, no JavaScript).
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const URL = '/day/1/'

test('day 1: no serious or critical axe issues', async ({ page }) => {
  await page.goto(URL)
  const results = await new AxeBuilder({ page }).include('figure[role="group"]').withTags(['wcag2a', 'wcag2aa']).analyze()
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
})

test.describe('day 1 without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('the picture is in the HTML', async ({ page }) => {
    await page.goto(URL)
    await expect(page.locator('figure[role="group"] .viz-slot')).not.toBeEmpty()
    expect(await page.locator('figure[role="group"] [data-source-ids]').count()).toBeGreaterThan(0)
  })
})

test('day 1: selecting a topic shows the days that tested it', async ({ page }) => {
  await page.goto(URL)
  const topic = page.locator('[data-topic="payment"] summary')
  await topic.click()
  await expect(page.locator('[data-topic="payment"] a[href="/day/15/"]')).toBeVisible()
  await page.getByText('See how the jury decided').click()
  await expect(page.locator('figure[role="group"]').getByText(/not persuaded beyond a reasonable doubt/)).toBeVisible()
})
