import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StructureOutlet } from './structure.outlet';
import { MockDirectives, MockProvider } from 'ng-mocks';
import { IconDirective } from '@o2k/ui';
import { ContentContextService, CoordinatorService } from '@o2k/core';
import { signal } from '@angular/core';

describe('StructureOutlet', () => {
  let component: StructureOutlet;
  let fixture: ComponentFixture<StructureOutlet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureOutlet, MockDirectives(IconDirective)],
      providers: [
        MockProvider(ContentContextService, { headings: signal([]) }),
        MockProvider(CoordinatorService, {
          toggleNotificationOverlay: vi.fn(),
          isNavigationOpen: signal<boolean>(false),
          isNotificationOpen: signal<boolean>(false),
          showBackdrop: signal<boolean>(false),
          isAsideOpen: signal<boolean>(false),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureOutlet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
