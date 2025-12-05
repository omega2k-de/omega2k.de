import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { EntropyDropdownComponent } from '.';

describe('EntropyDropdownComponent', () => {
  let component: EntropyDropdownComponent;
  let fixture: ComponentFixture<EntropyDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntropyDropdownComponent],
      providers: [provideConfig({ logger: 'OFF' })],
    }).compileComponents();

    fixture = TestBed.createComponent(EntropyDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
