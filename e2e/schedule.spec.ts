import { expect, test } from "@playwright/test";

test("admin meninjau dan memfilter jadwal simulasi", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
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

  await page.getByRole("button", { name: "Tambah arena" }).click();
  await expect(page.getByRole("dialog", { name: "Tambah arena" })).toBeVisible();
  await page.getByLabel("Kode arena").fill("arena-e2e");
  await page.getByLabel("Nama arena").fill("Arena Simulasi E2E");
  await page.getByLabel("Keterangan").fill("Data uji yang hanya tersimpan di emulator lokal.");
  await page.getByRole("button", { name: "Simpan arena" }).click();
  await expect(page.getByText("Arena berhasil disimpan sebagai draf.")).toBeVisible();

  await page.getByRole("button", { name: "Tambah sesi" }).click();
  await expect(page.getByRole("dialog", { name: "Tambah sesi" })).toBeVisible();
  await page.getByLabel("Golongan").selectOption("contoh-tilawah-putra");
  await page.getByRole("dialog", { name: "Tambah sesi" }).locator("select").nth(1).selectOption("arena-e2e");
  await page.getByLabel("Judul sesi").fill("Sesi Simulasi E2E");
  await page.getByLabel("Tanggal", { exact: true }).fill("2027-01-22");
  await page.getByLabel("Waktu mulai").fill("13:00");
  await page.getByLabel("Waktu selesai").fill("15:00");
  await page.getByLabel("Catatan internal").fill("Belum menjadi jadwal resmi panitia.");
  await page.screenshot({ path: "artifacts/screenshots/phase-18/schedule-editor-1440.png", fullPage: true });
  await page.getByRole("button", { name: "Simpan sesi" }).click();
  await expect(page.getByText("Sesi berhasil disimpan sebagai draf.")).toBeVisible();
  await expect(page.getByText("Sesi Simulasi E2E")).toBeVisible();
  await page.getByRole("button", { name: "Tambah arena" }).click();

  await page.setViewportSize({ width: 390, height: 844 });
  const closeNavigation = page.getByRole("button", { name: "Tutup navigasi" });
  if (await closeNavigation.isVisible()) {
    await closeNavigation.click();
  }
  await page.waitForTimeout(350);
  await page.screenshot({ path: "artifacts/screenshots/phase-18/schedule-editor-390.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
