import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    channel: "msedge",
    trace: "retain-on-failure",
  },
  reporter: "list",
  webServer: {
    command: "node scripts/preview-server.mjs apps/web/dist 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
