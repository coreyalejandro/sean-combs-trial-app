// Day 22 page checks beyond the shared page tests: axe at both widths, interaction by pointer and keyboard,
// no sideways scroll, the picture present without JavaScript.
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('day 22 visualization', () => {
  test('passes axe (serious or critical) and has no sideways scroll', async ({ page }) => {
    await page.goto('/day/22/')
    const results = await new AxeBuilder({ page }).include('figure[role="group"]').withTags(['wcag2a', 'wcag2aa']).analyze()
    const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
    expect(sw).toBeLessThanOrEqual(cw + 1)
  })

  test('responds to selection', async ({ page }) => {
    await page.goto('/day/22/')
    await page.locator('[data-testid=day22-gantt] svg:visible [data-roving-index="0"]').click()
    await expect(page.locator('[data-testid=day22-gantt]')).toContainText('Asked by')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid=day22-gantt]')).toContainText('Day 18')
  })

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false })
    test('the picture is in the HTML', async ({ page }) => {
      await page.goto('/day/22/')
      expect(await page.locator('figure[role="group"] svg').count()).toBeGreaterThan(0)
      expect(await page.locator('#text-version table tr').count()).toBeGreaterThan(1)
    })
  })
})
