import { expect, test } from '@playwright/test'

const viewports = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
  { name: '360', width: 360, height: 800 },
  { name: '335', width: 335, height: 760 },
]

test('portal publik responsif pada viewport acuan', async ({ page }) => {
  test.setTimeout(60_000)
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Merawat syiar/ })).toBeVisible()
    await expect(page.getByRole('contentinfo')).toContainText('Informasi resmi diterbitkan setelah verifikasi')
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
    await page.screenshot({ path: `artifacts/screenshots/phase-21/public-home-${viewport.name}.png`, fullPage: true })
  }
})

test('navigasi seluler dapat dibuka dan ditutup dengan aman', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Buka navigasi' })
  await menu.click()
  await expect(page.getByRole('navigation', { name: 'Navigasi utama' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tutup navigasi' })).toHaveCount(2)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Buka navigasi' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Navigasi seluler' }).getByRole('link', { name: 'Beranda' })).toHaveClass(/active/)
})

test('aset PWA dan SEO tersedia dengan konfigurasi aman', async ({ request }) => {
  const manifestResponse = await request.get('/manifest.webmanifest')
  expect(manifestResponse.ok()).toBe(true)
  const manifest = await manifestResponse.json() as { display: string; icons: Array<{ purpose: string }> }
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true)

  for (const path of ['/service-worker.js', '/offline.html', '/robots.txt', '/sitemap.xml', '/favicon-32.png', '/icons/icon-192.png', '/icons/icon-512.png']) {
    expect((await request.get(path)).ok(), path).toBe(true)
  }
  const serviceWorker = await (await request.get('/service-worker.js')).text()
  expect(serviceWorker).toContain("url.pathname.startsWith('/app')")
  expect(serviceWorker).not.toContain('backgroundSync')
})
