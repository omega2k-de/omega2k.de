import { WsHasUuidInterface } from './ws-has-uuid.interface';

export interface WsAuthorInterface extends WsHasUuidInterface {
  name?: string | null;
}
