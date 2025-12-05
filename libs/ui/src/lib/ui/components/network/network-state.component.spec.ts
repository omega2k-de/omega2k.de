import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkService, WEBSOCKET_WORKER, WebsocketWorker, WsMessages } from '@o2k/core';
import { MockDirectives, MockProvider } from 'ng-mocks';
import { Subject } from 'rxjs';
import { NetworkStateComponent } from './network-state.component';
import { IconDirective, VibrateDirective } from '../../directives';
import { vi } from 'vitest';

describe('NetworkStateComponent', () => {
  let component: NetworkStateComponent;
  let fixture: ComponentFixture<NetworkStateComponent>;
  const messageSubject = new Subject<WsMessages>();
  const WebSocketMock: Partial<WebsocketWorker> = {
    burstPing: vi.fn(),
    message$: messageSubject.asObservable(),
  };

  const onlineState = new Subject<boolean>();
  const NetworkServiceMock: Partial<NetworkService> = {
    isOnline$: onlineState.asObservable(),
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [NetworkStateComponent, MockDirectives(VibrateDirective, IconDirective)],
      providers: [
        MockProvider(NetworkService, NetworkServiceMock),
        MockProvider(WEBSOCKET_WORKER, WebSocketMock),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkStateComponent);
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
    onlineState.next(true);

    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();

    expect(WebSocketMock.burstPing).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(2010);
    expect(WebSocketMock.burstPing).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(4001);
    expect(WebSocketMock.burstPing).toHaveBeenCalledTimes(1);
  });

  it('#ngOnDestroy should not trigger ping', () => {
    onlineState.next(true);

    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.debounceTimePing();
    component.ngOnDestroy();

    expect(WebSocketMock.burstPing).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(2001);
    expect(WebSocketMock.burstPing).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(4001);
    expect(WebSocketMock.burstPing).toHaveBeenCalledTimes(0);
  });

  it('#ngOnDestroy should not trigger ping', () => {
    onlineState.next(false);

    component.debounceTimePing();

    expect(WebSocketMock.burstPing).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(2001);
    expect(WebSocketMock.burstPing).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(4001);
    expect(WebSocketMock.burstPing).toHaveBeenCalledTimes(0);
  });
});
