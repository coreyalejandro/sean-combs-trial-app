// The finale's own checks, ported from the migration viewer's tests (tests/test_stage6_viewer.py):
// it loads, plays, jumps to any day quickly, opens at 390 px, and works in quiet mode. Plus the verdict turn.
// The shared page tests (pages.spec.ts) already cover sources, support link, axe and sideways scroll.
import { test, expect, type Page } from '@playwright/test'

type March = { ready: boolean; S: { t: number; playing: boolean }; counts: { gone: number; road: number; wait: number; arr: number }; jumpTo: (t: number) => void }
declare global { interface Window { __march?: March } }

// The map draws WebGL; the test browser draws it in software, which can take seconds a frame on a busy
// machine. So these tests run one at a time, once (desktop project; the 390 px test sets its own size),
// with room to wait, and turn the two heaviest map layers off where a test is only about the controls.
async function lighten(page: Page) {
  for (const v of ['The leaving', 'The passing through']) await page.getByRole('button', { name: v }).click()
}

async function ready(page: Page) {
  await page.goto('/finale/')
  await page.waitForFunction(() => window.__march?.ready === true, null, { timeout: 120_000 })
}

test.describe('the map', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 })
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'desktop-1280', 'map tests run once, in the desktop project')
  })

  test('the march loads its data and shows every walker at home before Day 1 morning', async ({ page }) => {
    await ready(page)
    await expect(page.locator('.fm-loading')).toHaveCount(0)
    await expect(page.locator('.fm-canvas canvas')).toHaveCount(1)
    await expect(page.getByTestId('c-gone')).toHaveText('0')
    await expect(page.locator('.fm-day')).toHaveText('Day 1')
    for (const v of ['The leaving', 'The passing through', 'The arriving']) {
      await expect(page.getByRole('button', { name: v })).toHaveAttribute('aria-pressed', 'true')
    }
  })

  test('Play moves the clock and the counters; Pause stops it', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await ready(page)
    await lighten(page)
    await page.getByRole('combobox', { name: 'Playback speed' }).selectOption({ label: '1 week each second' })
    await page.getByRole('button', { name: 'Play' }).click()
    await page.waitForFunction(() => (window.__march?.S.t ?? 0) > 3, null, { timeout: 120_000 })
    await expect(page.getByTestId('c-gone')).not.toHaveText('0')
    // The test browser draws WebGL in software (about one frame a second), which starves pointer input
    // while playing; press the same native button through the DOM.
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
    await page.evaluate(() => (document.querySelector('.fm-play') as HTMLButtonElement).click())
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
    const t1 = await page.evaluate(() => window.__march!.S.t)
    await page.waitForTimeout(600)
    expect(await page.evaluate(() => window.__march!.S.t)).toBe(t1)
  })

  test('jumps to any day quickly and exactly', async ({ page }) => {
    await ready(page)
    const res = await page.evaluate(() => {
      const m = window.__march!
      const out: Array<{ t: number; ms: number; arr: number }> = []
      for (const t of [74.5, 400.5, 10.5, 866.9]) {
        const a = performance.now()
        m.jumpTo(t)
        out.push({ t, ms: performance.now() - a, arr: m.counts.arr })
      }
      return out
    })
    // Computing every dot's place for a new day is plain JavaScript (about 35 ms on a laptop); the bound is
    // loose because the test machine is shared.
    for (const r of res) expect(r.ms, `jump to ${r.t}`).toBeLessThan(1500)
    expect(res[1].arr).toBeGreaterThan(res[0].arr)
    expect(res[3].arr).toBeGreaterThan(res[1].arr)
    await lighten(page)
    await page.getByRole('button', { name: /Half have arrived/ }).click()
    await expect(page.locator('.fm-day')).toHaveText(/Day 7\d/)
    await page.getByRole('button', { name: /Last arrival/ }).click()
    await expect(page.getByTestId('c-road')).toHaveText('0')
  })

  test('the day bar works from the keyboard', async ({ page }) => {
    await ready(page)
    await lighten(page)
    const bar = page.getByRole('slider', { name: 'Day of the march' })
    await bar.focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('.fm-day')).toHaveText('Day 2')
    await page.keyboard.press('Shift+ArrowRight')
    await expect(page.locator('.fm-day')).toHaveText('Day 9')
    await expect(page).toHaveURL(/\/finale\/$/) // the arrow keys stayed inside the map
  })

  test('views turn their panels on and off', async ({ page }) => {
    await ready(page)
    await page.getByRole('button', { name: 'The passing through' }).click()
    await expect(page.getByRole('heading', { name: /Busiest stops/ })).toHaveCount(0)
    await page.getByRole('button', { name: 'The passing through' }).click()
    await expect(page.getByRole('heading', { name: /Busiest stops/ })).toHaveCount(1)
    await expect(page.locator('#on-washington')).toContainText('not defined yet')
  })

  test('quiet mode: no playing, the day bar and step buttons still work', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await ready(page)
    await lighten(page)
    await expect(page.getByRole('button', { name: 'Play' })).toBeDisabled()
    await expect(page.locator('.fm-quiet-note')).toBeVisible()
    await page.getByRole('button', { name: 'Next day' }).click()
    await expect(page.locator('.fm-day')).toHaveText('Day 2')
    // the header switch is the only quiet switch on the page
    await expect(page.getByRole('button', { name: /Quiet mode/ })).toHaveCount(1)
  })

  test('opens at 390 px without sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await ready(page)
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
    expect(sw).toBeLessThanOrEqual(cw + 1)
    const box = await page.locator('.fm-map').boundingBox()
    expect(box!.width).toBeLessThanOrEqual(390)
  })
})

