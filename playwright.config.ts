import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',

  timeout: 120000,

  use: {
    browserName: 'chromium',
    headless: false,

    // ignore corporate SSL issues
    ignoreHTTPSErrors: true,

    // increase navigation timeout
    navigationTimeout: 120000,
    actionTimeout: 60000,

    // Disable Playwright default viewport
    viewport: null,

    launchOptions: {
      args: ['--start-maximized'],
    },

    trace: 'on-first-retry',
  },
});