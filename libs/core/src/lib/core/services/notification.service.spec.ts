import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { type NotificationTypes, type NotifyTypes } from '../interfaces/notify.interface';
import { noop, Subscription } from 'rxjs';
import { vi } from 'vitest';

describe('NotificationService', () => {
  let service: NotificationService;
  let sub: Subscription;
  let latest: NotificationTypes[] = [];

  const BASE = 1_752_952_580_109;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(BASE));

    TestBed.configureTestingModule({
      providers: [NotificationService],
    });

    service = TestBed.inject(NotificationService);
    sub = service.notifications$.subscribe(v => (latest = v));
  });

  afterEach(() => {
    sub.unsubscribe();
    latest = [];
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  function notify(input: Partial<NotifyTypes> & Pick<NotifyTypes, 'title' | 'type'>): string {
    const id = (input as NotifyTypes).id ?? 'n1';
    const created = (input as NotifyTypes).created ?? Date.now();
    service.notify({
      id,
      created,
      message: input.message ?? 'msg',
      timeoutMs: input.timeoutMs ?? 0,
      title: input.title,
      type: input.type,
      icon: input.icon ?? 'icon',
      clearTimeoutOnExpand: input.clearTimeoutOnExpand ?? false,
      onApply: input.onApply,
      onCancel: input.onCancel,
      onExpand: input.onExpand,
      onRemove: input.onRemove,
      data: input.data ?? null,
      applyTitle: input.applyTitle ?? 'apply',
      cancelTitle: input.cancelTitle ?? 'cancel',
      applyIcon: input.applyIcon ?? 'apply',
      cancelIcon: input.cancelIcon ?? 'cancel',
    } as NotifyTypes);
    return id;
  }

  it('creates a notification and progress increases to a maximum of 1', () => {
    const id = notify({
      id: 'p1',
      title: 't',
      type: 'growl',
      timeoutMs: 3000,
      onExpand: () => noop(),
    });

    expect(latest.length).toBe(1);
    const at0 = latest.find(n => n.id === id);
    expect(at0?.progress).toBe(0);

    vi.advanceTimersByTime(1000);
    const at1 = latest.find(n => n.id === id);
    expect(at1?.progress).toBeGreaterThan(0);
    expect(at1?.progress).toBeLessThan(1);

    vi.advanceTimersByTime(2000);
    const at3 = latest.find(n => n.id === id);
    expect(at3?.progress ?? 0).toBeLessThanOrEqual(1);
  });

  it('#onExpand with clearTimeoutOnExpand stops the timer and sets progress=0/expiresAt=Infinity', () => {
    const onExpandSpy = vi.fn();
    const id = notify({
      id: 'exp1',
      title: 't',
      type: 'growl',
      timeoutMs: 2000,
      clearTimeoutOnExpand: true,
      onExpand: onExpandSpy,
    });

    latest.find(n => n.id === id)?.onExpand();

    vi.advanceTimersByTime(10_000);

    const after = latest.find(n => n.id === id);
    expect(after).toBeTruthy();
    expect(after?.progress).toBe(0);
    expect(latest.some(n => n.id === id)).toBe(true);
    expect(onExpandSpy).toHaveBeenCalled();
  });

  it('#onApply calls callback and removes the notification', () => {
    const onApply = vi.fn();
    const id = notify({ id: 'apply1', title: 't', type: 'growl', timeoutMs: 5000, onApply });

    latest.find(n => n.id === id)?.onApply();

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(latest.some(n => n.id === id)).toBe(false);
  });

  it('#onCancel calls callback and removes the notification', () => {
    const onCancel = vi.fn();
    const id = notify({ id: 'cancel1', title: 't', type: 'growl', timeoutMs: 5000, onCancel });

    latest.find(n => n.id === id)?.onCancel();

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(latest.some(n => n.id === id)).toBe(false);
  });

  it('#remove(id) calls onRemove exactly once and removes', () => {
    const onRemove = vi.fn();
    const id = notify({ id: 'rem1', title: 't', type: 'growl', timeoutMs: 5000, onRemove });

    service.remove(id);

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(latest.some(n => n.id === id)).toBe(false);
  });

  it('alreadyExpired: immediate exit calls onRemove and adds nothing', () => {
    const onRemove = vi.fn();

    const created = BASE - 1_000;
    service.notify({
      id: 'expNow',
      created,
      title: 't',
      type: 'growl',
      message: 'msg',
      icon: 'autorenew',
      timeoutMs: 100,
      onRemove,
      applyTitle: 'apply',
      cancelTitle: 'cancel',
      applyIcon: 'autorenew',
      cancelIcon: 'cancel',
      data: null,
      clearTimeoutOnExpand: false,
    });

    expect(latest.some(n => n.id === 'expNow')).toBe(false);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('#clearAll empties the list and stops all timers (without triggering onRemove)', () => {
    const onRemove1 = vi.fn();
    const onRemove2 = vi.fn();

    notify({ id: 'c1', title: 't', type: 'growl', timeoutMs: 2000, onRemove: onRemove1 });
    notify({ id: 'c2', title: 't', type: 'growl', timeoutMs: 4000, onRemove: onRemove2 });

    expect(latest.length).toBe(2);

    service.clearAll();

    expect(latest.length).toBe(0);

    vi.advanceTimersByTime(60_000);

    expect(onRemove1).not.toHaveBeenCalled();
    expect(onRemove2).not.toHaveBeenCalled();
  });

  it('setzt date=dayjs(created) und sortiert nach startedAt', () => {
    const c1 = BASE;
    const c2 = BASE + 10;

    notify({ id: 's2', title: 't', type: 'growl', created: c2 });
    notify({ id: 's1', title: 't', type: 'growl', created: c1 });

    expect(latest.map(n => n.id)).toEqual(['s1', 's2']);
    expect(latest.find(n => n.id === 's1')?.date.valueOf()).toBe(c1);
    expect(latest.find(n => n.id === 's2')?.date.valueOf()).toBe(c2);
  });
});
