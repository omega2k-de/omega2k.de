import { TestBed } from '@angular/core/testing';
import { LongPressService } from '.';

describe('LongPressService', () => {
  let service: LongPressService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
    });
    service = TestBed.inject(LongPressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
