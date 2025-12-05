import { TestBed } from '@angular/core/testing';

import { CookieEntry, PrivacyService } from './privacy.service';
import { provideConfig } from '../tokens';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('PrivacyService', () => {
  let controller: HttpTestingController;
  let service: PrivacyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideConfig({ logger: 'OFF' }),
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PrivacyService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#cookies should return cookies from api', () => {
    const callback = vi.fn();
    service.cookies().subscribe(callback);

    const req = controller.expectOne('https://api.omega2k.de.o2k:42080/privacy');
    req.flush(<{ cookies: CookieEntry[] }>{ cookies: [{ key: 'a', value: '1' }] });

    expect(req.request.method).toEqual('GET');
    expect(req.request.withCredentials).toEqual(true);
    expect(callback).toHaveBeenCalledWith([{ key: 'a', value: '1' }]);
  });

  it('#privacy should return full object from api', () => {
    const callback = vi.fn();
    service.privacy().subscribe(callback);

    const req = controller.expectOne('https://api.omega2k.de.o2k:42080/privacy');
    req.flush(<{ cookies: CookieEntry[] }>{ cookies: [{ key: 'b', value: '2' }] });

    expect(req.request.method).toEqual('GET');
    expect(req.request.withCredentials).toEqual(true);
    expect(callback).toHaveBeenCalledWith({ cookies: [{ key: 'b', value: '2' }] });
  });
});
