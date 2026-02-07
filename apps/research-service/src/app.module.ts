import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnrichmentModule } from './enrichment/enrichment.module';
import { RedisModule } from './redis/redis.module';
import { AgentService } from './agent/agent.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    EnrichmentModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, AgentService],
})
export class AppModule {}
