import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { HEALTH_CHECK_DELAY, HEALTH_CHECK_INTERVAL, HealthService, PlatformService } from '.';
import { provideConfig } from '../tokens';
import { HealthStatus } from '../interfaces/health-status.interface';

describe('HealthService', () => {
  let service: HealthService;
  let platform: PlatformService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideConfig({ logger: 'OFF' }),
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        MockProvider(PlatformService),
        {
          provide: HEALTH_CHECK_INTERVAL,
          useValue: 10000,
        },
        {
          provide: HEALTH_CHECK_DELAY,
          useValue: 500,
        },
      ],
    });
    service = TestBed.inject(HealthService);
    platform = TestBed.inject(PlatformService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.enabled).toBeFalsy();
  });

  it('#enable should do enable', () => {
    vi.spyOn(platform, 'isBrowser', 'get').mockReturnValueOnce(true);
    service.enable();
    expect(service).toBeTruthy();
    expect(service.enabled).toBeTruthy();
  });

  it('#disable should do disable', () => {
    vi.spyOn(platform, 'isBrowser', 'get').mockReturnValueOnce(true);
    service.enable();
    service.disable();
    expect(service).toBeTruthy();
    expect(service.enabled).toBeFalsy();
  });

  it('#get should call api', () => {
    service.getHealth().subscribe();

    const req = controller.expectOne('https://api.omega2k.de.o2k:42080/_health');
    expect(req.request.method).toEqual('GET');
    req.flush(<HealthStatus>{ uptime: 1000, message: 'OK' });
  });

  it('#init should start interval and call after delay', fakeAsync(() => {
    vi.spyOn(platform, 'isBrowser', 'get').mockReturnValueOnce(true);

    service.enable().subscribe();
    flush(10501);

    setTimeout(() => {
      const req = controller.expectOne('https://api.omega2k.de.o2k:42080/_health');
      expect(req.request.method).toEqual('GET');
      req.flush(<HealthStatus>{ uptime: 501, message: 'OK', memory: 2048 });
    }, 501);

    setTimeout(() => {
      const req = controller.expectOne('https://api.omega2k.de.o2k:42080/_health');
      expect(req.request.method).toEqual('GET');
      req.flush(<HealthStatus>{ uptime: 10501, message: 'OK', memory: 2048 });
    }, 10501);
  }));

  it('#init should repeat interval', fakeAsync(() => {
    vi.spyOn(platform, 'isBrowser', 'get').mockReturnValueOnce(true);

    service.enable().subscribe();
    flush(501);

    setTimeout(() => {
      const req1 = controller.expectOne('https://api.omega2k.de.o2k:42080/_health');
      expect(req1.request.method).toEqual('GET');
      req1.flush(<HealthStatus>{ uptime: 501, message: 'OK', memory: 2048 });
    }, 501);
  }));
});
