import { TestBed } from '@angular/core/testing';
import { CoordinatorService } from './coordinator.service';
import { MockProvider } from 'ng-mocks';
import { WEBSOCKET_WORKER, WebsocketWorker, WsMessages } from '../websocket';
import { PwaUpdateService } from './pwa-update.service';
import { NotificationService } from './notification.service';
import { LoggerService } from '../logger';
import { DOCUMENT } from '@angular/common';
import { NetworkService } from './network.service';
import { Subject } from 'rxjs';

describe('CoordinatorService', () => {
  let message$: Subject<WsMessages>;
  let online$: Subject<boolean>;
  let workerMock: Partial<WebsocketWorker>;

  let pwaMock: Pick<PwaUpdateService, 'checkForUpdate'>;
  let notifyMock: Pick<NotificationService, 'notify'>;
  let loggerMock: Pick<LoggerService, 'info'>;
  let networkMock: Pick<NetworkService, 'isOnline$'>;

  const docBody = { setAttribute: vi.fn() };
  const docMock = { body: docBody } as unknown as Document;

  beforeEach(() => {
    vi.useFakeTimers();

    message$ = new Subject<WsMessages>();
    online$ = new Subject<boolean>();

    workerMock = {
      message$: message$.asObservable(),
      version: vi.fn(),
      openSocket: vi.fn(),
      closeSocket: vi.fn(),
    };

    pwaMock = {
      checkForUpdate: vi.fn(),
    };

    notifyMock = {
      notify: vi.fn(),
    };

    loggerMock = {
      info: vi.fn(),
    };

    networkMock = {
      isOnline$: online$.asObservable(),
    };

    TestBed.configureTestingModule({
      providers: [
        MockProvider(WEBSOCKET_WORKER, workerMock),
        MockProvider(PwaUpdateService, pwaMock),
        MockProvider(NotificationService, notifyMock),
        MockProvider(LoggerService, loggerMock),
        MockProvider(NetworkService, networkMock),
        MockProvider(DOCUMENT, docMock),
        CoordinatorService,
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('wird konstruiert und setzt Subscriptions auf (keine sofortigen Side-Effects)', () => {
    const service = TestBed.inject(CoordinatorService);
    expect(service).toBeTruthy();

    expect(workerMock.version).not.toHaveBeenCalled();
    expect(notifyMock.notify).not.toHaveBeenCalled();
  });

  describe('Worker: health → Notify', () => {
    it('sendet Health-Notification mit erwarteter Grundstruktur', () => {
      TestBed.inject(CoordinatorService);

      message$.next({
        event: 'health',
        uuid: 'u-1',
        created: 111,
        health: {
          uptime: 3605,
          clients: 2,
          memory: 0,
          usage: {
            rss: 0,
            heapTotal: 0,
            heapUsed: 0,
            external: 0,
            arrayBuffers: 0,
          },
          os: {
            cpus: 0,
            totalmem: 0,
            freemem: 0,
          },
          eventLoopDelayMs: 10,
          loadAvg: [],
          message: 'OK',
        },
      });

      expect(notifyMock.notify).toHaveBeenCalledTimes(1);
      expect(notifyMock.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'u-1',
          created: 111,
          type: 'health',
          icon: 'heart_check',
          clearTimeoutOnExpand: true,
          timeoutMs: 60_000,
          title: expect.stringContaining('Uptime:'),
          data: expect.objectContaining({ uptime: 3605 }),
        })
      );
    });
  });

  describe('Worker: update → PWA.checkForUpdate', () => {
    it('should trigger checkForUpdate after update event', async () => {
      TestBed.inject(CoordinatorService);
      const current = { hash: 'h1', version: '1.0.0' };

      message$.next({
        author: undefined,
        created: 0,
        message: '',
        uuid: '',
        event: 'update',
        current,
        update: true,
      });

      expect(loggerMock.info).toHaveBeenNthCalledWith(1, 'CoordinatorService', 'update', {
        current: {
          hash: 'h1',
          version: '1.0.0',
        },
        update: true,
      });

      expect(pwaMock.checkForUpdate).toHaveBeenCalledWith(current, true);
    });

    it('debounce reset: spätere "update"-Events verschieben den Aufruf', () => {
      TestBed.inject(CoordinatorService);

      const currentA = { hash: 'a', version: '1.0.0' };
      const currentB = { hash: 'b', version: '1.0.1' };

      message$.next({
        author: undefined,
        created: 0,
        message: '',
        uuid: '',
        event: 'update',
        current: currentA,
        update: true,
      });
      expect(pwaMock.checkForUpdate).toHaveBeenCalledWith(currentA, true);
      message$.next({
        author: undefined,
        created: 0,
        message: '',
        uuid: '',
        event: 'update',
        current: currentB,
        update: false,
      });
      expect(pwaMock.checkForUpdate).toHaveBeenCalledTimes(2);
      expect(pwaMock.checkForUpdate).toHaveBeenCalledWith(currentB, false);
    });
  });

  describe('Worker: burst-ping-result → Notify', () => {
    it('sendet Growl-Notification mit Ping-Metadaten', () => {
      TestBed.inject(CoordinatorService);

      message$.next({
        author: undefined,
        message: '',
        event: 'burst-ping-result',
        uuid: 'pp-1',
        created: 222,
        avgMs: 42,
        duration: 777,
        perSecond: 12,
        original: {
          start: 33,
          countdown: 100,
          command: 'burst-ping-pong',
          uuid: '',
          created: 0,
        },
      });

      expect(notifyMock.notify).toHaveBeenCalledTimes(1);
      expect(notifyMock.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pp-1',
          created: 222,
          type: 'growl',
          icon: 'vital_signs',
          clearTimeoutOnExpand: true,
          timeoutMs: 60_000,
          title: expect.stringContaining('Ping Test ~42ms'),
          message: expect.stringContaining('207 Bytes'),
        })
      );
    });
  });

  describe('Worker: open/close → version() nur bei open nach debounce', () => {
    it('loggt open/close, ruft version() nur bei open nach 10s', () => {
      TestBed.inject(CoordinatorService);

      message$.next({
        state: 0,
        author: {
          uuid: '',
        },
        created: 0,
        message: '',
        uuid: '',
        event: 'close',
        code: 0,
        reason: 'reason',
        wasClean: true,
      });
      expect(loggerMock.info).toHaveBeenCalledWith('CoordinatorService', 'websocket', 'close');
      expect(workerMock.version).not.toHaveBeenCalled();

      message$.next({
        author: {
          uuid: '',
        },
        created: 0,
        message: '',
        uuid: '',
        event: 'open',
        state: 1,
        url: 'wss://localhost:4444',
      });

      expect(loggerMock.info).toHaveBeenCalledWith('CoordinatorService', 'websocket', 'open');
      vi.advanceTimersByTime(10000);

      expect(workerMock.version).toHaveBeenCalledTimes(1);
    });
  });

  describe('Network: isOnline$ → openSocket()/closeSocket()', () => {
    it('öffnet/verbindet abhängig vom Online-Status', () => {
      TestBed.inject(CoordinatorService);

      online$.next(true);
      expect(workerMock.openSocket).toHaveBeenCalledTimes(1);
      expect(workerMock.closeSocket).not.toHaveBeenCalled();

      online$.next(false);
      expect(workerMock.closeSocket).toHaveBeenCalledTimes(1);
    });
  });

  describe('Public API: enable()/disable()', () => {
    it('setzt body attribute und loggt', () => {
      const service = TestBed.inject(CoordinatorService);

      service.enable();
      expect(loggerMock.info).toHaveBeenCalledWith('CoordinatorService', 'enabled');
      expect(docBody.setAttribute).toHaveBeenCalledWith('coordinator', 'enabled');

      service.disable();
      expect(loggerMock.info).toHaveBeenCalledWith('CoordinatorService', 'disabled');
      expect(docBody.setAttribute).toHaveBeenCalledWith('coordinator', 'disabled');
    });
  });

  describe('Teardown: untilDestroyed(this) trennt Streams bei Destroy', () => {
    it('nach ngOnDestroy() reagieren Streams nicht mehr', () => {
      const service = TestBed.inject(CoordinatorService);

      (service as unknown as { ngOnDestroy: () => void }).ngOnDestroy();

      message$.next({
        author: undefined,
        created: 0,
        message: '',
        uuid: '',
        event: 'open',
        state: 0,
        url: 'wss://localhost:4444',
      });
      online$.next(true);

      vi.advanceTimersByTime(5000);

      expect(workerMock.version).not.toHaveBeenCalled();
      expect(workerMock.openSocket).not.toHaveBeenCalled();
    });
  });
});
