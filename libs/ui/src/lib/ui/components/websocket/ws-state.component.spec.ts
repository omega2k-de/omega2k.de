import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WsStateComponent } from './ws-state.component';
import { WEBSOCKET_WORKER, WsMessages } from '@o2k/core';
import { MockDirectives, MockProvider } from 'ng-mocks';
import { Subject } from 'rxjs';
import { AutoIdDirective, IconDirective, VibrateDirective } from '../../directives';
import { vi } from 'vitest';

describe('WsStateComponent', () => {
  let component: WsStateComponent;
  let fixture: ComponentFixture<WsStateComponent>;
  const messageSubject = new Subject<WsMessages>();
  const postMessageSpy = vi.fn();
  const burstPingSpy = vi.fn();

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [WsStateComponent, MockDirectives(VibrateDirective, IconDirective, AutoIdDirective)],
      providers: [
        MockProvider(WEBSOCKET_WORKER, {
          message$: messageSubject.asObservable(),
          postMessage: postMessageSpy,
          burstPing: burstPingSpy,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WsStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#debounceTimePing should only trigger once', () => {
    component['state'].set('network_node');
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();

    expect(burstPingSpy).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(2010);
    expect(burstPingSpy).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(4001);
    expect(burstPingSpy).toHaveBeenCalledTimes(1);
  });

  it('#ngOnDestroy should not trigger ping', () => {
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.ngOnDestroy();

    expect(burstPingSpy).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(2001);
    expect(burstPingSpy).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(4001);
    expect(burstPingSpy).toHaveBeenCalledTimes(0);
  });

  it('#ngOnDestroy should not trigger ping', () => {
    component.debounceTimePing();

    expect(burstPingSpy).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(2001);
    expect(burstPingSpy).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(4001);
    expect(burstPingSpy).toHaveBeenCalledTimes(0);
  });
});
