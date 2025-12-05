/* eslint-disable no-console */
import { BrowserContext, chromium, Page } from 'playwright';
import { writeFile } from 'fs/promises';

interface LinkInfo {
  index: number;
  text: string;
  href: string;
  targetUrl?: string | null;
  hash?: string;
  samePage: boolean;
  anchorExists?: boolean;
  isInternal: boolean;
}

interface PageInfo {
  url: string;
  depth: number;
  from?: string;
  viaText?: string;
  statusCode?: number;
  ids: string[];
  links: LinkInfo[];
}

interface QueueItem {
  url: string;
  depth: number;
  from?: string;
  viaText?: string;
}

function normalizeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.origin + u.pathname + u.search;
  } catch {
    return null;
  }
}

class Crawler {
  private readonly origin: URL;
  private readonly maxDepth: number;
  private readonly statusMap: Map<string, number>;
  private readonly visited = new Set<string>();
  private readonly queue: QueueItem[] = [];
  private readonly pages: PageInfo[] = [];

  constructor(origin: URL, maxDepth: number, statusMap: Map<string, number>) {
    this.origin = origin;
    this.maxDepth = maxDepth;
    this.statusMap = statusMap;
  }

  run = async (page: Page) => {
    this.enqueue({ url: this.origin.toString(), depth: 0 });
    while (this.queue.length > 0) {
      const item = this.queue.shift() as QueueItem;
      if (item.depth > this.maxDepth) continue;
      await this.visit(page, item);
    }
  };

  getReport = () => {
    return {
      origin: this.origin.toString(),
      maxDepth: this.maxDepth,
      pages: this.pages,
      errors: this.pages
        .filter(p => (p.statusCode ?? 0) >= 400)
        .map(p => ({
          url: p.url,
          statusCode: p.statusCode,
        })),
      brokenAnchors: this.pages.flatMap(p =>
        p.links
          .filter(l => l.hash && l.samePage && l.anchorExists === false)
          .map(l => ({
            page: p.url,
            linkText: l.text,
            href: l.href,
            hash: l.hash,
          }))
      ),
    };
  };

  private enqueue(item: QueueItem) {
    this.queue.push(item);
  }

  private isInternal(url: string): boolean {
    try {
      const u = new URL(url);
      return u.origin === this.origin.origin;
    } catch {
      return false;
    }
  }

  private async waitForStable(page: Page) {
    await Promise.race([
      page.waitForLoadState('domcontentloaded').catch(() => {
        // skip
      }),
      page.waitForTimeout(3000),
    ]);
  }

  private async snapshotPage(page: Page): Promise<{
    url: string;
    ids: string[];
    links: LinkInfo[];
  }> {
    const data = await page.evaluate(() => {
      const current = location.origin + location.pathname + location.search;
      const linkElements = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'));
      const ids = Array.from(document.querySelectorAll<HTMLElement>('[id], a[name]'))
        .map(el => el.id || el.getAttribute('name') || '')
        .filter(Boolean);
      const links = linkElements.map((el, index) => {
        const href = el.getAttribute('href') || '';
        const text = el.innerText.trim();
        let targetUrl: string | null = null;
        let hash = '';
        try {
          const u = new URL(href, current);
          targetUrl = u.origin + u.pathname + u.search;
          hash = u.hash.replace(/^#/, '');
        } catch {
          // skip
        }
        const samePage = !!hash && targetUrl === current;
        let anchorExists: boolean | undefined;
        if (samePage && hash) {
          const targetEl =
            document.getElementById(hash) ||
            document.querySelector<HTMLElement>(`[name="${hash}"]`);
          anchorExists = !!targetEl;
        }
        return {
          index,
          text,
          href,
          targetUrl,
          hash: hash || undefined,
          samePage,
          anchorExists,
        };
      });
      return { url: current, ids, links };
    });

    const links: LinkInfo[] = data.links.map(l => {
      let isInternal = false;
      if (l.targetUrl) {
        try {
          const u = new URL(l.targetUrl);
          isInternal = u.origin === location.origin;
        } catch {
          isInternal = false;
        }
      }
      return {
        ...l,
        isInternal,
      };
    });

    return {
      url: data.url,
      ids: data.ids,
      links,
    };
  }

  private async visit(page: Page, item: QueueItem) {
    const target = normalizeUrl(item.url);
    if (!target) return;
    if (this.visited.has(target)) return;
    if (!this.isInternal(target)) return;

    await page.goto(target, { waitUntil: 'load' });
    await this.waitForStable(page);

    const currentUrl = normalizeUrl(page.url());
    if (!currentUrl) return;
    if (this.visited.has(currentUrl)) return;
    this.visited.add(currentUrl);

    const statusCode = this.statusMap.get(currentUrl);
    const snapshot = await this.snapshotPage(page);

    this.pages.push({
      url: currentUrl,
      depth: item.depth,
      from: item.from,
      viaText: item.viaText,
      statusCode,
      ids: snapshot.ids,
      links: snapshot.links,
    });

    for (const link of snapshot.links) {
      if (!link.targetUrl) continue;
      const normalizedTarget = normalizeUrl(link.targetUrl);
      if (!normalizedTarget) continue;
      if (!this.isInternal(normalizedTarget)) continue;
      if (this.visited.has(normalizedTarget)) continue;
      this.enqueue({
        url: normalizedTarget,
        depth: item.depth + 1,
        from: currentUrl,
        viaText: link.text,
      });
    }
  }
}

function setupStatusRecorder(context: BrowserContext, origin: URL): Map<string, number> {
  const statusMap = new Map<string, number>();
  context.on('response', response => {
    try {
      if (response.request().resourceType() !== 'document') return;
      const u = new URL(response.url());
      if (u.origin !== origin.origin) return;
      const key = u.origin + u.pathname + u.search;
      statusMap.set(key, response.status());
    } catch {
      return;
    }
  });
  return statusMap;
}

async function main() {
  const originArg = process.env.ORIGIN ?? process.argv[2];
  if (!originArg) {
    console.error('Missing ORIGIN');
    process.exit(1);
  }

  const maxDepth = Number(process.env.MAX_DEPTH ?? process.argv[3] ?? '10');
  const outputFile = process.env.OUTPUT_FILE ?? process.argv[4] ?? 'crawl-report.json';
  const headless = (process.env.HEADLESS ?? 'true') !== 'false';
  const recordVideo = process.env.RECORD_VIDEO === 'true';

  const origin = new URL(originArg);
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext(recordVideo ? { recordVideo: { dir: 'videos' } } : {});
  const page = await context.newPage();
  const statusMap = setupStatusRecorder(context, origin);
  const crawler = new Crawler(origin, maxDepth, statusMap);

  await crawler.run(page);
  await browser.close();

  const report = crawler.getReport();
  await writeFile(outputFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Crawl finished. Report written to ${outputFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
