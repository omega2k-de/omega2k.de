import { TestBed } from '@angular/core/testing';
import { PwaUpdateService } from './pwa-update.service';
import { MockProvider } from 'ng-mocks';
import { NotificationService } from './notification.service';
import { provideConfig } from '../tokens/config.injection-token';
import {
  NoNewVersionDetectedEvent,
  SwUpdate,
  type UnrecoverableStateEvent,
  type VersionEvent,
  VersionInstallationFailedEvent,
  type VersionReadyEvent,
} from '@angular/service-worker';
import { Subject } from 'rxjs';
import { type MockInstance, vi } from 'vitest';
import { WINDOW } from '../tokens';
import { LoggerService } from '../logger';
import mockdate from 'mockdate';
import { provideRouter } from '@angular/router';

describe('PwaUpdateService', () => {
  let versionUpdates$: Subject<VersionEvent>;
  let unrecoverable$: Subject<UnrecoverableStateEvent>;

  const makeSwUpdateMock = (enabled: boolean): Partial<SwUpdate> => {
    versionUpdates$ = new Subject<VersionEvent>();
    unrecoverable$ = new Subject<UnrecoverableStateEvent>();
    return {
      isEnabled: enabled,
      versionUpdates: versionUpdates$.asObservable() as SwUpdate['versionUpdates'],
      unrecoverable: unrecoverable$.asObservable() as SwUpdate['unrecoverable'],
      checkForUpdate: vi.fn().mockResolvedValue(true),
      activateUpdate: vi.fn().mockResolvedValue(undefined),
    };
  };

  const fakeWindow: Partial<Window> = {
    location: { reload: vi.fn() } as unknown as Location,
  };

  describe('with SwUpdate.isEnabled = true', () => {
    let service: PwaUpdateService;
    let notifyService: NotificationService;
    let notifySpy: MockInstance;

    beforeEach(() => {
      mockdate.set(1752952580109);
      vi.useFakeTimers();

      TestBed.configureTestingModule({
        providers: [
          provideConfig({ logger: 'OFF' }),
          provideRouter([]),
          MockProvider(NotificationService),
          MockProvider(SwUpdate, makeSwUpdateMock(true)),
          MockProvider(WINDOW, fakeWindow as Window),
          PwaUpdateService,
        ],
      });

      notifyService = TestBed.inject(NotificationService);
      notifySpy = vi.spyOn(notifyService, 'notify');

      service = TestBed.inject(PwaUpdateService);
    });

    afterEach(() => {
      vi.clearAllMocks();
      vi.useRealTimers();
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('#onServerPush notifies when a new version is ready (VERSION_READY)', async () => {
      service.enable();
      service.checkForUpdate({ hash: 'h3', version: '0.0.1' });

      const evt: VersionReadyEvent = {
        type: 'VERSION_READY',
        currentVersion: { hash: 'h1', appData: undefined },
        latestVersion: { hash: 'h2', appData: undefined },
      };
      versionUpdates$.next(evt);

      expect(notifySpy).toHaveBeenCalledTimes(0);
      vi.advanceTimersByTime(10000);
      expect(notifySpy).toHaveBeenCalledTimes(1);
      expect(notifySpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          applyIcon: 'more_time',
          applyTitle: 'um 1 Minute verschieben...',
          cancelIcon: 'autorenew',
          cancelTitle: 'Browser neuladen',
          clearTimeoutOnExpand: true,
          created: 1752952590109,
          data: null,
          icon: 'autorenew',
          important: true,
          message:
            'Beim automatischen Update ist wohl etwas schief gegangen. Kein Problem, einmal Neuladen sollte das Problem beheben. Bitte den Browser einmal neu laden.',
          onApply: expect.any(Function),
          onCancel: expect.any(Function),
          timeoutMs: 60_000,
          title: 'Update installiert',
          type: 'growl',
        })
      );
    });

    it('#onServerPush notifies when a new version is ready but wrong event (NO_NEW_VERSION_DETECTED)', async () => {
      service.enable();
      service.checkForUpdate({ hash: 'h3', version: '0.0.1' }, true);

      const evt: NoNewVersionDetectedEvent = {
        type: 'NO_NEW_VERSION_DETECTED',
        version: { hash: 'h3', appData: undefined },
      };
      versionUpdates$.next(evt);

      expect(notifySpy).toHaveBeenCalledTimes(0);
      vi.advanceTimersByTime(10000);
      expect(notifySpy).toHaveBeenCalledTimes(1);
      expect(notifySpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          applyIcon: 'more_time',
          applyTitle: 'um 1 Minute verschieben...',
          cancelIcon: 'check',
          cancelTitle: 'Update aktivieren',
          clearTimeoutOnExpand: true,
          created: 1752952590109,
          data: null,
          icon: 'stat_3',
          message: expect.stringContaining('0.0.1@h3'),
          onApply: expect.any(Function),
          onCancel: expect.any(Function),
          timeoutMs: 60_000,
          title: 'Update 0.0.1 verfügbar',
          type: 'growl',
        })
      );
    });

    it('#onServerPush notifies when a install failed (VERSION_INSTALLATION_FAILED)', async () => {
      service.enable();
      service.checkForUpdate({ hash: 'h3', version: '0.0.1' });

      const evt: VersionInstallationFailedEvent = {
        type: 'VERSION_INSTALLATION_FAILED',
        version: {
          hash: 'hash-value',
        },
        error: 'error',
      };
      versionUpdates$.next(evt);

      expect(notifySpy).toHaveBeenCalledTimes(0);
      vi.advanceTimersByTime(10000);
      expect(notifySpy).toHaveBeenCalledTimes(1);
      expect(notifySpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          applyIcon: 'more_time',
          applyTitle: 'um 1 Minute verschieben...',
          cancelIcon: 'autorenew',
          cancelTitle: 'Browser neuladen',
          clearTimeoutOnExpand: true,
          created: 1752952590109,
          data: null,
          icon: 'autorenew',
          important: true,
          message:
            'Beim automatischen Update ist wohl etwas schief gegangen. Kein Problem, einmal Neuladen sollte das Problem beheben. Bitte den Browser einmal neu laden.',
          onApply: expect.any(Function),
          onCancel: expect.any(Function),
          timeoutMs: 60_000,
          title: 'Update installiert',
          type: 'growl',
        })
      );
    });

    it('#checkForUpdate should log on error', async () => {
      vi.spyOn(service['swUpdate'], 'checkForUpdate').mockRejectedValue({ error: 'message' });
      const loggerInfoSpy = vi.spyOn(service['loggerService'], 'info');
      const loggerErrorSpy = vi.spyOn(service['loggerService'], 'error');
      service.enable();

      service.checkForUpdate({ hash: 'h4', version: '0.0.2' }, true);
      await Promise.resolve();

      expect(loggerInfoSpy).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'PwaUpdateService',
        'checkForUpdate() error, forced reload',
        { e: { error: 'message' } }
      );
    });

    it('#checkForUpdate should skip if not updates', async () => {
      const loggerInfoSpy = vi.spyOn(service['loggerService'], 'info');
      service.enable();

      service.checkForUpdate({ hash: null, version: '0.0.1' }, false);

      expect(notifySpy).not.toHaveBeenCalledTimes(1);
      expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
      expect(loggerInfoSpy).toHaveBeenCalledWith(
        'PwaUpdateService',
        'checkForUpdate() already updated'
      );
    });

    it('#activateAndReload should call activateUpdate() and log errors', async () => {
      const activateUpdateSpy = vi
        .spyOn(service['swUpdate'], 'activateUpdate')
        .mockRejectedValueOnce('error');
      const loggerErrorSpy = vi.spyOn(service['loggerService'], 'error');
      const loggerInfoSpy = vi.spyOn(service['loggerService'], 'info');
      service.enable();

      await service.activateAndReload();

      expect(notifySpy).not.toHaveBeenCalledTimes(1);
      expect(activateUpdateSpy).toHaveBeenCalledTimes(1);
      expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerInfoSpy).toHaveBeenCalledWith(
        'PwaUpdateService',
        'activateAndReload() calling update.activateUpdate()'
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'PwaUpdateService',
        'activateAndReload() error, forced reload',
        { e: 'error' }
      );
    });

    it('#enable informs user on unrecoverable state and blocks multiple enable', () => {
      const loggerWarnSpy = vi.spyOn(service['loggerService'], 'warn');

      service.enable();
      service.enable();

      unrecoverable$.next({ type: 'UNRECOVERABLE_STATE', reason: 'boom' });
      vi.advanceTimersByTime(32);

      expect(notifySpy).toHaveBeenCalled();
      expect(loggerWarnSpy).toHaveBeenCalled();
      expect(loggerWarnSpy).toHaveBeenCalledWith('PwaUpdateService', 'already enabled');
    });

    it('#disable should disable and unsubscribe', () => {
      const loggerWarnSpy = vi.spyOn(service['loggerService'], 'warn');

      service.enable();
      service.disable();

      unrecoverable$.next({ type: 'UNRECOVERABLE_STATE', reason: 'boom' });
      vi.advanceTimersByTime(32);

      expect(notifySpy).not.toHaveBeenCalled();
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('with SwUpdate.isEnabled = false', () => {
    beforeEach(() => {
      mockdate.set(1752952580109);
      vi.useFakeTimers();

      TestBed.configureTestingModule({
        providers: [
          provideConfig({ logger: 'OFF' }),
          MockProvider(NotificationService),
          MockProvider(SwUpdate, makeSwUpdateMock(false)),
          MockProvider(WINDOW, fakeWindow as Window),
          PwaUpdateService,
        ],
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
      vi.useRealTimers();
    });

    it('does not perform checks when SW is disabled', () => {
      const svc = TestBed.inject(PwaUpdateService);
      const sw = TestBed.inject(SwUpdate) as SwUpdate;
      const checkSpy = vi.spyOn(sw, 'checkForUpdate');

      svc.enable();
      vi.advanceTimersByTime(600_000);

      expect(checkSpy).not.toHaveBeenCalled();
      expect(svc).toBeTruthy();
    });

    it('#checkForUpdate should exit early (logs info) when disabled', async () => {
      const svc = TestBed.inject(PwaUpdateService);
      const logger = TestBed.inject(LoggerService);
      const infoSpy = vi.spyOn(logger, 'info');

      svc.enable();
      svc.checkForUpdate({ hash: 'h3', version: '0.0.1' });
      await Promise.resolve();

      expect(infoSpy).toHaveBeenCalledTimes(2);
      expect(infoSpy).toHaveBeenNthCalledWith(1, 'PwaUpdateService', 'ServiceWorker not enabled', {
        isDevMode: true,
      });
      expect(infoSpy).toHaveBeenNthCalledWith(
        2,
        'PwaUpdateService',
        'checkForUpdate() updates disabled'
      );
    });

    it('#activateAndReload should not trigger activateUpdate', async () => {
      const svc = TestBed.inject(PwaUpdateService);
      const logger = TestBed.inject(LoggerService);
      const infoSpy = vi.spyOn(logger, 'info');

      svc.enable();
      await svc.activateAndReload();

      expect(infoSpy).toHaveBeenCalledTimes(2);
      expect(infoSpy).toHaveBeenNthCalledWith(1, 'PwaUpdateService', 'ServiceWorker not enabled', {
        isDevMode: true,
      });
      expect(infoSpy).toHaveBeenNthCalledWith(
        2,
        'PwaUpdateService',
        'activateAndReload() updates disabled'
      );
    });
  });
});
