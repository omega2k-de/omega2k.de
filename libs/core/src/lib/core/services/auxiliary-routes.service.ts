import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map, Observable, shareReplay, startWith } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ObjectHelper } from '../helpers';

export type AuxiliaryRoutesType = Partial<Record<string, boolean>>;

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class AuxiliaryRoutesService {
  private router: Router = inject(Router);

  private activeChildEntries$: Observable<AuxiliaryRoutesType> = this.router.events.pipe(
    startWith(new NavigationEnd(0, '', '')),
    filter(e => e instanceof NavigationEnd),
    map(() => this.getChildEntries()),
    distinctUntilChanged(ObjectHelper.isEqual),
    shareReplay(1),
    untilDestroyed(this)
  );

  readonly activeAuxiliaryRoutes: Signal<AuxiliaryRoutesType> = toSignal(this.activeChildEntries$, {
    requireSync: true,
  });

  get noAuxiliaryRouteActive$(): Observable<boolean> {
    return this.activeChildEntries$.pipe(
      map((data: AuxiliaryRoutesType) => Object.keys(data).length === 0)
    );
  }

  isActive(key: string): Observable<boolean> {
    return this.activeChildEntries$.pipe(map(data => key in data && !!data[key]));
  }

  protected getChildEntries(): AuxiliaryRoutesType {
    const navigation = this.router.currentNavigation();
    const children = navigation?.extractedUrl?.root.children ?? {};
    const keys = Object.keys(children).filter(key => key !== 'primary');
    return Object.fromEntries(keys.map(k => [k, k in children]));
  }
}
