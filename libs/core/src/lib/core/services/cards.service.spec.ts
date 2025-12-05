import { TestBed } from '@angular/core/testing';
import { CardsService } from './cards.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideConfig } from '../tokens';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { PageRecordInterface } from '../interfaces';

describe('CardsService', () => {
  let service: CardsService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideConfig({ logger: 'OFF' }),
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CardsService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#loadBySlug should make api request', () => {
    const callback = vi.fn();
    service.loadBySlug('slug').subscribe(callback);

    const req = controller.expectOne('https://api.omega2k.de.o2k:42080/cards/slug');
    req.flush(<PageRecordInterface>{ slug: '/content/slug' });

    expect(req.request.method).toEqual('GET');
    expect(callback).toHaveBeenCalledWith({ slug: '/content/slug' });
  });
});
