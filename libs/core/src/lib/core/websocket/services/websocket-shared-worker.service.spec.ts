import { TestBed } from '@angular/core/testing';
import * as mockdate from 'mockdate';
import { provideConfig } from '../../tokens';
import { MockSharedWorker } from '../mocks';
import { WebsocketSharedWorkerService } from './';

vi.mock('uuid', () => ({ v4: () => 'bd6e1b9a-702f-4ca6-8728-d1742be9d4a7' }));

describe('WebsocketSharedWorkerService', () => {
  let service: WebsocketSharedWorkerService;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.stubGlobal('SharedWorker', MockSharedWorker);
    mockdate.set(1752952580109);
    TestBed.configureTestingModule({
      providers: [provideConfig({ logger: 'OFF' })],
    });
    service = TestBed.inject(WebsocketSharedWorkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get #uuid should be valid', () => {
    expect(service.uuid).toStrictEqual('bd6e1b9a-702f-4ca6-8728-d1742be9d4a7');
  });

  it('#close should close worker port', () => {
    const terminateSpy = vi.spyOn((service['_worker'] as SharedWorker).port, 'close');
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

  it('#postMessage should send valid data', () => {
    const worker = service['_worker'] as SharedWorker;
    const workerSpy = vi.spyOn(worker.port, 'postMessage');
    service.postMessage({ uuid: 'uuid' });
    expect(workerSpy).toHaveBeenCalledWith(
      '{"author":{"uuid":"bd6e1b9a-702f-4ca6-8728-d1742be9d4a7"},"created":1752952580109,"uuid":"uuid"}'
    );
  });
});
