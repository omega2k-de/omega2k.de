import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { LikeButtonComponent } from './like-button.component';
import { MockProvider } from 'ng-mocks';
import { LikesService, LikeState } from '@o2k/core';
import { of } from 'rxjs';

describe('LikeButtonComponent', () => {
  let component: LikeButtonComponent;
  let fixture: ComponentFixture<LikeButtonComponent>;
  let likesService: LikesService;

  beforeEach(async () => {
    const getStateMock = vi.fn().mockReturnValue(
      of<LikeState>({
        articleId: 42,
        count: 1337,
        liked: false,
      })
    );

    await TestBed.configureTestingModule({
      imports: [LikeButtonComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        MockProvider(LikesService, {
          getState: getStateMock,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LikeButtonComponent);
    likesService = TestBed.inject(LikesService);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('articleId', 42);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('refreshes state on init in browser even when SSR provided state', fakeAsync(() => {
    const freshState: LikeState = { articleId: 7, count: 5, liked: true };
    (likesService.getState as unknown as vi.Mock).mockReturnValue(of(freshState));

    fixture.componentRef.setInput('articleId', 7);
    fixture.componentRef.setInput('state', { articleId: 7, count: 0, liked: false });

    component.ngOnInit();
    tick();

    expect(likesService.getState).toHaveBeenCalledTimes(1);
    expect(likesService.getState).toHaveBeenCalledWith(7);
    expect(component.liked()).toBe(true);
    expect(component.count()).toBe(5);
  }));
});
