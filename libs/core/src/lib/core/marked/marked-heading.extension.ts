import { marked, TokensList } from 'marked';
import { ContentHeading } from '../interfaces';
import { renderMarkdownMath } from './markdown-math';

export type MarkdownBlockKind = 'heading' | 'paragraph' | 'html';

export type MarkdownBlock = {
  kind: MarkdownBlockKind;
  level?: number;
  id?: string;
  numbering?: string | null;
  html: string;
  text?: string;
};

type HeadingState = {
  headings: ContentHeading[];
  counters: number[];
  index: number;
};

export const headingState: HeadingState = {
  headings: [],
  counters: [0, 0, 0, 0],
  index: 0,
};

export function resetHeadingState() {
  headingState.headings = [];
  headingState.counters = [0, 0, 0, 0];
  headingState.index = 0;
}

function makeNumbering(depth: number): string | null {
  if (depth < 1 || depth > 3) {
    return null;
  }

  const counters = headingState.counters;
  counters[depth] = (counters[depth] ?? 0) + 1;

  for (let i = depth + 1; i <= 3; i++) {
    counters[i] = 0;
  }

  const parts: number[] = [];
  for (let i = 1; i <= depth; i++) {
    const value = counters[i];
    if (value && value > 0) {
      parts.push(value);
    }
  }

  if (!parts.length) {
    return null;
  }

  return parts.join('.') + '.';
}

function makeId(plain: string, depth: number, numbering: string | null): string {
  const slugBase = plain
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const prefix = numbering ? numbering.replace(/\.$/, '').replace(/\./g, '-') : '';
  const withPrefix = prefix ? (slugBase ? `${prefix}-${slugBase}` : prefix) : slugBase;

  const id = withPrefix || `h${depth}-${headingState.index}`;
  let uniqueId = id;
  let suffix = 1;

  while (headingState.headings.some(h => h.id === uniqueId)) {
    uniqueId = `${id}-${suffix++}`;
  }

  return uniqueId;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

marked.use({
  renderer: {
    link(this, token) {
      const href: string = token.href || '';
      const textHtml: string = this.parser.parseInline(token.tokens);
      const titleAttr = token.title
        ? ` title="${escapeHtml(String(token.title))}"`
        : ` title="${escapeHtml(String(token.text))}"`;

      if (!href) {
        return textHtml;
      }

      if (isExternalHref(href)) {
        const safeHref = escapeHtml(href);
        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer nofollow"${titleAttr}>${textHtml}</a>`;
      }

      const safeHref = escapeHtml(href);
      return `<a href="${safeHref}" data-md-link="true"${titleAttr}>${textHtml}</a>`;
    },
  },
});

export function renderMarkdownToBlocks(markdown: string | null | undefined): {
  blocks: MarkdownBlock[];
  headings: ContentHeading[];
} {
  if (!markdown) {
    return { blocks: [], headings: [] };
  }

  const withMath = renderMarkdownMath(markdown);

  resetHeadingState();

  const tokens: TokensList = marked.lexer(withMath);
  const blocks: MarkdownBlock[] = [];

  for (const token of tokens) {
    if (!token || token.type === 'space') {
      continue;
    }

    if (token.type === 'heading') {
      const level = Number(token.depth ?? 0);
      const rawText = String(token.text ?? '');
      const text = rawText.trim();
      if (!text) {
        continue;
      }

      const numbering = makeNumbering(level);
      const id = makeId(text, level, numbering);

      const html = marked.parseInline(rawText) as string;

      if (level >= 1 && level <= 3) {
        headingState.headings.push({ id, numbering, text, html, level });
      }

      headingState.index += 1;

      blocks.push({
        kind: 'heading',
        level,
        id,
        numbering,
        html,
        text,
      });

      continue;
    }

    if (token.type === 'paragraph') {
      const text = String(token.text ?? '');
      const inlineHtml = marked.parseInline(text) as string;
      if (!inlineHtml.trim()) {
        continue;
      }

      blocks.push({
        kind: 'paragraph',
        html: inlineHtml,
      });

      continue;
    }

    const html = marked.parser([token]) as string;
    if (!html.trim()) {
      continue;
    }

    blocks.push({
      kind: 'html',
      html,
    });
  }

  return {
    blocks,
    headings: headingState.headings.slice(),
  };
}
