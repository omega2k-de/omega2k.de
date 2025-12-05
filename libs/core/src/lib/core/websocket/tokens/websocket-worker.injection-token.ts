import { inject, InjectionToken } from '@angular/core';
import { WebsocketWorker } from '../interfaces';
import { WebsocketDummyWorkerService } from '../services/websocket-dummy-worker.service';
import { WebsocketSharedWorkerService } from '../services/websocket-shared-worker.service';
import { WebsocketWorkerService } from '../services/websocket-worker.service';

export const WEBSOCKET_WORKER = new InjectionToken<WebsocketWorker>('Websocket Worker Service', {
  providedIn: 'root',
  factory: () => {
    switch (true) {
      case typeof SharedWorker === 'function':
        return inject(WebsocketSharedWorkerService);
      case typeof Worker === 'function':
        return inject(WebsocketWorkerService);
      default:
        return inject(WebsocketDummyWorkerService);
    }
  },
});
