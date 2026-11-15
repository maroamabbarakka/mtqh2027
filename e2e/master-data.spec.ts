import { expect, test } from "@playwright/test";

test("event admin mengelola cabang draft dengan audit tanpa mempublikasikannya", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByLabel("Email", { exact: true })
    .fill("admin.event@example.test");
  await page.getByLabel("Kata sandi", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Masuk dengan aman" }).click();
  await expect(page).toHaveURL(/\/app\/keamanan$/);
  await page.getByLabel("Kata sandi saat ini").fill("123456");
  await page
    .getByLabel("Kata sandi baru", { exact: true })
    .fill("AdminEvent-2027!");
  await page.getByLabel("Konfirmasi kata sandi baru").fill("AdminEvent-2027!");
  await page.getByRole("button", { name: "Perbarui kata sandi" }).click();
  await expect(page.getByText("Kata sandi berhasil diubah.")).toBeVisible();

  await page.goto("/app/pengaturan");
  await expect(
    page.getByRole("heading", { name: "Master data acara" }),
  ).toBeVisible();
  await expect(
    page.getByText("MTQH XXXV Kabupaten Pinrang 2027"),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Kecamatan" }).click();
  await expect(page.locator(".master-row")).toHaveCount(12);
  await page.getByRole("tab", { name: "Cabang" }).click();
  await expect(page.locator(".master-row")).toHaveCount(8);
  await page.screenshot({
    path: "artifacts/screenshots/phase-04/master-data-1440.png",
    fullPage: true,
  });

  await page.getByLabel("ID teknis").fill("cabang-simulasi-e2e");
  await page.getByLabel("Nama cabang").fill("Cabang Simulasi E2E");
  await page.getByLabel("Nama singkat").fill("Simulasi E2E");
  await page
    .getByLabel("Deskripsi")
    .fill("Data pengujian otomatis, belum disahkan.");
  await page.getByRole("button", { name: "Tambah sebagai draft" }).click();
  await expect(page.getByText("Cabang draft ditambahkan.")).toBeVisible();
  await expect(page.getByText("Cabang Simulasi E2E")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  await page.screenshot({
    path: "artifacts/screenshots/phase-04/master-data-390-viewport.png",
  });
  await page.screenshot({
    path: "artifacts/screenshots/phase-04/master-data-390.png",
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
