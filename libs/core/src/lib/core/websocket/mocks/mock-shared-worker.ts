import { vi } from 'vitest';

export class MockSharedWorker implements SharedWorker {
  postMessage = vi.fn();
  onerror = vi.fn();
  onmessage = vi.fn();
  dispatchEvent = vi.fn().mockReturnValue(true);
  port: MessagePort = {
    postMessage: vi.fn(),
    dispatchEvent: vi.fn().mockReturnValue(true),
    close: vi.fn(),
    start: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onmessage: vi.fn(),
    onmessageerror: vi.fn(),
  };

  addEventListener = vi.fn();

  removeEventListener = vi.fn();
}
