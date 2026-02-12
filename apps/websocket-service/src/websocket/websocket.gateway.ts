import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit,
    OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private redisSub: Redis;

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

    this.redisSub = new Redis(redisUrl);

    this.redisSub.on('connect', () => {
      this.logger.log('Connected to Redis (Valkey)');
    });

    this.redisSub.on('pmessage', (_pattern, channel, message) => {
      this.handleRedisMessage(channel, message);
    });

    await this.redisSub.psubscribe('enrichment:progress:*');

    this.logger.log('Subscribed to enrichment:progress:*');
  }

  async onModuleDestroy() {
    await this.redisSub?.quit();
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { jobId: string },
  ) {
    if (!body?.jobId) {
      return;
    }

    await client.join(body.jobId);
    this.logger.log(`Client ${client.id} subscribed to job ${body.jobId}`);
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { jobId: string },
  ) {
    if (!body?.jobId) {
      return;
    }

    await client.leave(body.jobId);
    this.logger.log(`Client ${client.id} unsubscribed from job ${body.jobId}`);
  }

  private handleRedisMessage(channel: string, message: string) {
    try {
      const payload = JSON.parse(message);

      // enrichment:progress:{jobId}
      const jobId = channel.split(':')[2];

      if (!jobId) return;

      // Emit only to clients subscribed to this job
      this.server.to(jobId).emit('progress', payload);

      // this.logger.debug(
      //   `Emitted progress for job ${jobId} (iteration ${payload.iteration})`,
      // );
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'error';
      this.logger.error('Failed to process Redis message', message);
    }
  }
}
