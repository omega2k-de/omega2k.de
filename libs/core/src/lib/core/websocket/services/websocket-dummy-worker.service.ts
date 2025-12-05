import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { type StatusMessage, WebsocketWorker, WsMessage, WsMessages } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class WebsocketDummyWorkerService implements WebsocketWorker {
  readonly messageSubject: BehaviorSubject<WsMessages> = new BehaviorSubject<WsMessages>(<
    StatusMessage
  >{
    ...this.requiredFields,
    event: 'status',
  });

  burstPing(): void {
    // noop
  }

  close(): void {
    // noop
  }

  closeSocket(): void {
    // noop
  }

  readonly message$: Observable<WsMessages> = this.messageSubject.asObservable();

  open(): void {
    // noop
  }

  openSocket(): void {
    // noop
  }

  ping(): void {
    // noop
  }

  postMessage(): void {
    // noop
  }

  get requiredFields(): Pick<WsMessage, 'uuid' | 'created' | 'author'> {
    return {
      uuid: this.uuid,
      created: 0,
    };
  }

  get uuid(): string {
    return '';
  }

  version(): void {
    // noop
  }
}
