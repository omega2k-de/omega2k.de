import { TestBed } from '@angular/core/testing';
import { ORIGIN } from './origin.injection-token';
import { REQUEST } from '@angular/core';
import { WINDOW } from './window.injection-token';
import { provideConfig } from '../tokens';

describe('ORIGIN token', () => {
  it('provides config url if no request or window.location', () => {
    TestBed.configureTestingModule({
      providers: [
        provideConfig({ logger: 'OFF', url: 'http://config.url:12345' }),
        {
          provide: REQUEST,
          useValue: {
            url: undefined,
          },
        },
        {
          provide: WINDOW,
          useValue: {
            location: {
              origin: undefined,
            },
          },
        },
      ],
    });
    const o = TestBed.inject(ORIGIN);
    expect(o).toStrictEqual('http://config.url:12345');
  });

  it('provides origin from request url if possible', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: REQUEST,
          useValue: {
            url: 'http://localhost:3000/some/ignored/path?and=query',
          },
        },
        {
          provide: WINDOW,
          useValue: {
            location: {
              origin: undefined,
            },
          },
        },
      ],
    });
    const w = TestBed.inject(ORIGIN);
    expect(w).toStrictEqual('http://localhost:3000');
  });

  it('provides origin from window.location if no request', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: REQUEST,
          useValue: undefined,
        },
        {
          provide: WINDOW,
          useValue: {
            location: {
              origin: 'http://window.origin',
            },
          },
        },
      ],
    });
    const w = TestBed.inject(ORIGIN);
    expect(w).toStrictEqual('http://window.origin');
  });
});
