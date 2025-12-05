import { expect, test } from '@playwright/test';

test('has structure', async ({ page }) => {
  await page.goto('/');

  expect(page.locator('app-root')).toBeTruthy();
  expect(page.locator('aside')).toBeTruthy();
  expect(page.locator('header')).toBeTruthy();
  expect(page.locator('section')).toBeTruthy();
  expect(page.locator('footer')).toBeTruthy();
});

test('has redirect', async ({ page }) => {
  await page.goto('/-some-error-page-');

  expect(page.locator('app-root')).toBeTruthy();
  expect(page.locator('aside')).toBeTruthy();
  expect(page.locator('header')).toBeTruthy();
  expect(page.locator('section')).toBeTruthy();
  expect(page.locator('footer')).toBeTruthy();
});
