import {
  ActivatedRouteSnapshot,
  createUrlTreeFromSnapshot,
  Params,
  UrlTree,
} from '@angular/router';

export function redirectByCommand(
  commands: string[],
  route: ActivatedRouteSnapshot,
  queryParams?: Params,
  fragment: string | null = null
): UrlTree {
  return createUrlTreeFromSnapshot(
    route.root,
    commands,
    queryParams ?? route.queryParams,
    fragment ?? route.fragment
  );
}
