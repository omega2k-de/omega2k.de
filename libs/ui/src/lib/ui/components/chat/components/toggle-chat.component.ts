import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { AutoIdDirective, IconDirective, VibrateDirective } from '../../../directives';
import { ChatWindowComponent } from './chat-window.component';
import { LocalStorageService } from '@o2k/core';
import { ChatService } from '../services';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ui-toggle-chat',
  imports: [
    CommonModule,
    IconDirective,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    VibrateDirective,
    ChatWindowComponent,
    AutoIdDirective,
  ],
  templateUrl: './toggle-chat.component.html',
  styleUrl: './toggle-chat.component.scss',
})
export class ToggleChatComponent implements OnInit {
  private readonly storageKey = 'o2k.chat.open';
  private storage = inject(LocalStorageService);
  private chat = inject(ChatService);
  readonly dialogOpen = signal<boolean>(false);
  readonly unread = toSignal(this.chat.unread$, { initialValue: 0 });

  constructor() {
    effect(() => {
      if (this.dialogOpen()) {
        this.storage.save(this.storageKey, '1');
      } else {
        this.storage.remove(this.storageKey);
      }
    });
  }

  toggleDialog(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.dialogOpen.set(!this.dialogOpen());
  }

  ngOnInit(): void {
    const open = this.storage.get(this.storageKey, 3_600_000);
    this.dialogOpen.set(open === '1');
  }
}
