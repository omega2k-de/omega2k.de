import { LocationStrategy } from '@angular/common';
import { Directive, HostListener, inject, Input, signal, type WritableSignal } from '@angular/core';
import { Router, RouterLink, UrlTree } from '@angular/router';
import { CommandOrUrlTreeType } from '@o2k/core';

@Directive({
  selector: 'a[uiRouterLink][routerLink]',
  host: {
    '[attr.href]': '_href()',
  },
})
export class RouterLinkDirective extends RouterLink {
  private readonly _router: Router = inject(Router);
  private readonly _locationStrategy: LocationStrategy | null = inject(LocationStrategy, {
    optional: true,
  });
  protected readonly _href: WritableSignal<string | null> = signal<string | null>(null);

  private get strippedTree(): UrlTree | null {
    const tree: UrlTree | null = super.urlTree;
    if (tree) {
      tree.queryParams = {};
    }
    return tree;
  }

  @Input()
  override set routerLink(commandsOrUrlTree: CommandOrUrlTreeType) {
    if (
      typeof commandsOrUrlTree === 'string' &&
      /^((http|ftp)s?:)?\/\/(([^./]+\.)+[^./\r\n]+)/.test(commandsOrUrlTree)
    ) {
      this.update(commandsOrUrlTree);
    } else {
      super.routerLink = commandsOrUrlTree;
      this.update(this.strippedTree);
    }
  }

  @HostListener('pointerdown')
  protected restore() {
    this.update(super.urlTree);
  }

  private update(urlTree: UrlTree | null | string): void {
    if (typeof urlTree === 'string') {
      this._href.set(urlTree);
    } else {
      this._href.set(
        urlTree !== null && this._locationStrategy
          ? (this._locationStrategy?.prepareExternalUrl(this._router.serializeUrl(urlTree)) ?? '')
          : null
      );
    }
  }
}
