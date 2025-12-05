import type { WsHasUuidInterface } from './ws-has-uuid.interface';
import type { WsMouseEvent } from './ws-mouse-event.interface';
import type { WsTouchEvent } from './ws-touch-event.interface';

export interface WsClientPointerInterface extends WsHasUuidInterface {
  uuid: string;
  user: WsHasUuidInterface;
  pointer?: WsMouseEvent;
  touch?: WsTouchEvent;
}
