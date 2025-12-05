import { HealthStatus, UpdateStatus } from '../../interfaces';
import type { WsCommands } from './ws-command.interface';
import { BurstPingCommand } from './ws-command.interface';
import { WsAuthorInterface } from './ws-author.interface';
import { WsClientInterface } from './ws-client.interface';
import type { WsClientPointerInterface } from './ws-client-pointer.interface';
import { WsHasUuidInterface } from './ws-has-uuid.interface';

export type ReadyStateMessages =
  | ReadyStateMessage
  | OpenMessage
  | CloseMessage
  | ErrorMessage
  | ReconnectMessage;

export type WsMessages =
  | OpenMessage
  | CloseMessage
  | ErrorMessage
  | ReconnectMessage
  | ChatMessage
  | BurstPingResultMessage
  | MetricsMessage
  | MeMessage
  | ClientsMessage
  | InvalidCommandMessage
  | SystemMessage
  | StatusMessage
  | HealthMessage
  | HeartbeatMessage
  | UpdateMessage
  | PongMessage
  | BurstPingMessage
  | ReadyStateMessage
  | IsPausedMessage
  | PausedMessage
  | ResumeMessage
  | PointerMessage;

export interface WsMessage extends WsHasUuidInterface {
  message?: string;
  created: number;
  author?: WsAuthorInterface;
}

export interface OpenMessage extends WsMessage {
  event: 'open';
  state: WebSocket['readyState'];
  url: string;
}

export interface ErrorMessage extends WsMessage {
  event: 'error';
  state: WebSocket['readyState'];
  message: string;
}

export interface ReconnectMessage extends WsMessage {
  event: 'reconnect';
  state: WebSocket['readyState'];
  disabled: boolean;
  retry: number;
  retries: number;
  interval: number;
}

export interface CloseMessage extends WsMessage {
  event: 'close';
  state: WebSocket['readyState'];
  code: number;
  reason: string;
  wasClean: boolean;
}

export interface ReadyStateMessage extends WsMessage {
  event: 'readyState';
  state: WebSocket['readyState'];
}

export interface IsPausedMessage extends WsMessage {
  event: 'isPaused';
  state?: boolean;
}

export interface PausedMessage extends WsMessage {
  event: 'pause';
  state?: boolean;
}

export interface ResumeMessage extends WsMessage {
  event: 'resume';
  state?: boolean;
}

export interface BurstPingMessage extends WsMessage {
  event: 'burst-ping-pong';
  countdown: number;
}

export interface ChatMessage extends WsMessage {
  event: 'chat';
  message: string;
  author: WsAuthorInterface;
  meta?: {
    original: BurstPingCommand;
    duration: number;
  };
}

export interface BurstPingResultMessage extends WsMessage {
  event: 'burst-ping-result';
  message: string;
  original: BurstPingCommand;
  duration: number;
  perSecond: number;
  avgMs: number;
}

export interface SystemMessage extends WsMessage {
  event: 'system';
}

export interface StatusMessage extends WsMessage {
  event: 'status';
}

export interface HealthMessage extends WsMessage {
  event: 'health';
  health: HealthStatus;
}

export interface HeartbeatMessage extends WsMessage {
  event: 'heartbeat';
  interval: number;
  health: HealthStatus;
}

export interface UpdateMessage extends WsMessage {
  event: 'update';
  update?: boolean;
  current: UpdateStatus;
}

export interface MeMessage extends WsMessage {
  event: 'me';
  data: WsClientInterface;
}

export interface ClientsMessage extends WsMessage {
  event: 'clients';
  count: number;
}

export interface PointerMessage extends WsMessage {
  event: 'pointer';
  pointers: WsClientPointerInterface[];
}

export interface InvalidCommandMessage extends WsMessage {
  event: 'invalid-command';
  original?: WsCommands;
}

export interface PongMessage extends WsMessage {
  event: 'pong';
  rtt?: number;
}

export interface MetricsMessage extends WsMessage {
  event: 'metrics';
  clients: WsClientInterface[];
}
