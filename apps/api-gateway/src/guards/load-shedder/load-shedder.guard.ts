import {
  CanActivate,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class LoadSheddingGuard implements CanActivate {
  private redis: Redis;
  private readonly maxConcurrentJobs: number;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.maxConcurrentJobs = parseInt(process.env.MAX_CONCURRENT_JOBS || '10');
  }

  async canActivate(): Promise<boolean> {
    const activeJobs = await this.redis.zcard('active_jobs');

    if (activeJobs >= this.maxConcurrentJobs) {
      throw new HttpException(
        {
          statusCode: 503,
          message: 'Service temporarily unavailable due to high load',
          retryAfter: 30,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return true;
  }
}
