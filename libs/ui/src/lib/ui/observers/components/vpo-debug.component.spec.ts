import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { MockDirectives } from 'ng-mocks';
import { IconDirective } from '../../directives/icon.directive';
import { VpoDebugComponent } from './vpo-debug.component';

describe('VpoDebugComponent', () => {
  let component: VpoDebugComponent;
  let fixture: ComponentFixture<VpoDebugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VpoDebugComponent, MockDirectives(IconDirective)],
      providers: [provideConfig({ logger: 'OFF' })],
    }).compileComponents();

    fixture = TestBed.createComponent(VpoDebugComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('key', 'key-string');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
