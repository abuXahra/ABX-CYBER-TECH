import { defineConfig } from "@playwright/test";

/**
 * Run against a running server:   PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
 * (start it with `npm run dev`, or `npm run build && npm start` — set SHOW_DEMO_CONTENT=true to see the demo content).
 * CHROMIUM_PATH / CHROMIUM_ARGS_JSON let CI or a locked-down machine use an existing Chromium instead of `npx playwright install`.
 */
const executablePath = process.env.CHROMIUM_PATH || undefined;
const args = process.env.CHROMIUM_ARGS_JSON ? (JSON.parse(process.env.CHROMIUM_ARGS_JSON) as string[]) : undefined;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    launchOptions: { executablePath, args },
    viewport: { width: 1440, height: 900 },
  },
});
