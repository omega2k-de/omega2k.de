import { DOCUMENT } from '@angular/common';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TelemetryService } from '.';
import { WebsocketWorker } from '..';
import { WINDOW } from '../../tokens';
import { TELEMETRY_FPS, WEBSOCKET_WORKER } from '../tokens';

class MockTouch implements Touch {
  readonly clientX: number;
  readonly clientY: number;
  readonly force: number;
  readonly identifier: number;
  readonly pageX: number;
  readonly pageY: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly rotationAngle: number;
  readonly screenX: number;
  readonly screenY: number;
  readonly target: EventTarget;

  constructor({
    clientX,
    clientY,
    force,
    identifier,
    pageX,
    pageY,
    radiusX,
    radiusY,
    rotationAngle,
    screenX,
    screenY,
    target,
  }: Touch) {
    this.clientX = clientX;
    this.clientY = clientY;
    this.force = force;
    this.identifier = identifier;
    this.pageX = pageX;
    this.pageY = pageY;
    this.radiusX = radiusX;
    this.radiusY = radiusY;
    this.rotationAngle = rotationAngle;
    this.screenX = screenX;
    this.screenY = screenY;
    this.target = target;
  }
}

describe('TelemetryService', () => {
  let service: TelemetryService;
  let worker: WebsocketWorker;
  let window: Window | undefined;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TELEMETRY_FPS,
          useValue: 1000,
        },
      ],
    });
    worker = TestBed.inject(WEBSOCKET_WORKER);
    document = TestBed.inject(DOCUMENT);
    window = TestBed.inject(WINDOW);
    service = TestBed.inject(TelemetryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isRunning()).toStrictEqual(false);
  });

  it('#start should set running to true', () => {
    const spy = vi.spyOn(worker, 'postMessage');
    service.start();
    expect(service.isRunning()).toStrictEqual(true);
    expect(spy).toHaveBeenCalledWith({
      command: 'pointer-start',
      message: 'TelemetryService.start',
    });
  });

  it('#toggle should toggle running state', () => {
    service.toggle();
    expect(service.isRunning()).toStrictEqual(true);
    service.toggle();
    expect(service.isRunning()).toStrictEqual(false);
  });

  it('#stop should set running to false', () => {
    service.start();

    const spy = vi.spyOn(worker, 'postMessage');
    service.stop();
    expect(service.isRunning()).toStrictEqual(false);
    expect(spy).toHaveBeenCalledWith({
      command: 'pointer-stop',
      message: 'TelemetryService.stop',
    });
  });

  describe('#listenMouseEvents should call handleMouseEvent', () => {
    interface EventName {
      eventName: string;
      tickMs: number;
      expectCall: boolean;
    }

    const data: EventName[] = [
      {
        eventName: 'mousedown',
        tickMs: 0,
        expectCall: true,
      },
      {
        eventName: 'mouseup',
        tickMs: 0,
        expectCall: true,
      },
      {
        eventName: 'mousemove',
        tickMs: 0,
        expectCall: false,
      },
      {
        eventName: 'mousemove',
        tickMs: 1,
        expectCall: true,
      },
    ];

    function getMouseEventData(event: MouseEvent) {
      return {
        altKey: event.altKey,
        button: event.button,
        buttons: event.buttons,
        clientX: event.clientX,
        clientY: event.clientY,
        ctrlKey: event.ctrlKey,
        layerX: event.layerX,
        layerY: event.layerY,
        metaKey: event.metaKey,
        movementX: event.movementX,
        movementY: event.movementY,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        pageX: event.pageX,
        pageY: event.pageY,
        screenX: event.screenX,
        screenY: event.screenY,
        shiftKey: event.shiftKey,
        x: event.x,
        y: event.y,
        timeStamp: event.timeStamp,
        type: event.type,
        innerHeight: window?.innerHeight ?? 0,
        innerWidth: window?.innerWidth ?? 0,
      };
    }

    it.each(data)(
      '$eventName',
      fakeAsync(({ eventName, tickMs, expectCall }: EventName) => {
        service.start();

        const spy = vi.spyOn(worker, 'postMessage');
        const event = new MouseEvent(eventName, { bubbles: true });
        const data = getMouseEventData(event);

        document.dispatchEvent(event);
        tick(tickMs);
        if (expectCall) {
          expect(spy).toHaveBeenCalledWith({
            command: 'mouse',
            data,
            message: 'TelemetryService.handleMouse',
          });
        } else {
          expect(spy).not.toHaveBeenCalledWith({
            command: 'mouse',
            data,
            message: 'TelemetryService.handleMouse',
          });
        }
      })
    );
  });

  describe('#listenTouchEvents should call handleTouchEvent', () => {
    interface EventName {
      eventName: string;
      tickMs: number;
      expectCall: boolean;
    }

    const data: EventName[] = [
      {
        eventName: 'touchstart',
        tickMs: 0,
        expectCall: true,
      },
      {
        eventName: 'touchend',
        tickMs: 0,
        expectCall: true,
      },
      {
        eventName: 'touchmove',
        tickMs: 0,
        expectCall: false,
      },
      {
        eventName: 'touchmove',
        tickMs: 1,
        expectCall: true,
      },
    ];

    function getTouchEventData(event: TouchEvent) {
      return {
        altKey: event.altKey,
        changedTouches: [
          {
            clientX: 123,
            clientY: 321,
            force: 0.5,
            identifier: 42,
            pageX: 0,
            pageY: 0,
            radiusX: 2.5,
            radiusY: 2.5,
            rotationAngle: 10,
            screenX: 0,
            screenY: 0,
          },
        ],
        ctrlKey: event.ctrlKey,
        detail: event.detail,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        targetTouches: [],
        timeStamp: event.timeStamp,
        touches: [
          {
            clientX: 123,
            clientY: 321,
            force: 0.5,
            identifier: 42,
            pageX: 0,
            pageY: 0,
            radiusX: 2.5,
            radiusY: 2.5,
            rotationAngle: 10,
            screenX: 0,
            screenY: 0,
          },
        ],
        type: event.type,
        innerHeight: window?.innerHeight ?? 0,
        innerWidth: window?.innerWidth ?? 0,
      };
    }

    it.each(data)(
      '$eventName',
      fakeAsync(({ eventName, tickMs, expectCall }: EventName) => {
        service.start();

        const spy = vi.spyOn(worker, 'postMessage');
        const touch = new MockTouch({
          pageX: 0,
          pageY: 0,
          screenX: 0,
          screenY: 0,
          identifier: 42,
          target: new EventTarget(),
          clientX: 123,
          clientY: 321,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5,
        });
        const event = new TouchEvent(eventName, {
          bubbles: true,
          touches: [touch],
          changedTouches: [touch],
          targetTouches: [],
        });
        const data = getTouchEventData(event);

        document.dispatchEvent(event);
        tick(tickMs);
        if (expectCall) {
          expect(spy).toHaveBeenCalledWith({
            command: 'touch',
            data,
            message: 'TelemetryService.handleTouch',
          });
        } else {
          expect(spy).not.toHaveBeenCalledWith({
            command: 'touch',
            data,
            message: 'TelemetryService.handleTouch',
          });
        }
      })
    );
  });
});
