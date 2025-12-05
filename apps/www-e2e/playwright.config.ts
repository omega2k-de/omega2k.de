import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { nxE2EPreset } from '@nx/playwright/preset';
import path from 'path';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'https://localhost:4203';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ quiet: true });

const reporterBasePath = path.join(__dirname, `../../coverage/apps/www`);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env['CI'],

  // Retry on CI only.
  retries: process.env['CI'] ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env['CI'] ? 1 : 5,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: `${reporterBasePath}/playwright-report/` }],
    ['junit', { outputFile: `${reporterBasePath}/playwright-junit.xml` }],
  ],
  use: {
    baseURL,
    colorScheme: 'dark',
    ignoreHTTPSErrors: true,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    trace: 'on-first-retry',
    screenshot: 'on-first-failure',
    video: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm start --outputStyle=stream --host=localhost --port=4203',
    url: 'https://localhost:4203',
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env['CI'],
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});
