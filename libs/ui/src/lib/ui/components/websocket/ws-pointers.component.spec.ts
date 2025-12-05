import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WEBSOCKET_WORKER } from '@o2k/core';
import { MockDirectives } from 'ng-mocks';
import { of } from 'rxjs';
import { IconDirective } from '../../directives/icon.directive';
import { WsPointersComponent } from './ws-pointers.component';

describe('WsPointersComponent', () => {
  let component: WsPointersComponent;
  let fixture: ComponentFixture<WsPointersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WsPointersComponent, MockDirectives(IconDirective)],
      providers: [
        {
          provide: WEBSOCKET_WORKER,
          useValue: {
            message$: of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WsPointersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
