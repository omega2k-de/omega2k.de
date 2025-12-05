import { Component, effect, ElementRef, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentContextService, PageData, PageRecordInterface, WINDOW } from '@o2k/core';
import { map } from 'rxjs';
import { MarkdownBlock, renderMarkdownToBlocks } from '@o2k/core';
import { IconDirective, LikeButtonComponent, SafeHtmlPipe } from '@o2k/ui';
import dayjs from 'dayjs';

@Component({
  selector: 'page-content-page',
  imports: [RouterLink, SafeHtmlPipe, IconDirective, LikeButtonComponent],
  templateUrl: './content.page.html',
  styleUrl: './content.page.scss',
})
export class ContentPage {
  private readonly stickyOffset = 200;
  private readonly route = inject(ActivatedRoute);
  private readonly context = inject(ContentContextService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly win = inject(WINDOW);

  private readonly resolvedPage = toSignal<PageRecordInterface | null>(
    this.route.data.pipe(map((data: PageData) => data['page'] ?? null)),
    {
      initialValue: null,
    }
  );
  readonly page = signal<PageRecordInterface | null>(null);
  readonly blocks = signal<MarkdownBlock[]>([]);

  constructor() {
    effect(() => {
      const page = this.resolvedPage();
      if (!page) {
        this.page.set(null);
        this.blocks.set([]);
        this.context.setPage(null, []);
        return;
      }

      const { blocks, headings } = renderMarkdownToBlocks(page.bodyMarkdown ?? '');
      this.page.set(page);
      this.blocks.set(blocks);
      this.context.setPage(page, headings);
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateStickyState();
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent) {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.defaultPrevented
    ) {
      return;
    }

    const anchor = this.findAnchor(event.target as HTMLElement | null);
    if (!anchor) {
      return;
    }

    const hrefAttr = anchor.getAttribute('href') || '';
    if (!hrefAttr) {
      return;
    }

    if (!anchor.hasAttribute('data-md-link')) {
      return;
    }

    if (
      /^https?:\/\//i.test(hrefAttr) ||
      hrefAttr.startsWith('mailto:') ||
      hrefAttr.startsWith('tel:')
    ) {
      return;
    }

    event.preventDefault();

    if (hrefAttr.startsWith('#')) {
      const fragment = hrefAttr.slice(1);
      this.router.navigate([], { fragment, queryParamsHandling: 'preserve' }).catch();
      return;
    }

    this.router.navigateByUrl(hrefAttr).catch();
  }

  private findAnchor(start: HTMLElement | null): HTMLAnchorElement | null {
    const hostEl = this.host.nativeElement;
    let el: HTMLElement | null = start;

    while (el && el !== hostEl) {
      if (el.tagName.toLowerCase() === 'a') {
        return el as HTMLAnchorElement;
      }
      el = el.parentElement;
    }

    return null;
  }

  protected readonly dayjs = dayjs;

  private updateStickyState() {
    if (this.win) {
      const host = this.host.nativeElement;
      const scrollY = this.win.scrollY || this.win.pageYOffset || 0;
      const stuck = scrollY >= this.stickyOffset;
      host.classList.toggle('is-header-stuck', stuck);
    }
  }
}
