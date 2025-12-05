import { promises as fs } from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { NavItemInterface, PageRecordInterface, PageRecordTree } from '../interfaces';

const DEFAULT_DB_PATH = process.env['CONTENT_DB_PATH'] ?? 'content.db';

const PAGE_COLUMNS = [
  'id',
  'slug',
  'parent',
  'topic',
  'route',
  'title',
  'keywords',
  'description',
  'author_slug',
  'layout',
  'version',
  'reading_time_min',
  'body_markdown',
  'og_title',
  'og_description',
  'og_image',
  'og_image_width',
  'og_image_height',
  'created_at',
  'updated_at',
  'is_published',
  'is_new',
] as const;

const NAV_COLUMNS = [
  'id',
  'location',
  'label',
  'route',
  'parent_id',
  'order_index',
  'icon',
] as const;

type PageRow = Record<string, unknown>;
type NavRow = Record<string, unknown>;

export type PageTreeSort = 'title' | 'created_at' | 'updated_at';

const buildColumnList = (columns: readonly string[], alias?: string): string =>
  columns.map(col => (alias ? `${alias}.${col}` : col)).join(', ');

const mapPageRowToRecord = (row: PageRow): PageRecordInterface => ({
  id: row['id'] as number,
  slug: row['slug'] as string,
  parent: (row['parent'] as string) ?? null,
  topic: (row['topic'] as string) ?? null,
  route: row['route'] as string,
  title: row['title'] as string,
  keywords: row['keywords'] as string,
  description: (row['description'] as string) ?? null,
  authorSlug: (row['author_slug'] as string) ?? null,
  layout: (row['layout'] as string) ?? null,
  version: parseInt(row['version'] as string),
  readingTimeMin:
    typeof row['reading_time_min'] === 'number'
      ? (row['reading_time_min'] as number)
      : row['reading_time_min'] !== null
        ? Number(row['reading_time_min'])
        : null,
  bodyMarkdown: row['body_markdown'] as string,
  ogTitle: (row['og_title'] as string) ?? null,
  ogDescription: (row['og_description'] as string) ?? null,
  ogImage: (row['og_image'] as string) ?? null,
  ogImageWidth: (row['og_image_width'] as string) ?? null,
  ogImageHeight: (row['og_image_height'] as string) ?? null,
  createdAt: (row['created_at'] as string) ?? null,
  updatedAt: (row['updated_at'] as string) ?? null,
  isPublished: row['is_published'] === 1 || row['is_published'] === '1',
  isNew: row['is_new'] === 1 || row['is_new'] === '1',
});

const mapNavRowToItem = (row: NavRow): NavItemInterface => ({
  id: Number(row['id']),
  location: String(row['location']),
  label: String(row['label']),
  route: row['route'] !== null ? String(row['route']) : null,
  parentId:
    row['parent_id'] === null
      ? null
      : typeof row['parent_id'] === 'number'
        ? (row['parent_id'] as number)
        : Number(row['parent_id']),
  orderIndex:
    typeof row['order_index'] === 'number'
      ? (row['order_index'] as number)
      : Number(row['order_index']),
  icon: row['icon'] !== null ? String(row['icon']) : null,
});

export class ContentRepository {
  private readonly db: Database;

  private constructor(db: Database) {
    this.db = db;
  }

  static async create(dbPath: string = DEFAULT_DB_PATH): Promise<ContentRepository> {
    const SQL = await initSqlJs();
    const resolved = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
    const buffer = await fs.readFile(resolved);
    const db = new SQL.Database(buffer);
    return new ContentRepository(db);
  }

