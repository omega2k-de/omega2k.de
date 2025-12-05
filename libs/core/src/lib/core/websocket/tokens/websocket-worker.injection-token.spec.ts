import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { afterEach, expect } from 'vitest';
import {
  WEBSOCKET_WORKER,
  WebsocketDummyWorkerService,
  WebsocketSharedWorkerService,
  WebsocketWorkerService,
} from '..';
import { provideConfig } from '../../tokens';
import { LoggerService } from '../../logger';
import { MockSharedWorker, MockWorker } from '../mocks';

describe('InjectionToken<WebsocketWorker>', () => {
  let logger: LoggerService;

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideConfig({ logger: 'OFF' }),
        MockProvider(LoggerService, {
          debug: vi.fn(),
          error: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          log: vi.fn(),
        }),
      ],
    });
    logger = TestBed.inject(LoggerService);
  });

  it('inject should create WebsocketDummyWorkerService', () => {
    const websocketWorker = TestBed.inject(WEBSOCKET_WORKER);
    expect(websocketWorker).toBeInstanceOf(WebsocketDummyWorkerService);
  });

  it('inject should create WebsocketWorkerService', () => {
    const infoSpy = vi.spyOn(logger, 'info');
    vi.stubGlobal('Worker', MockWorker);
    const websocketWorker = TestBed.inject(WEBSOCKET_WORKER);
    expect(websocketWorker).toBeInstanceOf(WebsocketWorkerService);
    expect(infoSpy).toBeCalledWith('WebsocketWorker', 'Worker websocket.worker.js created');
  });

  it('inject should create WebsocketSharedWorkerService', () => {
    vi.stubGlobal('SharedWorker', MockSharedWorker);
    const websocketWorker = TestBed.inject(WEBSOCKET_WORKER);
    expect(websocketWorker).toBeInstanceOf(WebsocketSharedWorkerService);
  });

  it('inject should catch errors in WebsocketWorkerService', () => {
    const errorSpy = vi.spyOn(logger, 'error');
    vi.stubGlobal('Worker', () => {
      throw new Error('test');
    });
    const websocketWorker = TestBed.inject(WEBSOCKET_WORKER);
    expect(websocketWorker).toBeInstanceOf(WebsocketWorkerService);
    expect(errorSpy).toBeCalledWith('WebsocketWorker', 'Worker websocket.worker.js not created');
  });

  it('inject should catch errors in WebsocketSharedWorkerService', () => {
    const errorSpy = vi.spyOn(logger, 'error');
    vi.stubGlobal('SharedWorker', () => {
      throw new Error('test');
    });
    const websocketWorker = TestBed.inject(WEBSOCKET_WORKER);
    expect(websocketWorker).toBeInstanceOf(WebsocketSharedWorkerService);
    expect(errorSpy).toBeCalledWith(
      'WebsocketSharedWorker',
      'Worker websocket.shared-worker.js not created'
    );
  });
});
