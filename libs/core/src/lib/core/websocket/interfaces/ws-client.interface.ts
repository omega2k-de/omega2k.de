import { WebSocket } from 'ws';
import { WsAuthorInterface } from './ws-author.interface';
import { WsHasUuidInterface } from './ws-has-uuid.interface';
import type { WsMouseEvent } from './ws-mouse-event.interface';
import type { WsTouchEvent } from './ws-touch-event.interface';

export interface WsClientFlags {
  hasPointer: boolean;
}

export interface WsClientInterface extends WsHasUuidInterface {
  created: number;
  seq: number;
  rtt?: number;
  socket: WebSocket;
  user: WsAuthorInterface;
  pointer?: WsMouseEvent;
  touch?: WsTouchEvent;
  flags: WsClientFlags;
}