  getPageByRoute(route: string): PageRecordInterface | null {
    const stmt = this.db.prepare(
      `select ${buildColumnList(PAGE_COLUMNS)}
       from pages
       where route = ?
         limit 1`
    );
    stmt.bind([route]);
    let result: PageRecordInterface | null = null;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      result = mapPageRowToRecord(row as PageRow);
    }
    stmt.free();
    return result;
  }

  getNavigation(location: string): NavItemInterface[] {
    const stmt = this.db.prepare(
      `select ${buildColumnList(NAV_COLUMNS)}
       from navigation
       where location = ?
       order by order_index asc, id asc`
    );
    stmt.bind([location]);
    const items: NavItemInterface[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      items.push(mapNavRowToItem(row as NavRow));
    }
    stmt.free();
    return items;
  }

  getAllCards(): PageRecordInterface[] {
    const stmt = this.db.prepare(
      `select ${buildColumnList(PAGE_COLUMNS, 'p')}
       from pages p
       where p.is_published = 1
         and p.id > 1
       order by p.created_at desc, p.id asc`
    );

    const result: PageRecordInterface[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      result.push(mapPageRowToRecord(row as PageRow));
    }
    stmt.free();
    return result;
  }

  getSitemapRoutes(): string[] {
    const stmt = this.db.prepare(
      'select route from pages where is_published = 1 order by route asc'
    );
    const routes: string[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const route = String(row['route'] ?? '').trim();
      if (!route) continue;
      routes.push(route);
    }
    stmt.free();
    return routes;
  }

  getCards(slug: string): PageRecordInterface[] {
    const stmt = this.db.prepare(
      `select ${buildColumnList(PAGE_COLUMNS, 'c')}
       from pages p
              join pages c on c.parent = p.id
       where p.slug = ?
         and c.is_published = 1
         and c.id > 1
       order by c.created_at asc, c.id asc`
    );
    stmt.bind([slug]);

    const result: PageRecordInterface[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      result.push(mapPageRowToRecord(row as PageRow));
    }
    stmt.free();
    return result;
  }

  getRandomCards(amount: number): PageRecordInterface[] {
    if (amount <= 0) {
      return [];
    }
    const stmt = this.db.prepare(
      `select ${buildColumnList(PAGE_COLUMNS.filter(col => col !== 'body_markdown'))}
       from pages
       where is_published = 1 and id > 1
       order by RANDOM() limit ${amount}`
    );

    const result: PageRecordInterface[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      result.push(mapPageRowToRecord(row as PageRow));
    }
    stmt.free();
    return result;
  }

  tree(sort: PageTreeSort = 'title'): PageRecordTree | null {
    const stmt = this.db.prepare(
      `select ${buildColumnList(PAGE_COLUMNS)}
       from pages
       where is_published = 1`
    );

    const pages: Omit<PageRecordInterface, 'bodyMarkdown'>[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const record = mapPageRowToRecord(row as PageRow);
      delete record.bodyMarkdown;
      pages.push(record);
    }
    stmt.free();

    if (pages.length === 0) {
      return null;
    }

    const byId = new Map<number, PageRecordInterface>();
    const childrenByParentId = new Map<number | null, PageRecordInterface[]>();

    for (const page of pages) {
      byId.set(page.id, page);
      const parentId =
        page.parent !== null && page.parent !== undefined ? Number(page.parent) : null;
      const children = childrenByParentId.get(parentId);
      if (children) {
        children.push(page);
      } else {
        childrenByParentId.set(parentId, [page]);
      }
    }

    const comparator = (a: PageRecordInterface, b: PageRecordInterface): number => {
      const aHasChildren = (childrenByParentId.get(a.id)?.length ?? 0) > 0;
      const bHasChildren = (childrenByParentId.get(b.id)?.length ?? 0) > 0;
      if (aHasChildren !== bHasChildren) {
        return aHasChildren ? -1 : 1;
      }

      if (sort === 'title') {
        const at = a.title ?? '';
        const bt = b.title ?? '';
        const cmp = at.localeCompare(bt, 'de-DE', { sensitivity: 'base' });
        if (cmp !== 0) {
          return cmp;
        }
        return a.id - b.id;
      }

      if (sort === 'created_at') {
        const ac = a.createdAt ?? '';
        const bc = b.createdAt ?? '';
        if (ac < bc) return -1;
        if (ac > bc) return 1;
        return a.id - b.id;
      }

      if (sort === 'updated_at') {
        const au = a.updatedAt ?? '';
        const bu = b.updatedAt ?? '';
        if (au < bu) return -1;
        if (au > bu) return 1;
        return a.id - b.id;
      }

      return a.id - b.id;
    };

    for (const children of childrenByParentId.values()) {
      children.sort(comparator);
    }

    const buildNode = (page: PageRecordInterface): PageRecordTree => {
      const parentId =
        page.parent !== null && page.parent !== undefined ? Number(page.parent) : null;
      const parent = parentId !== null ? (byId.get(parentId) ?? null) : null;
      const childrenPages = childrenByParentId.get(page.id) ?? [];
      return {
        parent,
        page,
        children: childrenPages.map(child => buildNode(child)),
      };
    };

    const rootPages = childrenByParentId.get(null) ?? [];
    if (!rootPages[0]) {
      return null;
    }

    return buildNode(rootPages[0]);
  }
}
