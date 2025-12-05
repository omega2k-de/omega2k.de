#!/usr/bin/env node
/* eslint-disable no-console */
import { BrowserContextOptions, chromium, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

interface ShotConfig {
  name: string;
  width: number;
  height: number;
  formFactor: 'narrow' | 'wide';
  format: 'png' | 'jpeg';
}

const defaultUrl = process.argv[2] ?? 'https://www.omega2k.de';
const outDir = process.argv[3] ?? 'apps/www/public/screenshots';
const theme = (process.argv[4] ??
  process.env['PWA_SCREENSHOTS_THEME'] ??
  'light') as BrowserContextOptions['colorScheme'];
const fontSize = process.argv[5] ?? process.env['PWA_SCREENSHOTS_FONT_SIZE'] ?? '16';

const shots: ShotConfig[] = [
  { name: 'phone-360x780-portrait', width: 360, height: 780, formFactor: 'narrow', format: 'jpeg' },
  { name: 'phone-375x812-portrait', width: 375, height: 812, formFactor: 'narrow', format: 'jpeg' },
  { name: 'phone-393x852-portrait', width: 393, height: 852, formFactor: 'narrow', format: 'jpeg' },
  { name: 'phone-414x896-portrait', width: 414, height: 896, formFactor: 'narrow', format: 'jpeg' },
  {
    name: 'phone-780x360-landscape',
    width: 780,
    height: 360,
    formFactor: 'narrow',
    format: 'jpeg',
  },
  {
    name: 'phone-812x375-landscape',
    width: 812,
    height: 375,
    formFactor: 'narrow',
    format: 'jpeg',
  },
  {
    name: 'phone-852x393-landscape',
    width: 852,
    height: 393,
    formFactor: 'narrow',
    format: 'jpeg',
  },
  {
    name: 'phone-896x414-landscape',
    width: 896,
    height: 414,
    formFactor: 'narrow',
    format: 'jpeg',
  },
  {
    name: 'tablet-1024x768-landscape',
    width: 1024,
    height: 768,
    formFactor: 'wide',
    format: 'jpeg',
  },
  { name: 'desktop-1280x720', width: 1280, height: 720, formFactor: 'wide', format: 'jpeg' },
  { name: 'desktop-1440x900', width: 1440, height: 900, formFactor: 'wide', format: 'jpeg' },
  { name: 'desktop-1920x1080', width: 1920, height: 1080, formFactor: 'wide', format: 'jpeg' },
];

async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function applyUiState(page: Page) {
  if (fontSize !== '16') {
    for (let i = 0; i < 3; i += 1) {
      try {
        const inc = page.getByLabel(/Schriftgröße erhöhen/i);
        const current = await inc.getAttribute('data-size');
        if (fontSize !== current) {
          console.log('switching size', current, '->', fontSize);
          await inc.click();
        }
      } catch (_) {
        console.warn('Schriftgröße erhöhen nicht gefunden oder nicht klickbar');
        break;
      }
    }
  }
}

async function captureScreenshots(url: string, outputDir: string) {
  await ensureDir(outputDir);
  const screenshots = [];
  const browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme: theme, reducedMotion: 'reduce' });

  for (const shot of shots) {
    const page = await context.newPage();
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    await applyUiState(page);
    await page.waitForTimeout(1000);

    const fileName = `${shot.name}.${shot.format}`;
    const filePath = path.join(outputDir, fileName);

    await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      path: filePath,
      fullPage: false,
      type: shot.format,
      quality: shot.format === 'jpeg' ? 90 : undefined,
    });

    const outPath = filePath.replace(/\.jpeg$/gi, '.webp');
    const img = sharp(filePath);
    await img.toFormat('webp', { quality: 85 }).toFile(outPath);
    fs.rmSync(filePath);

    screenshots.push({
      src: outPath.replace('apps/www/public', ''),
      sizes: shot.width + 'x' + shot.height,
      type: 'image/webp',
      form_factor: 'narrow',
      label: 'omega2k – Startseite (Smartphone ' + shot.width + '×' + shot.height + ' Portrait)',
    });

    await page.close();
  }

  await browser.close();
  return screenshots;
}

captureScreenshots(defaultUrl, outDir)
  .then(screenshots => {
    console.log(JSON.stringify({ screenshots }, null, 2));
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
