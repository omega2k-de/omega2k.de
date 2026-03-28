import { expect, test } from '@playwright/test';

test('renders the main page content', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('app-root')).toBeVisible();
  await expect(page.getByRole('main', { name: 'Inhalt' })).toBeVisible();
  await expect(page.locator('.article-title').first()).toContainText(
    'Willkommen in meinen Gedanken'
  );
  await expect(page.locator('ui-footer')).toBeVisible();
});

test('redirects /impressum to /imprint', async ({ page }) => {
  await page.goto('/impressum');

  await expect(page).toHaveURL(/\/imprint$/);
  await expect(page.getByRole('heading', { name: 'Impressum' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: /E-Mail an root@omega2k\.de schreiben/i })
  ).toBeVisible();
});

test('renders the privacy page', async ({ page }) => {
  await page.goto('/privacy');

  await expect(
    page.getByRole('heading', {
      name: /Datenschutz/i,
    })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Impressum/i }).first()).toBeVisible();
});

test('renders the 404 page for unknown routes', async ({ page }) => {
  await page.goto('/-some-error-page-');

  await expect(
    page.getByRole('heading', {
      name: /404 - Die Seite wurde nicht gefunden/i,
    })
  ).toBeVisible();
  await expect(page.locator('ui-footer')).toBeVisible();
});
