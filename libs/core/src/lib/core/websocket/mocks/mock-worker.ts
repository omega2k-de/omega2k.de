import { vi } from 'vitest';

export class MockWorker implements Worker {
  onerror = vi.fn();
  onmessage = vi.fn();
  onmessageerror = vi.fn();
  dispatchEvent = vi.fn().mockReturnValue(true);
  postMessage = vi.fn();

  terminate = vi.fn();

  addEventListener = vi.fn();

  removeEventListener = vi.fn();
}
