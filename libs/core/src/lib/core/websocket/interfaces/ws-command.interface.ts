import type { WsMouseEvent } from './ws-mouse-event.interface';
import type { WsTouchEvent } from './ws-touch-event.interface';
import { WsAuthorInterface } from './ws-author.interface';
import { UpdateStatus } from '../../interfaces';

export type WsCommands =
  | WsOpenCommand
  | WsCloseCommand
  | ChatCommand
  | VersionCommand
  | PingCommand
  | MeCommand
  | UpdateMeCommand
  | BurstPingCommand
  | MetricsCommand
  | MouseCommand
  | TouchCommand
  | ReadyStateCommand
  | PointerStateCommand;

export interface WsCommand {
  uuid: string;
  command: string;
  created: number;
  author?: WsAuthorInterface;
  message?: string;
}

export interface WsOpenCommand extends WsCommand {
  command: 'open-socket';
  url?: string | null;
}

export interface WsCloseCommand extends WsCommand {
  command: 'close-socket';
}

export interface MetricsCommand extends WsCommand {
  command: 'metrics';
}

export interface ChatCommand extends WsCommand {
  command: 'chat';
  message: string;
}

export interface PingCommand extends WsCommand {
  command: 'ping';
}

export interface ReadyStateCommand extends WsCommand {
  command: 'readyState';
}

export interface MeCommand extends WsCommand {
  command: 'me';
}

export interface UpdateMeCommand extends WsCommand {
  command: 'updateMe';
  data: {
    username: WsAuthorInterface['name'];
  };
}

export interface VersionCommand extends WsCommand {
  command: 'version';
  current?: UpdateStatus;
}

export interface MouseCommand extends WsCommand {
  command: 'mouse';
  data: WsMouseEvent;
}

export interface TouchCommand extends WsCommand {
  command: 'touch';
  data: WsTouchEvent;
}

export interface PointerStateCommand extends WsCommand {
  command: 'pointer-start' | 'pointer-stop';
}

export interface BurstPingCommand extends WsCommand {
  command: 'burst-ping-pong';
  countdown: number;
  start?: number;
  started?: number;
  completed?: number;
}
