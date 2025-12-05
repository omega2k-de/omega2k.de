export interface WsTouchInterface {
  clientX: number;
  clientY: number;
  force: number;
  identifier: number;
  pageX: number;
  pageY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  screenX: number;
  screenY: number;
}

export type WsTouch = WsTouchInterface | null;

export interface WsTouchEvent {
  altKey: boolean;
  changedTouches: WsTouch[];
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  targetTouches: WsTouch[];
  touches: WsTouch[];
  detail: number;
  timeStamp: DOMHighResTimeStamp;
  type: string;
  innerHeight: number;
  innerWidth: number;
}
