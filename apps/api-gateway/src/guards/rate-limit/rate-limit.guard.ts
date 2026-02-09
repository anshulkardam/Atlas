import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: Redis;
  private readonly windowSeconds: number;
  private readonly maxRequests: number;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.windowSeconds = parseInt(process.env.RATE_LIMIT_WINDOW || '60');
    this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '10');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;

    const key = `ratelimit:${userId}:${Math.floor(Date.now() / 1000 / this.windowSeconds)}`;

    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, this.windowSeconds);
    }

    if (current > this.maxRequests) {
      throw new HttpException(
        {
          statusCode: 429,
          message: 'Rate limit exceeded',
          retryAfter: this.windowSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
