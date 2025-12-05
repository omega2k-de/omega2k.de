import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { LikesService } from './likes.service';
import { CONFIG, provideConfig } from '../tokens';
import { ConfigInterface, LikeState } from '../interfaces';

describe('LikesService', () => {
  let service: LikesService;
  let httpMock: HttpTestingController;
  let config: ConfigInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideConfig({ logger: 'OFF' }),
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(LikesService);
    httpMock = TestBed.inject(HttpTestingController);
    config = TestBed.inject(CONFIG);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request like state for a single article and return the response', () => {
    const articleId = 42;
    const mockState: LikeState = { articleId, count: 3, liked: true };
    let result: LikeState | undefined;

    service.getState(articleId).subscribe(state => {
      result = state;
    });

    const req = httpMock.expectOne(`${config.api}/likes/${articleId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTruthy();

    req.flush(mockState);

    expect(result).toEqual(mockState);
  });

  it('should return fallback state when getState request fails', () => {
    const articleId = 7;
    let result: LikeState | undefined;

    service.getState(articleId).subscribe(state => {
      result = state;
    });

    const req = httpMock.expectOne(`${config.api}/likes/${articleId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTruthy();

    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(result).toEqual({ articleId });
  });

  it('should request all like states and return the list', () => {
    const mockStates: LikeState[] = [
      { articleId: 1, count: 2, liked: false },
      { articleId: 2, count: 5, liked: true },
    ];
    let result: LikeState[] | undefined;

    service.getAllStates().subscribe(states => {
      result = states;
    });

    const req = httpMock.expectOne(`${config.api}/likes`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTruthy();

    req.flush(mockStates);

    expect(result).toEqual(mockStates);
  });

  it('should return empty list when getAllStates request fails', () => {
    let result: LikeState[] | undefined;

    service.getAllStates().subscribe(states => {
      result = states;
    });

    const req = httpMock.expectOne(`${config.api}/likes`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTruthy();

    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(result).toEqual([]);
  });

  it('should toggle like state and return the updated state', () => {
    const articleId = 99;
    const mockState: LikeState = { articleId, count: 10, liked: true };
    let result: LikeState | undefined;

    service.toggle(articleId).subscribe(state => {
      result = state;
    });

    const req = httpMock.expectOne(`${config.api}/likes/${articleId}/toggle`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTruthy();
    expect(req.request.body).toEqual({});

    req.flush(mockState);

    expect(result).toEqual(mockState);
  });

  it('should return fallback state when toggle request fails', () => {
    const articleId = 123;
    let result: LikeState | undefined;

    service.toggle(articleId).subscribe(state => {
      result = state;
    });

    const req = httpMock.expectOne(`${config.api}/likes/${articleId}/toggle`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTruthy();
    expect(req.request.body).toEqual({});

    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(result).toEqual({ articleId });
  });
});
