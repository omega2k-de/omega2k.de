import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TelemetryService } from './telemetry.service';
import { WINDOW } from '../../tokens';
import { TELEMETRY_FPS, WEBSOCKET_WORKER } from '../tokens';
import type { WebsocketWorker } from '../interfaces';
import { WsMessage, WsMessages } from '../interfaces';
import { vi } from 'vitest';
import { Observable } from 'rxjs';

class FakeWorker implements WebsocketWorker {
  posted: { [key: string]: unknown }[] = [];

  burstPing(): void {
    // noop
  }

  close(): void {
    // noop
  }

  closeSocket(): void {
    // noop
  }

  message$ = {
    subscribe: () => ({
      unsubscribe() {
        // noop
      },
    }),
  } as Observable<WsMessages>;

  open(): void {
    // noop
  }

  openSocket(): void {
    // noop
  }

  ping(): void {
    // noop
  }

  postMessage(msg: { [key: string]: unknown }): void {
    this.posted.push(msg);
  }

  get requiredFields(): Pick<WsMessage, 'uuid' | 'created' | 'author'> {
    return { uuid: 'test-uuid', created: 0, author: { uuid: 'test-uuid' } };
  }

  get uuid() {
    return 'test-uuid';
  }

  version(): void {
    // noop
  }
}

describe('TelemetryService (extra)', () => {
  let service: TelemetryService;
  let worker: FakeWorker;
  let document: Document;

  beforeEach(() => {
    TestBed.resetTestingModule();
    worker = new FakeWorker();
    TestBed.configureTestingModule({
      providers: [
        { provide: WEBSOCKET_WORKER, useValue: worker },
        { provide: TELEMETRY_FPS, useValue: 1000 }, // sample every 1 ms -> easy to pass
      ],
    });
    service = TestBed.inject(TelemetryService);
    document = TestBed.inject(DOCUMENT);
  });

  it('start() is idempotent (second call does not re-post start)', () => {
    const spy = vi.spyOn(worker, 'postMessage');
    service.start();
    service.start();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      command: 'pointer-start',
      message: 'TelemetryService.start',
    });
  });

  it('stop() when not running is a no-op (no pointer-stop)', () => {
    const spy = vi.spyOn(worker, 'postMessage');
    service.stop();
    expect(spy).not.toHaveBeenCalled();
  });

  it('SSR path (WINDOW undefined) yields inner sizes 0 on mouse event', () => {
    TestBed.resetTestingModule();
    worker = new FakeWorker();
    TestBed.configureTestingModule({
      providers: [
        { provide: WEBSOCKET_WORKER, useValue: worker },
        { provide: TELEMETRY_FPS, useValue: 1000 },
        { provide: WINDOW, useValue: undefined },
      ],
    });
    service = TestBed.inject(TelemetryService);
    document = TestBed.inject(DOCUMENT);

    service.start();
    const spy = vi.spyOn(worker, 'postMessage');
    const evt = new MouseEvent('mousemove', { clientX: 10, clientY: 20 });
    document.dispatchEvent(evt);

    const last = worker.posted.find(m => m?.['command'] === 'mouse');
    expect(last).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });
});
