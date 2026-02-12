import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { EnrichModule } from './enrich/enrich.module';
import { SearchService } from './search/search.service';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { CacheService } from './cache/cache.service';
import { PubSubService } from './pubsub/pubsub.service';
import { DeepResearchAgent } from './deep-research-agent/deep-research-agent.service';
import { CampaignService } from './campaign/campaign.service';
import { EnrichmentProcessor } from './enrich/enrich.processor';
import { GeminiService } from './gemini/gemini.service';
import { PlannerService } from './deep-research-agent/planner.service';
import { ExtractorService } from './deep-research-agent/extractor.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    EnrichModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SearchService,
    CircuitBreakerService,
    DeepResearchAgent,
    CacheService,
    PubSubService,
    CampaignService,
    EnrichmentProcessor,
    GeminiService,
    PlannerService,
    ExtractorService,
  ],
})
export class AppModule {}
