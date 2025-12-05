import { inject, TestBed } from '@angular/core/testing';
import { KeyboardShortcutInterface, LoggerService, provideConfig } from '@o2k/core';
import { noop } from 'rxjs';
import { KeyboardShortcutsService } from '.';

describe('KeyboardShortcutsService', () => {
  let service: KeyboardShortcutsService;
  let logger: LoggerService;

  let keyUpMarker: null | boolean = null;
  let keyDownMarker: null | boolean = null;

  const setKeyUpMarkerTrue: KeyboardShortcutInterface = {
    key: 'A',
    keyUp: true,
    command: () => (keyUpMarker = true),
  };
  const setKeyUpMarkerFalse: KeyboardShortcutInterface = {
    key: ['B', 'C'],
    keyUp: true,
    command: () => (keyUpMarker = false),
  };

  const setKeyDownMarkerTrue: KeyboardShortcutInterface = {
    key: 'Y',
    command: () => (keyDownMarker = true),
    preventDefault: true,
  };
  const setKeyDownMarkerFalse: KeyboardShortcutInterface = {
    key: 'Z',
    altKey: true,
    command: () => (keyDownMarker = false),
  };

  const setKeyboardThrowError: KeyboardShortcutInterface = {
    key: 'E',
    command: () => {
      throw new Error('some error happened');
    },
  };

  beforeAll(() =>
    TestBed.configureTestingModule({
      providers: [KeyboardShortcutsService, provideConfig({ logger: 'OFF' }), LoggerService],
    })
  );

  beforeAll(inject(
    [KeyboardShortcutsService, LoggerService],
    (s: KeyboardShortcutsService, l: LoggerService) => {
      service = s;
      logger = l;
    }
  ));

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should not add invalid shortcut', () => {
    const loggerSpy = vi.spyOn(logger, 'error');
    const shortcut = { command: vi.fn() };
    service.add(shortcut as unknown as KeyboardShortcutInterface);
    expect(service.commands).toStrictEqual([]);
    expect(loggerSpy).toHaveBeenCalledWith(
      'KeyboardShortcutsService',
      'tried to add invalid shortcut without key or code'
    );
  });

  it('should trigger keydown command', () => {
    service.add([setKeyDownMarkerTrue, setKeyDownMarkerFalse]);
    const event1 = new KeyboardEvent('keydown', { key: String(setKeyDownMarkerTrue.key) });
    const preventDefaultSpy1 = vi.spyOn(event1, 'preventDefault');
    const stopImmediatePropagationSpy1 = vi.spyOn(event1, 'stopImmediatePropagation');
    window.dispatchEvent(event1);
    expect(keyDownMarker).toEqual(true);
    expect(preventDefaultSpy1).toHaveBeenCalled();
    expect(stopImmediatePropagationSpy1).toHaveBeenCalled();
    expect(service.commands).toStrictEqual([setKeyDownMarkerTrue, setKeyDownMarkerFalse]);
    const event2 = new KeyboardEvent('keydown', {
      key: String(setKeyDownMarkerFalse.key),
      altKey: true,
    });
    const preventDefaultSpy2 = vi.spyOn(event2, 'preventDefault');
    const stopImmediatePropagationSpy2 = vi.spyOn(event2, 'stopImmediatePropagation');
    window.dispatchEvent(event2);
    expect(keyDownMarker).toEqual(false);
    expect(preventDefaultSpy2).not.toHaveBeenCalled();
    expect(stopImmediatePropagationSpy2).not.toHaveBeenCalled();
    service.remove([setKeyDownMarkerTrue, setKeyDownMarkerFalse]);
    expect(service.commands).toStrictEqual([]);
  });

  it('should catch errors', () => {
    const loggerSpy = vi.spyOn(logger, 'error');
    service.add([setKeyDownMarkerTrue, setKeyDownMarkerFalse, setKeyboardThrowError]);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: String(setKeyboardThrowError.key) }));
    expect(loggerSpy).toHaveBeenCalledWith('KeyboardShortcutsService', 'shortcut command invalid');
    expect(service.commands).toStrictEqual([
      setKeyDownMarkerTrue,
      setKeyDownMarkerFalse,
      setKeyboardThrowError,
    ]);
    service.remove([setKeyDownMarkerFalse, setKeyboardThrowError]);
    expect(service.commands).toStrictEqual([setKeyDownMarkerTrue]);
    service.remove([setKeyDownMarkerTrue]);
    expect(service.commands).toStrictEqual([]);
  });

  it('should trigger keyup command', () => {
    service.add([setKeyUpMarkerTrue, setKeyUpMarkerFalse]);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: String(setKeyUpMarkerTrue.key) }));
    expect(keyUpMarker).toEqual(true);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'B' }));
    expect(keyUpMarker).toEqual(false);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'C' }));
    expect(keyUpMarker).toEqual(false);
    service.remove([setKeyUpMarkerTrue, setKeyUpMarkerFalse]);
  });

  it('should remove own keyboard commands', () => {
    service.add([
      setKeyDownMarkerTrue,
      setKeyUpMarkerFalse,
      setKeyDownMarkerFalse,
      setKeyUpMarkerTrue,
    ]);
    service.remove(setKeyUpMarkerFalse);
    service.remove([setKeyDownMarkerFalse]);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: String(setKeyDownMarkerTrue.key) }));
    expect(keyDownMarker).toEqual(true);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: String(setKeyDownMarkerFalse.key) }));
    expect(keyDownMarker).toEqual(true);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: String(setKeyUpMarkerTrue.key) }));
    expect(keyUpMarker).toEqual(true);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'C' }));
    expect(keyUpMarker).toEqual(true);
    service.remove([
      setKeyDownMarkerTrue,
      setKeyUpMarkerFalse,
      setKeyDownMarkerFalse,
      setKeyUpMarkerTrue,
    ]);
  });

  it('#translateMacKey should translate for mac', () => {
    const translation = service.translateMacKey('alt', true);
    expect(translation).toEqual('⌥');
  });

  it('#translateMacKey should not translate for none mac', () => {
    const translation = service.translateMacKey('alt');
    expect(translation).toEqual('alt');
  });

  it('should be able to detect target and debug', () => {
    const loggerSpy = vi.spyOn(logger, 'debug').mockImplementation(noop);
    const command = vi.fn();
    const parent = document.createElement('div');
    const target = document.createElement('span');
    parent.appendChild(target);
    document.body.appendChild(parent);
    const shortcut: KeyboardShortcutInterface = {
      key: 't',
      command,
      target,
      keyUp: false,
      preventDefault: true,
    };
    service.debug(true);
    service.add(shortcut);

    const keyUp = false;
    const event = new KeyboardEvent('keydown', { key: String(shortcut.key), bubbles: true });

    target.dispatchEvent(event);
    expect(command).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith('KeyboardShortcutsService', {
      event,
      keyUp,
      matched: [shortcut],
    });

    service.remove(shortcut);
    service.debug(false);
  });
});
