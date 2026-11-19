// Page tests against the static export (npm run build first). Run at 1280 px and 390 px (see playwright.config.ts).
import fs from 'node:fs'
import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { REDACTED_NAMES_FOR_TESTS as REDACTED } from '../../src/lib/data/redact'

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1)
const OTHER = ['/', '/days/', '/verdict/', '/finale/', '/support/', '/sources/']
const SCREENS = path.join(__dirname, '__screens__')
// The finale draws WebGL, which the test browser renders in software: one frame can take seconds on a busy
// machine, so tests that open /finale/ get more time (see tests/e2e/finale.spec.ts).
const FINALE_TIMEOUT = 180_000
const slowIfFinale = (route: string) => {
  if (route.startsWith('/finale')) test.setTimeout(FINALE_TIMEOUT)
}

async function noSidewaysScroll(page: Page) {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  expect(sw, 'page scrolls sideways').toBeLessThanOrEqual(cw + 1)
}

async function sharedChecks(page: Page) {
  await expect(page.locator('h1').first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Get support' }).first()).toBeVisible()
  await noSidewaysScroll(page)
  const html = await page.content()
  for (const name of REDACTED) expect(html, `third-party name "${name}" on page`).not.toContain(name)
  expect(html.toLowerCase(), 'the label "accuser" (care rule 6)').not.toContain('accuser')
}

for (const route of OTHER) {
  test(`renders ${route}`, async ({ page }) => {
    slowIfFinale(route)
    const res = await page.goto(route)
    expect(res?.status()).toBe(200)
    await sharedChecks(page)
  })
}

for (const n of DAYS) {
  test(`day ${n} renders with its question, text version, sources and rail`, async ({ page }) => {
    const res = await page.goto(`/day/${n}/`)
    expect(res?.status()).toBe(200)
    await sharedChecks(page)
    const figure = page.locator('figure[role="group"]')
    await expect(figure).toHaveCount(1)
    await expect(figure.locator('figcaption')).toHaveCount(1)
    await expect(figure.locator('h2.viz-question')).not.toBeEmpty()
    await expect(page.locator('aside.content-note')).toBeVisible()
    await expect(page.locator('#text-version summary')).toHaveText('Text version')
    // Sources are shown, with real links
    const links = page.locator('.sources-list a[href^="http"]')
    expect(await links.count()).toBeGreaterThan(0)
    // Every source reference on the page resolves to a listed source
    const ids = await page.locator('[data-source-ids]').evaluateAll((els) => els.flatMap((e) => (e.getAttribute('data-source-ids') || '').split(' ').filter(Boolean)))
    for (const id of new Set(ids)) await expect(page.locator(`[id="source-${id}"]`), `source ${id}`).toHaveCount(1)
    // Confidence is shown in words, not colour alone
    expect(await page.locator('.conf-label').count()).toBeGreaterThan(0)
    // The rail marks this day as current
    await expect(page.locator('.trial-rail [aria-current="page"]')).toHaveText(String(n))
  })
}

test('the text version opens from the content note link', async ({ page }) => {
  await page.goto('/day/3/')
  await page.getByRole('link', { name: 'Show the text version' }).click()
  await expect(page.locator('#text-version')).toHaveAttribute('open', '')
  await expect(page.locator('#text-version table')).toBeVisible()
})

test('arrow keys move between days', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280', 'keyboard test runs once')
  await page.goto('/day/5/')
  await page.locator('h1').click()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/\/day\/6\/$/)
  await page.keyboard.press('ArrowLeft')
  await expect(page).toHaveURL(/\/day\/5\/$/)
})

test('quiet mode switch toggles and is remembered', async ({ page }) => {
  await page.goto('/day/1/')
  const btn = page.getByRole('button', { name: /Quiet mode/ })
  await expect(btn).toHaveAttribute('aria-pressed', 'false')
  await btn.click()
  await expect(btn).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/day/2/')
  await expect(page.locator('html')).toHaveAttribute('data-quiet', 'true')
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('day 1 still has its figure and its table', async ({ page }) => {
    await page.goto('/day/1/')
    await expect(page.locator('figure[role="group"]')).toHaveCount(1)
    expect(await page.locator('#text-version table tr').count()).toBeGreaterThan(1)
  })
})

for (const route of ['/', '/day/1/', '/day/28/', '/verdict/', '/finale/', '/days/', '/support/']) {
  test(`accessibility (axe) ${route}`, async ({ page }) => {
    slowIfFinale(route)
    await page.goto(route)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
  })
}

for (const [name, route] of [['home', '/'], ['day-01', '/day/1/'], ['day-28', '/day/28/'], ['verdict', '/verdict/'], ['finale', '/finale/'], ['days', '/days/']] as const) {
  test(`screenshot ${name}`, async ({ page }, info) => {
    slowIfFinale(route)
    await page.goto(route)
    fs.mkdirSync(SCREENS, { recursive: true })
    await page.screenshot({ path: path.join(SCREENS, `${name}-${info.project.name}.png`), fullPage: true })
  })
}
