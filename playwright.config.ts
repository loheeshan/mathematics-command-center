import { defineConfig, devices } from "@playwright/test";
import path from 'node:path';

const PORT = Number(process.env.E2E_PORT ?? 3100);
// Use a locally installed Chrome when CHROME_PATH is set (e.g. CI images without Playwright's browser download).
const executablePath = process.env.CHROME_PATH;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    launchOptions: executablePath ? { executablePath, args: ["--no-sandbox"] } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } }, testIgnore: /mobile\.spec\.ts/ },
    { name: "mobile-360", use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 780 }, isMobile: false, hasTouch: true }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: process.env.E2E_EXTERNAL_SERVER === '1' ? undefined : {
    command: `"${process.execPath}" node_modules/next/dist/bin/next ${process.env.E2E_DEV === '1' ? 'dev' : 'start'} -p ${PORT} -H 127.0.0.1`,
    cwd: path.resolve('apps/web'),
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
