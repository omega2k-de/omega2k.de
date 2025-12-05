import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LikeButtonComponent } from './like-button.component';
import { MockProvider } from 'ng-mocks';
import { LikesService, LikeState } from '@o2k/core';
import { of } from 'rxjs';

describe('LikeButtonComponent', () => {
  let component: LikeButtonComponent;
  let fixture: ComponentFixture<LikeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikeButtonComponent],
      providers: [
        MockProvider(LikesService, {
          getState: vi.fn().mockReturnValue(
            of<LikeState>({
              articleId: 42,
              count: 1337,
              liked: false,
            })
          ),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LikeButtonComponent);
    fixture.componentRef.setInput('articleId', 42);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
