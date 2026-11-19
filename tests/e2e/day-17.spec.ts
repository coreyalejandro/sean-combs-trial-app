// Day 17 page checks (Builder 3): axe, the picture without JavaScript, keyboard entry, no sideways scroll.
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const route = '/day/17/'

test('day 17: no serious or critical axe issues', async ({ page }) => {
  await page.goto(route)
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
})

test('day 17: the picture is in the page and reachable by keyboard', async ({ page }) => {
  await page.goto(route)
  const fig = page.locator('figure[role="group"] [data-viz]')
  await expect(fig).toHaveCount(1)
  const focusable = fig.locator('button:visible:not([disabled]), [tabindex="0"]:visible, input:visible')
  expect(await focusable.count()).toBeGreaterThan(0)
  await focusable.first().focus()
  await expect(focusable.first()).toBeFocused()
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  expect(sw).toBeLessThanOrEqual(cw + 1)
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('day 17: picture and table are in the HTML', async ({ page }) => {
    await page.goto(route)
    await expect(page.locator('figure[role="group"] [data-viz]')).toHaveCount(1)
    expect(await page.locator('#text-version table tr').count()).toBeGreaterThan(1)
  })
})
