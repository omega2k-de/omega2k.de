import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlsOutlet } from './controls.outlet';
import { MockProviders } from 'ng-mocks';
import { PlatformService, PrefetchService } from '@o2k/core';

describe('ControlsOutlet', () => {
  let component: ControlsOutlet;
  let fixture: ComponentFixture<ControlsOutlet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsOutlet],
      providers: [MockProviders(PlatformService, PrefetchService)],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlsOutlet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
