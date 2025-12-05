import { Injectable } from '@angular/core';
import { WebsocketWorker, WsCommands } from '../interfaces';
import { WebsocketWorkerAbstract } from './websocket-worker.abstract';
import { JsonHelper } from '../../helpers';

@Injectable({
  providedIn: 'root',
})
export class WebsocketSharedWorkerService
  extends WebsocketWorkerAbstract
  implements WebsocketWorker
{
  protected override readonly _worker: SharedWorker | null = null;

  close(): void {
    this._worker?.port.close();
  }

  postMessage(message: Partial<WsCommands>): void {
    this._worker?.port.postMessage(
      JsonHelper.stringify({
        ...this.requiredFields,
        ...message,
      })
    );
  }

  constructor() {
    super();
    if (typeof SharedWorker === 'function') {
      try {
        this._worker = new SharedWorker('./websocket.shared-worker.js', {
          name: 'WebSocketSharedWorker',
        });
        this._worker.port.start();
      } catch (_) {
        this.logger.error('WebsocketSharedWorker', 'Worker websocket.shared-worker.js not created');
      }
    }
  }
}
