import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ORIGIN } from '@o2k/core';
import { filter, map, startWith } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgOptimizedImage } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'ui-share-on-bluesky',
  imports: [NgOptimizedImage],
  templateUrl: './share-on-bluesky.component.html',
  styleUrl: './share-on-bluesky.component.scss',
})
export class ShareOnBlueskyComponent implements OnInit {
  private router = inject(Router);
  private origin = inject(ORIGIN);
  protected readonly baseUrl = 'https://bsky.app/intent/compose';
  protected readonly href = signal<string | null>(null);

  ngOnInit(): void {
    this.router.events
      .pipe(
        startWith(new NavigationEnd(0, this.router.url, '')),
        filter(event => event instanceof NavigationEnd),
        map(() => {
          const url = new URL(`${this.origin}${this.router.url}`.replace(/\/?\([^)]+\).*$/gi, ''));
          return `${url.origin}${url.pathname}`;
        }),
        untilDestroyed(this)
      )
      .subscribe(url => {
        const tweetUrl = new URL(this.baseUrl);
        tweetUrl.searchParams.set('url', url);
        tweetUrl.searchParams.set(
          'text',
          `Ich habe einen interessanten Artikel gefunden, den ich gerne mit euch teilen möchte. Ein #Perspektivenwechsel kann nicht schaden, lesen lohnt sich. 👇\n${url}`
        );
        this.href.set(tweetUrl.toString());
      });
  }
}
