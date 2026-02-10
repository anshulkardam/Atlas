import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class PubSubService implements OnModuleInit {
  private readonly logger = new Logger(PubSubService.name);
  private publisher: Redis;
  private subscriber: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);

    this.publisher.on('connect', () => {
      this.logger.log('Publisher connected to Redis');
    });

    this.subscriber.on('connect', () => {
      this.logger.log('Subscriber connected to Redis');
    });
  }

  async publish(channel: string, message: any): Promise<void> {
    try {
      const payload = JSON.stringify(message);
      await this.publisher.publish(channel, payload);
      this.logger.debug(`Published to ${channel}: ${payload}`);
    } catch (error) {
      this.logger.error(`Failed to publish to ${channel}:`, error);
    }
  }

  async subscribe(
    channel: string,
    callback: (message: any) => void,
  ): Promise<void> {
    try {
      await this.subscriber.subscribe(channel);

      this.subscriber.on('message', (ch, msg) => {
        if (ch === channel) {
          try {
            const parsed = JSON.parse(msg);
            callback(parsed);
          } catch (error) {
            this.logger.error(
              `Failed to parse message from ${channel}:`,
              error,
            );
          }
        }
      });

      this.logger.log(`Subscribed to channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to ${channel}:`, error);
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
      this.logger.log(`Unsubscribed from channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from ${channel}:`, error);
    }
  }
}
