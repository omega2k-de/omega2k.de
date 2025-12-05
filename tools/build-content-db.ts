/* eslint-disable no-console */
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';
import initSqlJs, { BindParams } from 'sql.js';

const REPO_ROOT = process.cwd();
const CONTENT_DIR = path.join(REPO_ROOT, 'content');
const DB_PATH = path.join(REPO_ROOT, 'content.db');

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = words / 200;
  return Math.max(1, Math.round(minutes));
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function unwrapMarkdownBody(body: string): string {
  const lines = body.split('\n');

  const out: string[] = [];
  let paragraph: string[] = [];
  let inFence = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }

    let result = '';

    for (const part of paragraph) {
      if (result === '') {
        result = part;
        continue;
      }

      const trimmedPart = part;

      const needsNoSpace = /^(\*\*|__|\*|_|`|]\(|\)|]|,|\.|;|:|!|\?)/.test(trimmedPart);

      if (needsNoSpace) {
        result += trimmedPart;
      } else {
        result += ' ' + trimmedPart;
      }
    }

    out.push(result);
    paragraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine;

    if (/^```/.test(line.trim())) {
      flushParagraph();
      inFence = !inFence;
      out.push(line);
      continue;
    }

    if (inFence) {
      out.push(line);
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      out.push('');
      continue;
    }

    if (
      /^[#>]/.test(line.trim()) ||
      /^[-*+]\s+/.test(line.trim()) ||
      /^[0-9]+\.\s+/.test(line.trim()) ||
      /^\|.*\|$/.test(line.trim())
    ) {
      flushParagraph();
      out.push(line);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();

  return out.join('\n');
}

async function buildDatabase(): Promise<void> {
  await ensureDir(path.dirname(DB_PATH));

  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`
    drop table if exists navigation;
    drop table if exists pages;
  `);

  db.run(`
    create table pages (
      id integer primary key autoincrement,
      parent integer,
      slug text not null unique,
      topic text,
      route text not null unique,
      title text not null,
      keywords text not null,
      description text,
      author_slug text,
      layout text,
      version integer not null default 1,
      reading_time_min integer,
      body_markdown text not null,
      og_title text,
      og_description text,
      og_image text,
      og_image_width text,
      og_image_height text,
      created_at text,
      updated_at text,
      is_published integer not null default 1,
      is_new integer not null default 0
    );
  `);

  db.run(`
    create index idx_pages_route on pages(route);
  `);

  db.run(`
    create index idx_pages_slug on pages(slug);
  `);

  db.run(`
    create table navigation (
      id integer primary key autoincrement,
      location text not null,
      label text not null,
      route text,
      parent_id integer,
      order_index integer not null default 0,
      icon text
    );
  `);

  db.run(`
    create index idx_navigation_location on navigation(location, order_index);
  `);

  const files = await glob(path.join(CONTENT_DIR, 'pages/*.md'));
  const now = new Date().toISOString();

  const insertPage = db.prepare(`
    insert into pages (id,
                       parent,
                       slug,
                       topic,
                       route,
                       title,
                       keywords,
                       description,
                       author_slug,
                       layout,
                       version,
                       reading_time_min,
                       body_markdown,
                       og_title,
                       og_description,
                       og_image,
                       og_image_width,
                       og_image_height,
                       created_at,
                       updated_at,
                       is_published,
                       is_new)
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8');
    const parsed = matter(raw);
    const fm = parsed.data;

    const rawBody = parsed.content.trim();
    const body = unwrapMarkdownBody(rawBody);

    const slug =
      typeof fm.slug === 'string' && fm.slug.length ? fm.slug : path.basename(file, '.md');

    const route = typeof fm.route === 'string' && fm.route.length ? fm.route : `/content/${slug}`;

    const title = typeof fm.title === 'string' && fm.title.length ? fm.title : slug;

    const description = typeof fm.description === 'string' ? fm.description : '';

    const author_slug = typeof fm.author === 'string' && fm.author.length ? fm.author : 'Patrick';

    const layout = typeof fm.layout === 'string' && fm.layout.length ? fm.layout : 'essay';
    const keywords = typeof fm.keywords === 'string' && fm.keywords.length ? fm.keywords : '';

    const reading_time_min =
      typeof fm.readingTime === 'number' ? fm.readingTime : estimateReadingTime(body);

    const og_title = typeof fm.ogTitle === 'string' && fm.ogTitle.length ? fm.ogTitle : title;
    const version = typeof fm.version === 'number' && fm.version > 0 ? fm.version : 1;

    const og_description =
      typeof fm.ogDescription === 'string' && fm.ogDescription.length
        ? fm.ogDescription
        : description;

    const id = typeof fm.id === 'string' && fm.id.length ? fm.id : null;
    const og_image = typeof fm.ogImage === 'string' && fm.ogImage.length ? fm.ogImage : null;
    const og_image_width =
      typeof fm.ogImageWidth === 'string' && fm.ogImageWidth.length ? fm.ogImageWidth : null;
    const og_image_height =
      typeof fm.ogImageHeight === 'string' && fm.ogImageHeight.length ? fm.ogImageHeight : null;
    const parent = typeof fm.parent === 'string' && fm.parent.length ? fm.parent : null;
    const topic = typeof fm.topic === 'string' && fm.topic.length ? fm.topic : null;
    const created_at = typeof fm.createdAt === 'string' && fm.createdAt.length ? fm.createdAt : now;
    const updated_at = typeof fm.updatedAt === 'string' && fm.updatedAt.length ? fm.updatedAt : now;
    const is_published = fm.isPublished === false ? 0 : 1;
    const is_new = fm.isNew === true ? 1 : 0;

    insertPage.run([
      id,
      parent,
      slug,
      topic,
      route,
      title,
      keywords,
      description,
      author_slug,
      layout,
      version,
      reading_time_min,
      body,
      og_title,
      og_description,
      og_image,
      og_image_width,
      og_image_height,
      created_at,
      updated_at,
      is_published,
      is_new,
    ]);
  }

  insertPage.free();

  const insertNav = db.prepare(`
    insert into navigation (
      location,
      label,
      route,
      parent_id,
      order_index,
      icon
    ) values (?, ?, ?, ?, ?, ?)
  `);

  const navSeed: BindParams[] = [
    ['header', 'Gedanken-Pool', '/content', null, 0, null],
    ['header', 'Superorganismus 2.0', '/content/superorganism-2-0', null, 1, null],
    ['header', 'Beyond Kapitalismus', '/content/beyond-capitalism', null, 2, null],
    ['header', 'Erneuerbare Energien', '/content/renewables', null, 3, null],
  ] as const;

  for (const row of navSeed) {
    insertNav.run(row);
  }

  insertNav.free();

  const binary = db.export();
  await fs.writeFile(DB_PATH, Buffer.from(binary));

  db.close();
}

buildDatabase().catch(err => {
  console.error(err);
  process.exit(1);
});
