import { Component, HostListener, inject, input } from '@angular/core';
import {
  IconDirective,
  ReadingProgressDirective,
  RouterLinkDirective,
  VibrateDirective,
} from '../../directives';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import dayjs from 'dayjs';
import { PageRecordInterface } from '@o2k/core';

@Component({
  selector: 'ui-card',
  imports: [
    IconDirective,
    RouterLinkActive,
    RouterLink,
    ReadingProgressDirective,
    RouterLinkDirective,
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    tabindex: '0',
    role: 'button',
    class: 'deck-card lift-anchor nm-surface nm-raised',
    '[attr.aria-labelledby]': "'dcl'+card().id",
    '[attr.aria-describedby]': "'dcd'+card().id",
  },
})
export class CardComponent extends VibrateDirective {
  private readonly router = inject(Router);
  readonly card = input.required<PageRecordInterface>();
  protected readonly dayjs = dayjs;
  @HostListener('keydown.enter')
  @HostListener('click')
  onClick() {
    return this.router.navigateByUrl(this.card().route);
  }

  protected removePrefix(title: string): string {
    return title.split(':').splice(1).join('-') ?? title;
  }
}
