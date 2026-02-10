import { Module } from '@nestjs/common';
import { EnrichService } from './enrich.service';
import { EnrichController } from './enrich.controller';
import { BullModule } from '@nestjs/bullmq';
import { CampaignService } from '../campaign/campaign.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'enrichment_jobs',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    }),
    HttpModule,
  ],
  controllers: [EnrichController],
  providers: [EnrichService, CampaignService],
})
export class EnrichModule {}
