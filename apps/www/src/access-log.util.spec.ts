import { describe, expect, it } from 'vitest';
import { formatAccessLogLine, shouldLogAccess } from './access-log.util';

describe('access-log util', () => {
  it('enables access logs for INFO and above-visible levels', () => {
    expect(shouldLogAccess('INFO')).toBe(true);
    expect(shouldLogAccess('LOG')).toBe(true);
    expect(shouldLogAccess('DEBUG')).toBe(true);
  });

  it('disables access logs for WARN/ERROR/OFF', () => {
    expect(shouldLogAccess('WARN')).toBe(false);
    expect(shouldLogAccess('ERROR')).toBe(false);
    expect(shouldLogAccess('OFF')).toBe(false);
  });

  it('formats a concise access line', () => {
    expect(formatAccessLogLine('get', '/content/x', 200, 12)).toBe('GET /content/x -> 200 12ms');
  });
});
