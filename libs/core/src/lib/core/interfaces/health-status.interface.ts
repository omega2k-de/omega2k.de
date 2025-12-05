export interface HealthStatus {
  uptime: number;
  memory: number;
  usage: HealthMemoryUsage;
  os: HealthOsStats;
  eventLoopDelayMs: number;
  loadAvg: number[]; // array containing the 1, 5, and 15-minute load avg
  message: 'OK' | 'NOK';
  version?: string;
  hash?: string | null;
  clients: number;
}

export interface HealthOsStats {
  cpus: number;
  totalmem: number;
  freemem: number;
}

export interface HealthMemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
}
