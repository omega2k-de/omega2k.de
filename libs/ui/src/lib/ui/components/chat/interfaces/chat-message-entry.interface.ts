import { ChatMessage, WsAuthorInterface } from '@o2k/core';
import dayjs from 'dayjs';

export interface ChatMessageEntryInterface {
  uuid: ChatMessage['uuid'];
  author: WsAuthorInterface;
  message: string;
  direction: 'send' | 'receive';
  created: dayjs.Dayjs;
}
