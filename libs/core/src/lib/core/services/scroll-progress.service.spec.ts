import { TestBed } from '@angular/core/testing';

import { ScrollProgressService } from './scroll-progress.service';

describe('ScrollProgressService', () => {
  let service: ScrollProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
