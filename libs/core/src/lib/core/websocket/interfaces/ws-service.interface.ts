import { Observable } from 'rxjs';
import { ConfigInterface } from '../../interfaces/config.interface';
import { WsCommands } from './ws-command.interface';
import { WsMessage, WsMessages } from './ws-message.interface';

export interface WebsocketWorker {
  readonly message$: Observable<WsMessages>;

  open(url?: ConfigInterface['socket']): void;

  close(): void;

  postMessage(message: Partial<WsCommands>): void;

  burstPing(countdown?: number): void;

  ping(): void;

  version(): void;

  openSocket(): void;

  closeSocket(): void;

  get uuid(): string;

  get requiredFields(): Pick<WsMessage, 'uuid' | 'created' | 'author'>;
}
