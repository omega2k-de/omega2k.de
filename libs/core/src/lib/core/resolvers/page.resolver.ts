import { inject } from '@angular/core';
import { ContentService } from '../services';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  ResolveFn,
  Router,
  UrlTree,
} from '@angular/router';
import { catchError, of } from 'rxjs';
import { PageRecordInterface } from '../interfaces';

export const pageResolver: ResolveFn<PageRecordInterface> = (route: ActivatedRouteSnapshot) => {
  const urlTree: UrlTree = inject(Router).parseUrl('/error/404');
  const content = inject(ContentService);

  const slug = route.paramMap.get('slug') ?? '';
  const topic = route.paramMap.get('topic');

  const routePath =
    topic && slug
      ? `/content/${encodeURIComponent(topic)}/${encodeURIComponent(slug)}`
      : `/content/${encodeURIComponent(slug)}`;

  return content
    .loadByRoute(routePath.replace(/\/+$/, ''))
    .pipe(catchError(() => of(new RedirectCommand(urlTree, { skipLocationChange: true }))));
};
