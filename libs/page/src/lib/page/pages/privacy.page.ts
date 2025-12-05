import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconDirective, VibrateDirective } from '@o2k/ui';
import dayjs from 'dayjs';
import { JsonPipe } from '@angular/common';
import { CookieEntry, PrivacyService } from '@o2k/core';

@Component({
  selector: 'page-privacy-page',
  imports: [RouterLink, IconDirective, VibrateDirective, JsonPipe],
  templateUrl: './privacy.page.html',
  styleUrl: './privacy.page.scss',
})
export class PrivacyPage {
  load(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.privacyService.cookies().subscribe(cookies => this.cookies.set(cookies));
  }
  protected readonly createdAt = '2025-11-23T20:43:48.495Z';
  protected readonly dayjs = dayjs;
  protected readonly privacyService = inject(PrivacyService);
  protected readonly cookies = signal<CookieEntry[]>([]);
}
