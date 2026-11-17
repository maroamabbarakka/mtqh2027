import { expect, test } from "@playwright/test";

test("admin meninjau dan memfilter jadwal simulasi", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("admin.event@example.test");
  await page.getByLabel("Kata sandi", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Masuk dengan aman" }).click();
  await page.getByLabel("Kata sandi saat ini").fill("123456");
  await page.getByLabel("Kata sandi baru", { exact: true }).fill("AdminEvent-2027!");
  await page.getByLabel("Konfirmasi kata sandi baru").fill("AdminEvent-2027!");
  await page.getByRole("button", { name: "Perbarui kata sandi" }).click();
  await expect(page.getByText("Kata sandi berhasil diubah.")).toBeVisible();
  await page.goto("/app/jadwal");

  await expect(page.getByRole("heading", { name: "Jadwal & Arena" })).toBeVisible();
  await expect(page.locator(".schedule-card")).toHaveCount(46);
  await page.getByLabel("Cabang").selectOption("tilawah");
  await expect(page.locator(".schedule-card")).toHaveCount(10);
  await page.screenshot({ path: "artifacts/screenshots/phase-17/schedule-draft-1440.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  const closeNavigation = page.getByRole("button", { name: "Tutup navigasi" });
  if (await closeNavigation.isVisible()) {
    await closeNavigation.click();
  }
  await page.waitForTimeout(350);
  await page.screenshot({ path: "artifacts/screenshots/phase-17/schedule-draft-390.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
