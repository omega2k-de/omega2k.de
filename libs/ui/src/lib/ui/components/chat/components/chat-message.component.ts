import { Component, input } from '@angular/core';
import { ChatMessageEntryInterface } from '../interfaces';
import { LinkifyPipe } from '../../../pipes';

@Component({
  selector: 'ui-chat-message',
  imports: [LinkifyPipe],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
})
export class ChatMessageComponent {
  readonly message = input.required<ChatMessageEntryInterface>();
}
