import { TestBed } from '@angular/core/testing';
import * as mockdate from 'mockdate';
import { provideConfig } from '../../tokens';
import { MockBroadcastChannel, MockWorker } from '../mocks';
import { WebsocketWorkerService } from './';

vi.mock('uuid', () => ({ v4: () => 'bd6e1b9a-702f-4ca6-8728-d1742be9d4a7' }));

describe('WebsocketWorkerService', () => {
  let service: WebsocketWorkerService;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
    vi.stubGlobal('Worker', MockWorker);
    mockdate.set(1752952580109);

    TestBed.configureTestingModule({
      providers: [provideConfig({ logger: 'OFF' })],
    });

    service = TestBed.inject(WebsocketWorkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get #uuid should be valid', () => {
    expect(service.uuid).toStrictEqual('bd6e1b9a-702f-4ca6-8728-d1742be9d4a7');
  });

  it('#postMessage should post worker message', () => {
    const postMessageSpy = vi.spyOn(service['_worker'] as Worker, 'postMessage');

    service.postMessage({});

    expect(postMessageSpy).toHaveBeenCalledWith(
      '{"author":{"uuid":"bd6e1b9a-702f-4ca6-8728-d1742be9d4a7"},"created":1752952580109,"uuid":"bd6e1b9a-702f-4ca6-8728-d1742be9d4a7"}'
    );
  });

  it('#close should terminate worker', () => {
    const terminateSpy = vi.spyOn(service['_worker'] as Worker, 'terminate');

    service.close();

    expect(terminateSpy).toHaveBeenCalled();
  });

  it('get #requiredFields should be valid', () => {
    expect(service.requiredFields).toStrictEqual({
      uuid: 'bd6e1b9a-702f-4ca6-8728-d1742be9d4a7',
      created: 1752952580109,
      author: {
        uuid: 'bd6e1b9a-702f-4ca6-8728-d1742be9d4a7',
      },
    });
  });
});
