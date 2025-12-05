import { HttpRequest } from '@angular/common/http';
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { take } from 'rxjs';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeAll(() => TestBed.configureTestingModule({}));

  beforeAll(inject([LoadingService], (s: LoadingService) => {
    service = s;
  }));

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('#add should switch to loading', fakeAsync(() => {
    const request: HttpRequest<unknown> = new HttpRequest<unknown>('GET', '/some/url');
    service.add(request);

    tick();
    service.isLoading$.pipe(take(1)).subscribe(loading => {
      expect(loading).toStrictEqual(true);
    });
  }));

  it('#remove should switch to loading', fakeAsync(() => {
    const request: HttpRequest<unknown> = new HttpRequest<unknown>('GET', '/some/url');
    service.add(request);
    service.remove(request);

    tick();
    service.isLoading$.pipe(take(1)).subscribe(loading => {
      expect(loading).toStrictEqual(false);
    });
  }));
});
