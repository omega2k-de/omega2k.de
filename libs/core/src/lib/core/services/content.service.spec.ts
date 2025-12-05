import { TestBed } from '@angular/core/testing';
import { ContentService } from './content.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideConfig } from '../tokens';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { PageRecordInterface } from '../interfaces';

describe('ContentService', () => {
  let service: ContentService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideConfig({ logger: 'OFF' }),
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ContentService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#loadByRoute should make api request', () => {
    const callback = vi.fn();
    service.loadByRoute('/content/slug').subscribe(callback);

    const req = controller.expectOne('https://api.omega2k.de.o2k:42080/content/slug');
    req.flush(<PageRecordInterface>{ slug: '/content/slug' });

    expect(req.request.method).toEqual('GET');
    expect(callback).toHaveBeenCalledWith({ slug: '/content/slug' });
  });
});
