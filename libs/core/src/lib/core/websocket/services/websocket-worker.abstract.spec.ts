import { TestBed } from '@angular/core/testing';
import { WebsocketWorkerAbstract } from './websocket-worker.abstract';
import { CONFIG } from '../../tokens';
import { LoggerService } from '../../logger';
import { type WsCommands, type WsMessages } from '../interfaces';
import { vi } from 'vitest';

describe('WebsocketWorkerAbstract mocked subclass', () => {
  const addEventListenerSpy = vi.fn<(type: string, cb: (ev: MessageEvent) => void) => void>();
  class FakeBroadcastChannel {
    name: string;
    addEventListener = addEventListenerSpy;
    constructor(name: string) {
      this.name = name;
    }
  }

  const getMessageHandler = () => {
    const entry = addEventListenerSpy.mock.calls.find(c => c[0] === 'message');
    return entry?.[1] as ((ev: MessageEvent) => void) | undefined;
  };

  class TestWorker extends WebsocketWorkerAbstract {
    constructor(
      private readonly postSpy: (msg: Partial<WsCommands>) => void,
      private readonly closeSpy: () => void
    ) {
      super();
    }

    override close(): void {
      this.closeSpy();
    }

    override postMessage(message: Partial<WsCommands>): void {
      this.postSpy(message);
    }

    _emit(msg: WsMessages) {
      (
        this as unknown as { messageSubject: { next: (m: WsMessages) => void } }
      ).messageSubject.next(msg);
    }
  }

  const loggerMock: Partial<LoggerService> = {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const postSpy = vi.fn<(msg: Partial<WsCommands>) => void>();
  const closeSpy = vi.fn<() => void>();

  const FIX_NOW = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIX_NOW);
    addEventListenerSpy.mockClear();
    postSpy.mockClear();
    closeSpy.mockClear();
    vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel as unknown as typeof BroadcastChannel);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CONFIG,
          useValue: { socket: 'wss://test.example/ws', version: '1.2.3', hash: 'deadbeef' },
        },
        { provide: LoggerService, useValue: loggerMock },
      ],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  function create(): TestWorker {
    return TestBed.runInInjectionContext(() => new TestWorker(postSpy, closeSpy));
  }

  it('registers BroadcastChannel listeners in the constructor', () => {
    create();
    expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('#burstPing(countdown) posts correctly; default countdown=100', () => {
    const w = create();
    w.burstPing(5);
    expect(postSpy).toHaveBeenCalledWith({ command: 'burst-ping-pong', countdown: 5 });

    postSpy.mockClear();
    w.burstPing();
    expect(postSpy).toHaveBeenCalledWith({ command: 'burst-ping-pong', countdown: 100 });
  });

  it('#closeSocket(),ping(),open(url) use postMessage with correct payloads', () => {
    const w = create();

    w.closeSocket();
    w.ping();
    w.open('ws://custom');

    expect(postSpy).toHaveBeenNthCalledWith(1, { command: 'close-socket' });
    expect(postSpy).toHaveBeenNthCalledWith(2, { command: 'ping' });
    expect(postSpy).toHaveBeenNthCalledWith(3, { command: 'open-socket', url: 'ws://custom' });
  });

  it('#openSocket() uses CONFIG.socket and version()/hash() uses CONFIG.version/hash', () => {
    const w = create();

    w.openSocket();
    expect(postSpy).toHaveBeenCalledWith({
      command: 'open-socket',
      url: 'wss://test.example/ws',
    });

    postSpy.mockClear();
    w.version();
    expect(postSpy).toHaveBeenCalledWith({
      command: 'version',
      current: { version: '1.2.3', hash: 'deadbeef' },
    });
  });

  it('#openSocket() uses fallback URL if CONFIG.socket is missing', () => {
    TestBed.resetTestingModule();
    vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel as unknown as typeof BroadcastChannel);
    TestBed.configureTestingModule({
      providers: [
        { provide: CONFIG, useValue: { version: '9.9.9', hash: 'ffff' } }, // socket fehlt!
        { provide: LoggerService, useValue: loggerMock },
      ],
    });

    const w = create();
    w.openSocket();
    expect(postSpy).toHaveBeenCalledWith({
      command: 'open-socket',
      url: 'wss://api.omega2k.de.o2k:42080',
    });
  });

  it('#requiredFields returns created ~ now, uuid (new), and author.uuid = getter-uuid', () => {
    const w = create();
    const rf = w.requiredFields;
    expect(rf.created).toBe(FIX_NOW);
    expect(typeof rf.uuid).toBe('string');
    expect(rf.uuid.length).toBeGreaterThan(0);
    expect(rf.author?.uuid).toBe(w.uuid);
  });

  it('message$ deduplicated by uuid and sets _uuid for event="me"', () => {
    const w = create();
    const seen: WsMessages[] = [];
    w.message$.subscribe(m => seen.push(m));

    const handler = getMessageHandler() as unknown as { (ev: MessageEvent): void };
    expect(handler).toBeDefined();

    handler({
      data: { uuid: 'u1', event: 'foo', data: {} } as unknown as WsMessages,
    } as MessageEvent<WsMessages>);
    handler({
      data: { uuid: 'u1', event: 'bar', data: {} } as unknown as WsMessages,
    } as MessageEvent<WsMessages>);
    handler({
      data: { uuid: 'u2', event: 'me', data: { uuid: 'author-123' } } as WsMessages,
    } as MessageEvent<WsMessages>);

    expect(seen.map(m => m.event)).toEqual(['foo', 'me']);
    expect(w.uuid).toBe('author-123');
  });

  it('close() is implemented by subclass and can be called', () => {
    const w = create();
    w.close();
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
