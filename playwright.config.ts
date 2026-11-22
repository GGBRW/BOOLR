import { defineConfig } from '@playwright/test';
const production = process.env.PLAYWRIGHT_PRODUCTION === '1';
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173',
    headless: true,
    hasTouch: true,
    launchOptions: process.env.CHROMIUM_PATH
      ? {
          executablePath: process.env.CHROMIUM_PATH,
          args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote'],
        }
      : {},
  },
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: production ? 'bun run preview --port 5173' : 'bun run dev',
          url: 'http://127.0.0.1:5173',
          reuseExistingServer: !process.env.CI,
        },
      }),
});
