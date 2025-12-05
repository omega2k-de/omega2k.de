import { Injectable } from '@angular/core';
import { JsonHelper } from '../../helpers';
import { WebsocketWorker, WsCommands } from '../interfaces';
import { WebsocketWorkerAbstract } from './websocket-worker.abstract';

@Injectable({
  providedIn: 'root',
})
export class WebsocketWorkerService extends WebsocketWorkerAbstract implements WebsocketWorker {
  protected override readonly _worker: Worker | null = null;

  close(): void {
    this._worker?.terminate();
  }

  postMessage(message: Partial<WsCommands>): void {
    this._worker?.postMessage(
      JsonHelper.stringify({
        ...this.requiredFields,
        ...message,
      })
    );
  }

  constructor() {
    super();
    if (typeof Worker === 'function') {
      try {
        this._worker = new Worker('./websocket.worker.js', {
          name: 'WebSocketWorker',
        });
        // this._worker.addEventListener('message', event => {
        //   this.logger.debug('WebsocketWorker', 'message', { event });
        // });
        // this._worker.addEventListener('messageerror', event => {
        //   this.logger.debug('WebsocketWorker', 'messageerror', { event });
        // });
        // this._worker.addEventListener('error', (event: ErrorEvent) => {
        //   this.logger.error('WebsocketWorker', 'error', { event });
        // });
        this.logger.info('WebsocketWorker', 'Worker websocket.worker.js created');
      } catch (_) {
        this.logger.error('WebsocketWorker', 'Worker websocket.worker.js not created');
      }
    }
  }
}
