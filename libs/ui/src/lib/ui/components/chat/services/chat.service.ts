import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, filter, map } from 'rxjs';
import {
  ChatMessage,
  LocalStorageService,
  WEBSOCKET_WORKER,
  WebsocketWorker,
  WsAuthorInterface,
} from '@o2k/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ChatMessageEntryInterface, MeEntityInterface } from '../interfaces';
import dayjs from 'dayjs';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly storageKey = 'o2k.chat.user';
  private readonly maxBuffer = 1000;

  private readonly messages: ChatMessageEntryInterface[] = [];
  private readonly messagesSubject = new BehaviorSubject<ChatMessageEntryInterface[]>([]);

  private storage = inject(LocalStorageService);
  private worker: WebsocketWorker = inject(WEBSOCKET_WORKER);

  readonly me = signal<MeEntityInterface | null>(null);
  readonly messages$ = this.messagesSubject.asObservable().pipe(untilDestroyed(this));
  readonly unread$ = this.messages$.pipe(map(messages => messages.length));

  constructor() {
    this.listenMessages();
    this.listenUserUpdates();
    this.updateMeFromStore();
  }

  sendMessage(message: string) {
    this.worker.postMessage({ command: 'chat', message });
  }

  updateServerUser(user: Partial<WsAuthorInterface>) {
    this.worker.postMessage({ command: 'updateMe', data: { username: user.name } });
  }

  private listenMessages() {
    this.worker.message$
      .pipe(
        filter(message => message.event === 'chat'),
        untilDestroyed(this)
      )
      .subscribe(message => this.publish(message));
  }

  private listenUserUpdates() {
    this.worker.message$
      .pipe(
        filter(message => message.event === 'me'),
        untilDestroyed(this)
      )
      .subscribe(me => this.updateLocalUsername(me.data.user));
  }

  private updateLocalUsername(user: Partial<WsAuthorInterface>) {
    const current: MeEntityInterface | null = this.me();
    if (!user.uuid) {
      return;
    }

    const me: MeEntityInterface = {
      user: current?.user
        ? current.user
        : ({
            uuid: user.uuid,
            name: null,
          } as WsAuthorInterface),
    };

    if (this.userChanged(me, user)) {
      me.user.uuid = user.uuid;
      me.user.name = user.name;
    }

    this.updateMe(me);
  }

  private userChanged(me: MeEntityInterface, user: Partial<WsAuthorInterface>) {
    return me.user.uuid !== user.uuid || me.user.name !== user.name;
  }

  private updateMe(me: MeEntityInterface) {
    this.me.set(me);
    this.storage.save(this.storageKey, JSON.stringify(me.user));
  }

  private updateMeFromStore() {
    const user: WsAuthorInterface | null = this.getUserFromStore();
    if (user) {
      this.me.set({ user: user });
      this.updateServerUser(user);
    } else {
      this.worker.postMessage({ command: 'me' });
    }
  }

  private getUserFromStore(): WsAuthorInterface | null {
    try {
      return JSON.parse(this.storage.get(this.storageKey) ?? 'null');
    } catch (_) {
      return null;
    }
  }

  private publish(message: ChatMessage) {
    const entry: ChatMessageEntryInterface = {
      uuid: message.uuid,
      created: dayjs.unix(message.created / 1000),
      direction: message.author?.uuid === this.me()?.user.uuid ? 'send' : 'receive',
      author: message.author,
      message: message.message,
    };
    this.messages.push(entry);
    const overhead = this.messages.length - this.maxBuffer;
    if (overhead > 0) {
      this.messages.splice(0, overhead);
    }
    this.messagesSubject.next([...this.messages]);
  }
}
