import { TestBed } from '@angular/core/testing';

import { PrefetchService } from './prefetch.service';
import { MockProviders } from 'ng-mocks';
import { ContentService } from './content.service';
import { CardsService } from './cards.service';
import { LikesService } from './likes.service';
import { of } from 'rxjs';

describe('PrefetchService', () => {
  let service: PrefetchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProviders(ContentService, CardsService, LikesService)],
    });
    service = TestBed.inject(PrefetchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#prefetchAll should call api', () => {
    const loadCardsSpy = vi.spyOn(service['cards'], 'loadAll').mockReturnValueOnce(of([]));

    service.prefetchAll();

    expect(loadCardsSpy).toHaveBeenCalledOnce();
  });
});
