import { HttpClient, HttpHeaders, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { LoadingService } from '../services';
import { LoadingInterceptorFn } from './loading.interceptor.fn';

describe('LoadingInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  const mockLoadingService: Partial<LoadingService> = {
    add: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      // here are the KEY changes
      providers: [
        provideHttpClient(withInterceptors([LoadingInterceptorFn])),
        provideHttpClientTesting(),
        MockProvider(LoadingService, mockLoadingService),
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add and remove loading state on success', () => {
    const url = '/mockendpoint';

    httpClient.get(url).subscribe({ next: vi.fn(), error: vi.fn() });

    expect(mockLoadingService.add).toHaveBeenCalledTimes(1);

    const req = httpTestingController.expectOne(url);
    req.flush({ data: { foo: 'bar' } });

    expect(mockLoadingService.remove).toHaveBeenCalledTimes(1);
  });

  it('should add and remove loading state on error', () => {
    const url = '/mockendpoint';

    httpClient.get(url).subscribe({ next: vi.fn(), error: vi.fn() });

    expect(mockLoadingService.add).toHaveBeenCalledTimes(2);

    const req = httpTestingController.expectOne(url);
    req.error(new ProgressEvent('error'), {
      status: 404,
      statusText: 'Not Found',
      headers: new HttpHeaders().set('content-type', 'application/json'),
    });

    expect(mockLoadingService.remove).toHaveBeenCalledTimes(2);
  });
});
