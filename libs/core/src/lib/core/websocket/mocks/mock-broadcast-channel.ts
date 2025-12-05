import { vi } from 'vitest';

export class MockBroadcastChannel implements BroadcastChannel {
  dispatchEvent = vi.fn();
  name = 'MockBroadcastChannel';
  onmessage = vi.fn();
  onmessageerror = vi.fn();
  close = vi.fn();
  postMessage = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}
