import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VersionComponent } from './version.component';
import { provideConfig } from '@o2k/core';

describe('VersionComponent', () => {
  let component: VersionComponent;
  let fixture: ComponentFixture<VersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VersionComponent],
      providers: [provideConfig({ logger: 'OFF' })],
    }).compileComponents();

    fixture = TestBed.createComponent(VersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
