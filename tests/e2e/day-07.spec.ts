// Builder 1: Day 7 page checks beyond the shared page tests (axe on this day, its interaction, quiet mode, no JavaScript).
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const URL = '/day/7/'

test('day 7: no serious or critical axe issues', async ({ page }) => {
  await page.goto(URL)
  const results = await new AxeBuilder({ page }).include('figure[role="group"]').withTags(['wcag2a', 'wcag2aa']).analyze()
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
})

test.describe('day 7 without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('the picture is in the HTML', async ({ page }) => {
    await page.goto(URL)
    await expect(page.locator('figure[role="group"] .viz-slot')).not.toBeEmpty()
    expect(await page.locator('figure[role="group"] [data-source-ids]').count()).toBeGreaterThan(0)
  })
})

test('day 7: stepping back a day moves the money', async ({ page }) => {
  await page.goto(URL)
  const status = page.locator('figure[role="group"] [aria-live="polite"]').first()
  await expect(status).toContainText('returned')
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'Previous day' }).click()
  await expect(status).toContainText('account')
})

test('day 7: quiet mode hides Play and keeps the step buttons', async ({ page }) => {
  await page.goto(URL)
  await page.getByRole('button', { name: /Quiet mode/ }).click()
  await expect(page.getByRole('button', { name: 'Play the month' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Previous day' })).toBeVisible()
})