test('the static summary, sources and the version-1 line are in the HTML', async ({ page }) => {
  await page.goto('/finale/')
  await expect(page.locator('#march-summary img')).toHaveAttribute('src', '/finale-data/still-arcs.png')
  expect(await page.locator('#march-summary table tbody tr').count()).toBe(4)
  await expect(page.locator('.fm-caveat').first()).toContainText('Estimates, not forecasts')
  for (const s of ['cdc-nisvs', 'census-v2025', 'bls-cps11', 'ne-roads']) await expect(page.locator(`#source-${s} a`)).toHaveCount(1)
  const ids = await page.locator('[data-source-ids]').evaluateAll((els) => els.flatMap((e) => (e.getAttribute('data-source-ids') || '').split(' ').filter(Boolean)))
  for (const id of new Set(ids)) await expect(page.locator(`[id="source-${id}"]`), `source ${id}`).toHaveCount(1)
  await expect(page.locator('.fm-closing')).toContainText('in development')
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('the finale still has its still map, counters table and text version', async ({ page }) => {
    await page.goto('/finale/')
    await expect(page.locator('figure[role="group"]')).toHaveCount(1)
    await expect(page.locator('#march-summary img')).toHaveCount(1)
    expect(await page.locator('#text-version table').count()).toBeGreaterThan(1)
  })
  test('the verdict page shows the last frame of the turn and the way on', async ({ page }) => {
    await page.goto('/verdict/')
    await expect(page.locator('.vt-turn h2')).toContainText('million adults in America')
    await expect(page.getByRole('link', { name: 'Begin the march' })).toHaveAttribute('href', '/finale/')
  })
})

test('verdict: a sourced verdict per count and the sentence ruler', async ({ page }) => {
  await page.goto('/verdict/')
  const rows = page.locator('table.vt-counts tbody tr')
  await expect(rows).toHaveCount(5)
  expect(await rows.locator('.vt-outcome.is-guilty').count()).toBe(2)
  for (let i = 0; i < 5; i++) expect(await rows.nth(i).locator('a.source-ref').count()).toBeGreaterThan(0)
  await expect(page.locator('.vt-mark')).toHaveCount(4)
  const ids = await page.locator('[data-source-ids]').evaluateAll((els) => els.flatMap((e) => (e.getAttribute('data-source-ids') || '').split(' ').filter(Boolean)))
  for (const id of new Set(ids)) await expect(page.locator(`[id="source-${id}"]`), `source ${id}`).toHaveCount(1)
})

test('verdict turn in quiet mode: still frames with Continue, then Begin the march', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/verdict/')
  const turn = page.locator('.vt-turn')
  await turn.scrollIntoViewIfNeeded()
  await expect(turn.locator('h2')).toContainText('witnesses')
  for (let i = 0; i < 3; i++) await turn.getByRole('button', { name: 'Continue' }).click()
  await expect(turn.locator('h2')).toContainText('million adults in America')
  await turn.getByRole('link', { name: 'Begin the march' }).click()
  await expect(page).toHaveURL(/\/finale\/$/)
})
