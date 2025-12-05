import { CommonModule } from '@angular/common';
import { Component, input, InputSignal } from '@angular/core';
import { WsMessages } from '@o2k/core';

@Component({
  selector: 'ui-ws-message-card',
  imports: [CommonModule],
  templateUrl: './ws-message-card.component.html',
  styleUrl: './ws-message-card.component.scss',
})
export class WsMessageCardComponent {
  message: InputSignal<WsMessages> = input.required<WsMessages>();
}
