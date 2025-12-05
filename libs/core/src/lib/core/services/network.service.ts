import { inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoggerService } from '../logger';
import { NAVIGATOR, WINDOW } from '../tokens';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private logger = inject(LoggerService);
  private zone = inject(NgZone);
  private enabled = false;
  private window = inject(WINDOW);
  private navigator = inject(NAVIGATOR);
  private onlineStatus = new BehaviorSubject<boolean>(this.navigator?.onLine ?? true);
  readonly isOnline$: Observable<boolean> = this.onlineStatus.asObservable();

  enable(): void {
    this.modifyListeners('add');
  }

  disable(): void {
    this.modifyListeners('remove');
  }

  private onlineListener = () => this.onlineStatus.next(true);

  private offlineListener = () => this.onlineStatus.next(false);

  private modifyListeners(action: 'add' | 'remove'): void {
    const window = this.window;
    if (window && this.needToModifyListeners(action)) {
      const method = action === 'add' ? 'addEventListener' : 'removeEventListener';
      this.enabled = action === 'add';
      this.logger.info('NetworkService', this.enabled ? 'enabled' : 'disabled');
      this.zone.runOutsideAngular(() => {
        window[method]('online', this.onlineListener);
        window[method]('offline', this.offlineListener);
      });
    }
  }

  private needToModifyListeners(action: 'add' | 'remove'): boolean {
    return (action === 'add' && !this.enabled) || (action === 'remove' && this.enabled);
  }
}
