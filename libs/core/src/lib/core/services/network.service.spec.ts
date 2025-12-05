import { TestBed } from '@angular/core/testing';
import { NetworkService } from './network.service';
import { provideConfig } from '../tokens';

describe('NetworkService', () => {
  let service: NetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NetworkService, provideConfig({ logger: 'OFF' })],
    });

    service = TestBed.inject(NetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('enable then disable attaches and detaches listeners', () => {
    let state: boolean | undefined;
    const sub = service.isOnline$.subscribe(v => (state = v));

    service.enable();
    window.dispatchEvent(new Event('offline'));
    expect(state).toBe(false);
    window.dispatchEvent(new Event('online'));
    expect(state).toBe(true);

    service.disable();
    window.dispatchEvent(new Event('offline'));
    expect(state).toBe(true); // unchanged

    sub.unsubscribe();
  });
});
