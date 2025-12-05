import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  CdkVirtualForOf,
  CdkVirtualScrollableElement,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import {
  DYNAMIC_HEIGHT_PREDICTOR,
  DynamicVirtualScrollDirective,
} from '../../../virtual-scrolling';
import { ChatService } from '../services';
import { AutoIdDirective, IconDirective } from '../../../directives';
import { ChatMessageComponent } from './chat-message.component';
import { ChatMessageEntryInterface } from '../interfaces';
import { WINDOW } from '@o2k/core';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { filter } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'ui-chat-window',
  imports: [
    AutoIdDirective,
    FormsModule,
    IconDirective,
    ReactiveFormsModule,
    DynamicVirtualScrollDirective,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkVirtualScrollableElement,
    ChatMessageComponent,
  ],
  providers: [
    {
      provide: DYNAMIC_HEIGHT_PREDICTOR,
      useFactory: () => (_item: ChatMessageEntryInterface) => {
        return 99;
      },
    },
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent implements AfterViewInit {
  private readonly autoscrollOffsetPx = 100;
  private readonly window?: Window = inject(WINDOW);
  private readonly chat: ChatService = inject(ChatService);

  protected readonly autoscroll = signal<boolean>(true);
  @ViewChild(CdkVirtualScrollableElement) scrollable?: CdkVirtualScrollableElement;

  public readonly form = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });

  messages = toSignal(this.chat.messages$, { initialValue: [] });
  messageCount = computed(() => this.messages().length);

  constructor() {
    effect(() => {
      const messageCount = this.messageCount();
      if (this.autoscroll() && messageCount > 1) {
        this.window?.requestAnimationFrame(() => {
          this.scrollable?.scrollTo({
            bottom: 0,
            behavior: 'smooth',
          });
        });
      }
    });
  }

  ngAfterViewInit(): void {
    const scrollable = this.scrollable?.elementScrolled();
    if (scrollable) {
      scrollable
        .pipe(
          debounceTime(16),
          map(e => e.target),
          filter(target => target instanceof HTMLElement),
          map(
            element =>
              Math.abs(element.scrollTop - element.scrollHeight + element.offsetHeight) <
              this.autoscrollOffsetPx
          ),
          distinctUntilChanged(),
          untilDestroyed(this)
        )
        .subscribe(autoscroll => this.autoscroll.set(autoscroll));
    }
  }

  send(event?: Event): void {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    const value = this.form.getRawValue();
    if (this.form.valid && value.message) {
      this.autoscroll.set(true);
      const chatCommand = value.message.match(new RegExp(`^/user[:= ](?<name>.*)$`, 'i'));
      if (chatCommand) {
        this.chat.updateServerUser({ name: chatCommand.groups?.['name'] ?? value.message });
      } else {
        this.chat.sendMessage(value.message);
      }
      this.form.reset();
    }
  }

  protected keydownHandler(event: KeyboardEvent) {
    const enterKey = event.keyCode === 13 || event.code === 'Enter' || event.key === 'Enter';
    if (!event.shiftKey && enterKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.autoscroll.set(true);
      this.send();
    }
  }
}
