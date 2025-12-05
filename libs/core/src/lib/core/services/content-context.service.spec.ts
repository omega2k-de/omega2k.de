import { TestBed } from '@angular/core/testing';
import { ContentContextService, ContentHeading } from './content-context.service';
import type { PageRecordInterface } from '../interfaces/api.interface';

describe('ContentContextService', () => {
  let service: ContentContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentContextService],
    });
    service = TestBed.inject(ContentContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose null page and empty headings by default', () => {
    expect(service.page()).toBeNull();
    expect(service.headings()).toEqual([]);
  });

  it('should store page and headings when setPage is called', () => {
    const page: PageRecordInterface = {
      slug: 'test-slug',
    } as PageRecordInterface;

    const headings: ContentHeading[] = [
      { id: 'h2-intro', text: 'Einleitung', level: 2 },
      { id: 'h3-detail', text: 'Detail', level: 3 },
    ];

    service.setPage(page, headings);

    expect(service.page()).toBe(page);
    expect(service.headings()).toEqual(headings);
  });

  it('should reset page and headings when setPage is called with null', () => {
    const page: PageRecordInterface = {
      slug: 'initial',
    } as PageRecordInterface;

    const headings: ContentHeading[] = [{ id: 'h2-initial', text: 'Initial', level: 2 }];

    service.setPage(page, headings);

    expect(service.page()).toBe(page);
    expect(service.headings()).toEqual(headings);

    service.setPage(null, []);

    expect(service.page()).toBeNull();
    expect(service.headings()).toEqual([]);
  });
});
