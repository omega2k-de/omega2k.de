import { TestBed } from '@angular/core/testing';
import { ReadingProgressStorage } from './reading-progress.storage';
import { MockProvider } from 'ng-mocks';
import { LocalStorageService, PlatformService } from '../services';

describe('ReadingProgressStorage', () => {
  let service: ReadingProgressStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(PlatformService), MockProvider(LocalStorageService)],
    });
    service = TestBed.inject(ReadingProgressStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
