import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal, type Signal, type WritableSignal } from '@angular/core';
import { fromEvent, sampleTime, Subject, takeUntil } from 'rxjs';
import { WINDOW } from '../../tokens';
import type { WebsocketWorker, WsMouseEvent, WsTouch, WsTouchEvent } from '../interfaces';
import { TELEMETRY_FPS, WEBSOCKET_WORKER } from '../tokens';

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  protected fps = inject(TELEMETRY_FPS);
  protected stopped = new Subject<void>();
  protected running: WritableSignal<boolean> = signal<boolean>(false);
  protected worker: WebsocketWorker = inject(WEBSOCKET_WORKER);
  protected document: Document = inject(DOCUMENT);
  protected readonly window?: Window = inject(WINDOW);
  readonly isRunning: Signal<boolean> = this.running.asReadonly();

  start() {
    if (!this.running()) {
      this.running.set(true);
      this.worker.postMessage({
        command: 'pointer-start',
        message: 'TelemetryService.start',
      });
      this.stopped.next();
      this.listenTouchEvents();
      this.listenMouseEvents();
    }
  }

  stop() {
    if (this.running()) {
      this.running.set(false);
      this.worker.postMessage({
        command: 'pointer-stop',
        message: 'TelemetryService.stop',
      });
      this.stopped.next();
    }
  }

  toggle() {
    if (this.running()) {
      this.stop();
    } else {
      this.start();
    }
  }

  private handleMouseEvent(event: MouseEvent) {
    const data: WsMouseEvent = {
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
      innerHeight: this.window?.innerHeight ?? 0,
      innerWidth: this.window?.innerWidth ?? 0,
    };
    this.worker.postMessage({
      command: 'mouse',
      data,
      message: 'TelemetryService.handleMouse',
    });
  }

  private transformTouchListToArray(list: TouchList): WsTouch[] {
    return Array<WsTouch>(list.length)
      .fill(null)
      .map((_, i) => {
        const touch = list[i];
        return touch
          ? {
              clientX: touch.clientX,
              clientY: touch.clientY,
              force: touch.force,
              identifier: touch.identifier,
              pageX: touch.pageX,
              pageY: touch.pageY,
              radiusX: touch.radiusX,
              radiusY: touch.radiusY,
              rotationAngle: touch.rotationAngle,
              screenX: touch.screenX,
              screenY: touch.screenY,
            }
          : null;
      });
  }

  private handleTouchEvent(event: TouchEvent) {
    const data: WsTouchEvent = {
      altKey: event.altKey,
      changedTouches: this.transformTouchListToArray(event.changedTouches),
      ctrlKey: event.ctrlKey,
      detail: event.detail,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      targetTouches: this.transformTouchListToArray(event.targetTouches),
      timeStamp: event.timeStamp,
      touches: this.transformTouchListToArray(event.touches),
      type: event.type,
      innerHeight: this.window?.innerHeight ?? 0,
      innerWidth: this.window?.innerWidth ?? 0,
    };
    this.worker.postMessage({
      command: 'touch',
      data,
      message: 'TelemetryService.handleTouch',
    });
  }

  private listenMouseEvents() {
    fromEvent<MouseEvent>(this.document, 'mousedown')
      .pipe(takeUntil(this.stopped.asObservable()))
      .subscribe(event => this.handleMouseEvent(event));
    fromEvent<MouseEvent>(this.document, 'mousemove')
      .pipe(sampleTime(1000 / this.fps), takeUntil(this.stopped.asObservable()))
      .subscribe(event => this.handleMouseEvent(event));
    fromEvent<MouseEvent>(this.document, 'mouseup')
      .pipe(takeUntil(this.stopped.asObservable()))
      .subscribe(event => this.handleMouseEvent(event));
  }

  private listenTouchEvents() {
    fromEvent<TouchEvent>(this.document, 'touchstart')
      .pipe(takeUntil(this.stopped.asObservable()))
      .subscribe(event => this.handleTouchEvent(event));
    fromEvent<TouchEvent>(this.document, 'touchmove')
      .pipe(sampleTime(1000 / this.fps), takeUntil(this.stopped.asObservable()))
      .subscribe(event => this.handleTouchEvent(event));
    fromEvent<TouchEvent>(this.document, 'touchend')
      .pipe(takeUntil(this.stopped.asObservable()))
      .subscribe(event => this.handleTouchEvent(event));
  }
}
