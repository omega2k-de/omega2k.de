import { computed, inject, Injectable, signal } from '@angular/core';
import { ContentHeading, PageRecordInterface } from '../interfaces';
import { ReadingProgressStorage } from '../storages';
import { ScrollProgressService } from './scroll-progress.service';
import { filter, Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { PlatformService } from './platform.service';

@Injectable({ providedIn: 'root' })
export class ContentContextService {
  private subscription: Subscription | null = null;
  private readonly router = inject(Router);
  private readonly platform = inject(PlatformService);
  private readonly readingProgressStorage = inject(ReadingProgressStorage);
  private readonly scrollProgressService = inject(ScrollProgressService);
  private readonly _page = signal<PageRecordInterface | null>(null);
  private readonly _headings = signal<ContentHeading[]>([]);

  readonly page = computed(() => this._page());
  readonly headings = computed(() => this._headings());

  constructor() {
    if (this.platform.isBrowser) {
      this.router.events
        .pipe(filter(event => event instanceof NavigationStart))
        .subscribe(() => this.subscription?.unsubscribe());
    }
  }

  setPage(page: PageRecordInterface | null, headings: ContentHeading[]): void {
    this._page.set(page);
    this._headings.set(headings);
    this.subscription?.unsubscribe();
    if (page) {
      this.enable(page.id);
    }
  }

  private enable(key: number): void {
    this.subscription = this.scrollProgressService.progress$.subscribe(progress =>
      this.readingProgressStorage.setProgress(key, progress)
    );
  }
}
