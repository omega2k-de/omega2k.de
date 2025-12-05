import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  type PointerMessage,
  WEBSOCKET_WORKER,
  WebsocketWorker,
  WINDOW,
  type WsClientPointerInterface,
  WsMessages,
  type WsTouchInterface,
} from '@o2k/core';
import { filter, map } from 'rxjs';
import { IconDirective } from '../../directives';

interface PointerInterface {
  x: number;
  y: number;
}

interface PointerDataInterface {
  uuid: WsClientPointerInterface['uuid'];
  user: WsClientPointerInterface['user'];
  mouse?: PointerInterface;
  fingers?: PointerInterface[];
}

@UntilDestroy()
@Component({
  selector: 'ui-ws-pointers',
  imports: [CommonModule, IconDirective],
  templateUrl: './ws-pointers.component.html',
  styleUrl: './ws-pointers.component.scss',
})
export class WsPointersComponent {
  protected worker: WebsocketWorker = inject(WEBSOCKET_WORKER);
  protected readonly window?: Window = inject(WINDOW);
  protected clientPointers: Signal<WsClientPointerInterface[]> = toSignal(
    this.worker.message$.pipe(
      filter((message: WsMessages) => message.event === 'pointer'),
      map((message: PointerMessage) => message.pointers),
      untilDestroyed(this)
    ),
    { initialValue: [] }
  );

  pointers: Signal<PointerDataInterface[]> = computed(() => {
    return this.clientPointers().map(client => {
      let mouse, fingers;

      if (client.pointer) {
        mouse = {
          x: (client.pointer.clientX / client.pointer.innerWidth) * (this.window?.innerWidth ?? 0),
          y:
            (client.pointer.clientY / client.pointer.innerHeight) * (this.window?.innerHeight ?? 0),
        };
      }

      if (client.touch) {
        const scaleX = (this.window?.innerWidth ?? 0) / client.touch.innerWidth;
        const scaleY = (this.window?.innerHeight ?? 0) / client.touch.innerHeight;
        fingers = client.touch.touches
          .filter(t => null !== t)
          .map((t: WsTouchInterface) => ({
            x: t.clientX * scaleX,
            y: t.clientY * scaleY,
          }));
      }

      return {
        uuid: client.uuid,
        user: client.user,
        mouse,
        fingers,
      };
    });
  });
}
