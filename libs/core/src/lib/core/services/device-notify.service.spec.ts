import { TestBed } from '@angular/core/testing';
import { DeviceNotifyService } from './device-notify.service';
import { PlatformService } from './platform.service';
import { LocalStorageService } from './local-storage.service';
import { NotificationService } from './notification.service';
import { provideConfig } from '../tokens';
import { MockProvider } from 'ng-mocks';

describe('DeviceNotifyService', () => {
  let service: DeviceNotifyService;

  const NotificationMock = () => ({ addEventListener: vi.fn() });
  NotificationMock.permission = 'default';
  NotificationMock.requestPermission = vi.fn().mockResolvedValue('granted');

  beforeEach(() => {
    vi.stubGlobal('Notification', NotificationMock);

    TestBed.configureTestingModule({
      providers: [
        DeviceNotifyService,
        MockProvider(PlatformService, { isBrowser: true }),
        MockProvider(LocalStorageService),
        MockProvider(NotificationService),
        provideConfig({ url: 'https://omega2k.de', logger: 'OFF' }),
      ],
    });

    service = TestBed.inject(DeviceNotifyService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('#init enables, if browser storage has 1 and permission "granted"', () => {
    NotificationMock.permission = 'granted';
    const getSpy = vi.spyOn(service['storage'], 'get').mockReturnValueOnce('1');
    const enabledFn = vi.fn();

    service.enabled$.subscribe(enabledFn);

    service.init();

    expect(getSpy).toHaveBeenCalledWith('o2k.notify.enabled');
    expect(enabledFn).toHaveBeenCalledTimes(2);
    expect(enabledFn).toHaveBeenNthCalledWith(1, false); // initialer BehaviorSubject
    expect(enabledFn).toHaveBeenNthCalledWith(2, true);
  });

  it('#init stays disabled, if storage not 1', () => {
    NotificationMock.permission = 'granted';
    const getSpy = vi.spyOn(service['storage'], 'get').mockReturnValueOnce('0');
    const enabledFn = vi.fn();

    service.enabled$.subscribe(enabledFn);

    service.init();

    expect(getSpy).toHaveBeenCalledWith('o2k.notify.enabled');
    expect(enabledFn).toHaveBeenCalledTimes(2);
    expect(enabledFn).toHaveBeenNthCalledWith(1, false);
    expect(enabledFn).toHaveBeenNthCalledWith(2, false);
  });

  it('#enable asks for permission and stores "granted"', async () => {
    NotificationMock.permission = 'default';
    const requestSpy = vi.spyOn(Notification, 'requestPermission').mockResolvedValueOnce('granted');
    const saveSpy = vi.spyOn(service['storage'], 'save');

    const enabledFn = vi.fn();
    service.enabled$.subscribe(enabledFn);

    service.enable();
    await Promise.resolve();

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith('o2k.notify.enabled', '1');
    expect(enabledFn).toHaveBeenCalledTimes(2);
    expect(enabledFn).toHaveBeenNthCalledWith(2, true);
  });

  it('#enable shows growl message if "denied"', async () => {
    NotificationMock.permission = 'default';
    vi.spyOn(Notification, 'requestPermission').mockResolvedValueOnce('denied');
    const saveSpy = vi.spyOn(service['storage'], 'save');
    const notifySpy = vi.spyOn(service['notificationService'], 'notify');

    service.enable();
    await Promise.resolve();

    expect(saveSpy).toHaveBeenCalledWith('o2k.notify.enabled', '0');
    expect(notifySpy).toHaveBeenCalledTimes(1);
    expect(notifySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'growl',
        important: true,
      })
    );
  });

  it('#disable() set enabled to false and store 0', () => {
    vi.spyOn(service['storage'], 'get').mockReturnValueOnce('1');
    NotificationMock.permission = 'granted';
    service.init();

    const saveSpy = vi.spyOn(service['storage'], 'save');
    const enabledFn = vi.fn();
    service.enabled$.subscribe(enabledFn);

    service.disable();

    expect(saveSpy).toHaveBeenCalledWith('o2k.notify.enabled', '0');
    expect(enabledFn).toHaveBeenLastCalledWith(false);
  });

  it('#notify creates enabled state notification', () => {
    vi.spyOn(service['storage'], 'get').mockReturnValueOnce('1');
    NotificationMock.permission = 'granted';
    service.init();

    const ctorSpy = vi.spyOn(globalThis, 'Notification');

    const openSpy = vi.fn();
    vi.stubGlobal('open', openSpy);

    service.notify();

    expect(ctorSpy).toHaveBeenCalledWith(
      'Benachrichtigungen aktiviert',
      expect.objectContaining({
        icon: 'https://omega2k.de/icons/icon-144x144.webp',
        tag: 'update',
      })
    );
  });

  it('#toggle will first enable and notify and then disable', async () => {
    const timeoutSpy = vi.spyOn(globalThis, 'setTimeout').mockImplementation(cb => {
      cb();
      return 0 as never;
    });

    NotificationMock.permission = 'default';
    vi.spyOn(Notification, 'requestPermission').mockResolvedValueOnce('granted');
    const notifySpy = vi.spyOn(service, 'notify');

    service.toggle();
    await Promise.resolve();
    service.toggle();
    await Promise.resolve();

    expect(timeoutSpy).toHaveBeenCalled();
    expect(notifySpy).toHaveBeenCalled();
  });
});
