import { expect, test } from "@playwright/test";

test("admin event menelusuri pendaftaran lintas halaman", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("admin.event@example.test");
  await page.getByLabel("Kata sandi", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Masuk dengan aman" }).click();
  await page.getByLabel("Kata sandi saat ini").fill("123456");
  await page.getByLabel("Kata sandi baru", { exact: true }).fill("AdminEvent-2027!");
  await page.getByLabel("Konfirmasi kata sandi baru").fill("AdminEvent-2027!");
  await page.getByRole("button", { name: "Perbarui kata sandi" }).click();
  await expect(page.getByText("Kata sandi berhasil diubah.")).toBeVisible();
  await page.goto("/app/peserta");

  await expect(page.getByText("Halaman 1", { exact: true })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(25);
  await expect(page.getByRole("button", { name: "Sebelumnya" })).toBeDisabled();
  await page.getByRole("button", { name: "Berikutnya" }).click();
  await expect(page.getByText("Halaman 2", { exact: true })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(25);
  await expect(page.getByRole("button", { name: "Sebelumnya" })).toBeEnabled();
  await page.screenshot({ path: "artifacts/screenshots/phase-16/registration-pagination-1440.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  const closeNavigation = page.getByRole("button", { name: "Tutup navigasi" });
  if (await closeNavigation.isVisible()) {
    await closeNavigation.click();
    await page.waitForTimeout(350);
  }
  await page.getByRole("navigation", { name: "Navigasi halaman pendaftaran" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/screenshots/phase-16/registration-pagination-390.png" });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);

  await page.getByRole("button", { name: "Sebelumnya" }).click();
  await expect(page.getByText("Halaman 1", { exact: true })).toBeVisible();
});
