import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private id = inject(PLATFORM_ID);

  get platformId() {
    return this.id;
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.id);
  }

  get isServer(): boolean {
    return isPlatformServer(this.id);
  }
}
