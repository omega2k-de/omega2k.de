import { TestBed } from '@angular/core/testing';
import { WebsocketDummyWorkerService } from '.';
import { StatusMessage, WsMessages } from '../interfaces';

describe('WebsocketDummyWorkerService', () => {
  let service: WebsocketDummyWorkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketDummyWorkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get uuid should return empty string', () => {
    expect(service.uuid).toStrictEqual('');
  });

  it('get requiredFields should return minimal object', () => {
    expect(service.requiredFields).toStrictEqual({
      uuid: '',
      created: 0,
    });
  });

  it('message$ should emit initial status message', () => {
    service.message$.subscribe(message => {
      expect(message).toStrictEqual({
        uuid: '',
        created: 0,
        event: 'status',
      });
    });
  });

  it('message$ returns the initial status synchronously with requiredFields', () => {
    let initial: WsMessages | undefined;
    const sub = service.message$.subscribe(v => (initial = v));
    sub.unsubscribe();

    expect(initial).toBeDefined();
    expect((initial as StatusMessage).event).toBe('status');
    expect((initial as StatusMessage).created).toBe(0);
    expect((initial as StatusMessage).uuid).toBe('');
  });

  it('No-op APIs do not throw and have no additional emissions', () => {
    const received: WsMessages[] = [];
    const sub = service.message$.subscribe(v => received.push(v));

    expect(received.length).toBe(1);

    expect(() => service.burstPing()).not.toThrow();
    expect(() => service.close()).not.toThrow();
    expect(() => service.closeSocket()).not.toThrow();
    expect(() => service.open()).not.toThrow();
    expect(() => service.openSocket()).not.toThrow();
    expect(() => service.ping()).not.toThrow();
    expect(() => service.postMessage()).not.toThrow();
    expect(() => service.version()).not.toThrow();

    expect(received.length).toBe(1);

    sub.unsubscribe();
  });

  it('message$ should redirect messageSubject', () => {
    const nextValue = {
      event: 'status',
      uuid: 'x-1',
      created: 123,
    } as unknown as WsMessages;

    const seen: WsMessages[] = [];
    const sub = service.message$.subscribe(v => seen.push(v));

    expect(seen.length).toBe(1);

    service.messageSubject.next(nextValue);

    expect(seen.length).toBe(2);
    expect(seen[1]).toBe(nextValue);

    sub.unsubscribe();
  });
});
