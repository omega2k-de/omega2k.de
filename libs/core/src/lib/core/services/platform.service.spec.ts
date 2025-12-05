import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlatformService } from '.';

describe('PlatformService', () => {
  it('should be valid browser', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PLATFORM_ID,
          useValue: 'browser',
        },
      ],
    });
    const service = TestBed.inject(PlatformService);
    expect(service.platformId).toStrictEqual('browser');
    expect(service.isBrowser).toBeTruthy();
    expect(service.isServer).toBeFalsy();
  });

  it('should be valid server', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PLATFORM_ID,
          useValue: 'server',
        },
      ],
    });
    const service = TestBed.inject(PlatformService);
    expect(service.platformId).toStrictEqual('server');
    expect(service.isBrowser).toBeFalsy();
    expect(service.isServer).toBeTruthy();
  });
});
