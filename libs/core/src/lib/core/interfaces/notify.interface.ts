import dayjs from 'dayjs';
import { UiIconType } from '../types/ui-icon.type';
import { HealthStatus } from './health-status.interface';
import { UpdateStatus } from './update-status.interface';

export type NotifyType = 'health' | 'update' | 'growl';
export type NotifyTypes =
  | NotifyInterface<'growl'>
  | NotifyInterface<'health', HealthStatus>
  | NotifyInterface<'update', UpdateStatus>;
export type NotificationTypes =
  | GrowlNotificationInterface
  | HealthNotificationInterface
  | UpdateNotificationInterface;

export interface NotifyInterface<T = NotifyType, D = null> {
  id?: string;
  title: string;
  created: number;
  important?: boolean;
  message?: string;
  type: T;
  icon?: UiIconType;
  applyIcon?: UiIconType;
  applyTitle?: string;
  cancelIcon?: UiIconType;
  cancelTitle?: string;
  timeoutMs?: number;
  clearTimeoutOnExpand?: boolean;
  data: D;
  onApply?: () => void;
  onCancel?: (manual?: boolean) => void;
  onExpand?: () => void;
  onRemove?: () => void;
}

export interface GrowlNotificationInterface extends NotifyInterface<'growl'> {
  id: string;
  type: 'growl';
  date: dayjs.Dayjs;
  startedAt: number;
  expiresAt: number;
  progress: number;
  onApply: () => void;
  onCancel: (manual?: boolean) => void;
  onExpand: () => void;
  onRemove: () => void;
}

export interface HealthNotificationInterface extends NotifyInterface<'health', HealthStatus> {
  id: string;
  type: 'health';
  date: dayjs.Dayjs;
  startedAt: number;
  expiresAt: number;
  progress: number;
  data: HealthStatus;
  onApply: () => void;
  onCancel: (manual?: boolean) => void;
  onExpand: () => void;
  onRemove: () => void;
}

export interface UpdateNotificationInterface extends NotifyInterface<'update', UpdateStatus> {
  id: string;
  type: 'update';
  date: dayjs.Dayjs;
  startedAt: number;
  expiresAt: number;
  progress: number;
  data: UpdateStatus;
  onApply: () => void;
  onCancel: (manual?: boolean) => void;
  onExpand: () => void;
  onRemove: () => void;
}
