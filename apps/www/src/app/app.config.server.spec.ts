import { describe, expect, it, vi } from 'vitest';

describe('app.config.server', () => {
  it('prefers API_INTERNAL_URL for SSR API calls', async () => {
    vi.stubEnv('API_INTERNAL_URL', 'http://webservice-api/');
    const mod = await import('./app.config.server');
    expect(mod.resolveServerApiBaseUrl()).toBe('http://webservice-api');
    vi.unstubAllEnvs();
  });
});
