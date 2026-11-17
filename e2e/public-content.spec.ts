import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const shots = 'artifacts/screenshots/phase-22'

test.beforeAll(async () => { await mkdir(shots, { recursive: true }) })

test('footer publik seimbang dan tidak overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.locator('.footer-links')).toBeVisible()
  await expect(page.locator('.footer-readiness')).toContainText('Informasi diterbitkan bertahap')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: `${shots}/home-footer-1440.png`, fullPage: true })
})

test('nama kafilah membuka rincian simulasi yang aksesibel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/klasemen')
  await page.getByRole('button', { name: /Batulappa/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Kafilah Batulappa' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('RINCIAN SIMULASI')
  await expect(dialog).toContainText('Pratinjau perolehan per cabang')
  await page.screenshot({ path: `${shots}/standings-dialog-1440.png`, fullPage: true })
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('berita simulasi memiliki cover dan halaman detail pada mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/berita')
  await expect(page.locator('.news-card')).toHaveCount(3)
  await expect(page.locator('.news-cover img')).toHaveCount(3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: `${shots}/news-390.png`, fullPage: true })
  await page.locator('.news-card').first().getByRole('link', { name: 'Persiapan informasi MTQH dilakukan secara bertahap', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Persiapan informasi MTQH dilakukan secara bertahap' })).toBeVisible()
  await expect(page.getByText('ARTIKEL SIMULASI · PERSIAPAN', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
