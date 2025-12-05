import { inject } from '@angular/core';
import { distinctUntilChanged, Observable, Subject, tap } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';
import { CONFIG } from '../../tokens';
import { LoggerService } from '../../logger';
import { WebsocketWorker, WsCommands, WsMessages } from '../interfaces';

export abstract class WebsocketWorkerAbstract implements WebsocketWorker {
  protected readonly _worker: SharedWorker | Worker | null = null;
  protected readonly broadcastChannel = new BroadcastChannel('WebSocketChannel');
  protected logger = inject(LoggerService);
  protected config = inject(CONFIG);
  protected messageSubject: Subject<WsMessages> = new Subject<WsMessages>();

  protected constructor() {
    this.broadcastChannel.addEventListener('message', this.transferMessages.bind(this));
  }

  protected _uuid: string = uuidV4().toString();

  burstPing(countdown = 100): void {
    this.postMessage({
      command: 'burst-ping-pong',
      countdown: countdown,
    });
  }

  abstract close(): void;

  closeSocket(): void {
    this.postMessage({
      command: 'close-socket',
    });
  }

  readonly message$: Observable<WsMessages> = this.messageSubject.asObservable().pipe(
    distinctUntilChanged((a, b) => a.uuid === b.uuid),
    tap(message => {
      if (message.event === 'me') {
        this._uuid = message.data.uuid;
      }
    })
  );

  open(url?: string | null): void {
    this.postMessage({ command: 'open-socket', url });
  }

  openSocket(): void {
    this.postMessage({
      command: 'open-socket',
      url: this.config.socket ?? 'wss://api.omega2k.de.o2k:42080',
    });
  }

  ping(): void {
    this.postMessage({ command: 'ping' });
  }

  abstract postMessage(message: Partial<WsCommands>): void;

  get requiredFields(): Pick<WsCommands, 'uuid' | 'created' | 'author'> {
    return {
      created: new Date().getTime(),
      uuid: uuidV4().toString(),
      author: { uuid: this.uuid },
    };
  }

  get uuid(): string {
    return this._uuid;
  }

  version(): void {
    this.postMessage({
      command: 'version',
      current: { version: this.config.version, hash: this.config.hash },
    });
  }

  private transferMessages(event: MessageEvent<WsMessages>) {
    if (event.data) {
      this.messageSubject.next(event.data);
    }
  }
}
