import { Module } from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';
import { EnrichmentController } from './enrichment.controller';

@Module({
  controllers: [EnrichmentController],
  providers: [EnrichmentService],
})
export class EnrichmentModule {}
