const ACCESS_LOG_LEVELS = new Set(['DEBUG', 'LOG', 'INFO']);

export function shouldLogAccess(loggerLevel?: string | null): boolean {
  if (!loggerLevel) {
    return false;
  }
  return ACCESS_LOG_LEVELS.has(loggerLevel.toUpperCase());
}

export function formatAccessLogLine(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number
): string {
  return `${method.toUpperCase()} ${path} -> ${statusCode} ${durationMs}ms`;
}
