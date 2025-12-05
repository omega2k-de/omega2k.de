import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: 'redis://localhost:46379',
      username: process.env['REDIS_USERNAME'] ?? 'root',
      password: process.env['REDIS_PASSWORD'] ?? 'somesecret',
    });
    this.client.on('error', (_err: Error) => {
      // console.error('Redis connection error:', _err);
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    // console.log('Successfully connected to Redis');
  }
}
