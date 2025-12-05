import { Routes } from '@angular/router';

export type UniqueArray<T> = T extends ReadonlyArray<infer U> ? U[] & { __unique: never } : never;

export class ArrayHelper {
  static filterUnique = <T>(v: T, i: number, a: T[]) => a.indexOf(v) === i;
  static arrayUnique = <T>(list: T[]) => list.filter(ArrayHelper.filterUnique);
  static createUnique = <T>(arr: ReadonlyArray<T>): UniqueArray<T> =>
    Array.from(new Set(arr)) as UniqueArray<T>;
  static duplicateKeys<T>(arr: T[], key: keyof T): T[keyof T][] {
    const keys = arr.map(item => item[key]);
    return keys.filter(key => keys.indexOf(key) !== keys.lastIndexOf(key));
  }
}

export function collectNavigableLoadComponentPaths(routes: Routes): string[] {
  const out: string[] = [];

  const walk = (
    routes: Routes | undefined,
    baseSegments: string[],
    blockedByReason: boolean,
    inAuxOutlet: boolean
  ) => {
    if (!routes?.length) return;

    for (const r of routes) {
      const rawPath = (r.path ?? '').trim();
      const seg = splitClean(rawPath);
      const hasWildcard = rawPath.includes('*') || seg.includes('**');
      const hasParams = seg.some(s => s.startsWith(':'));
      const hasMatcher = typeof r.matcher === 'function';
      const hasRedirect = !!r.redirectTo;
      const isAuxOutlet = !!r.outlet && r.outlet !== 'primary';

      if (inAuxOutlet || isAuxOutlet) {
        continue;
      }

      const blocked = blockedByReason || hasWildcard || hasParams || hasMatcher;
      const nextSeg = seg.length ? [...baseSegments, ...seg] : baseSegments;

      const eligible = !!r.loadComponent && !blocked && !hasRedirect;

      if (eligible) {
        out.push(toAbsolute(nextSeg));
      }

      if (Array.isArray(r.children) && !blocked) {
        walk(r.children, nextSeg, blocked, false);
      }
    }
  };

  walk(routes, [], false, false);

  return Array.from(new Set(out)).map(normalizeSlashes);
}

function splitClean(path: string): string[] {
  if (!path) return [];
  return path
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);
}

function toAbsolute(segments: string[]): string {
  return segments.length ? `/${segments.join('/')}` : '';
}

function normalizeSlashes(p: string): string {
  const q = p.replace(/\/{2,}/g, '/');
  return q === '' ? '' : q;
}
