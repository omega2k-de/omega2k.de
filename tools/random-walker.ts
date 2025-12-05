/* eslint-disable no-console */
import { chromium } from 'playwright';

async function main() {
  const origin = process.env.ORIGIN;
  if (!origin) {
    console.error('Missing ORIGIN');
    process.exit(1);
  }

  const durationSeconds = Number(process.env.DURATION_SECONDS ?? '1800');
  const headless = (process.env.HEADLESS ?? 'true') !== 'false';
  const recordVideo = process.env.RECORD_VIDEO === 'true';

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext(recordVideo ? { recordVideo: { dir: 'videos' } } : {});
  const page = await context.newPage();

  const deadline = Date.now() + durationSeconds * 1000;
  await page.goto(origin, { waitUntil: 'load' });

  while (Date.now() < deadline) {
    await Promise.race([
      page.waitForLoadState('domcontentloaded').catch(() => {
        // skip
      }),
      page.waitForTimeout(3000),
    ]);

    const scrollHeight = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      return (doc && doc.scrollHeight) || (body && body.scrollHeight) || window.innerHeight;
    });

    const targetY = Math.floor(Math.random() * Math.max(scrollHeight, 1));
    await page.evaluate(top => {
      window.scrollTo({ top, behavior: 'smooth' });
    }, targetY);

    await page.waitForTimeout(1000 + Math.random() * 2000);

    const locator = page.locator(
      'a[href], button, [role="button"], [routerLink], [ng-reflect-router-link]'
    );
    const count = await locator.count();

    if (count === 0) {
      await page.goto(origin, { waitUntil: 'load' });
      continue;
    }

    let clicked = false;
    const maxTries = Math.min(count, 10);

    for (let i = 0; i < maxTries && !clicked; i++) {
      const index = Math.floor(Math.random() * count);
      const el = locator.nth(index);

      const href = await el.getAttribute('href');
      const routerLink =
        (await el.getAttribute('ng-reflect-router-link')) ?? (await el.getAttribute('routerLink'));

      let target: string | null = null;

      if (href && !href.startsWith('javascript:') && href !== '#') {
        try {
          target = new URL(href, origin).toString();
        } catch {
          // skip
        }
      } else if (routerLink) {
        try {
          target = new URL(routerLink, origin).toString();
        } catch {
          // skip
        }
      }

      if (target) {
        try {
          const u = new URL(target);
          const o = new URL(origin);
          if (u.origin !== o.origin) {
            continue;
          }
        } catch {
          // skip
        }
      }

      try {
        await Promise.all([
          el.click({ timeout: 5000 }),
          page.waitForLoadState('load').catch(() => {
            // skip
          }),
        ]);
        clicked = true;
      } catch {
        // skip
      }
    }

    if (!clicked) {
      await page.goto(origin, { waitUntil: 'load' });
    }
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
