import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DeepResearchAgent } from '../deep-research-agent/deep-research-agent.service';
import { PubSubService } from '../pubsub/pubsub.service';
import { CampaignService } from '../campaign/campaign.service';
import { CacheService } from 'src/cache/cache.service';

interface EnrichmentJobData {
  personId: string;
  userId: string;
}

@Processor('enrichment_jobs')
export class EnrichmentProcessor extends WorkerHost {
  private readonly logger = new Logger(EnrichmentProcessor.name);
  private readonly maxIterations: number;
  constructor(
    private readonly agent: DeepResearchAgent,
    private readonly pubSub: PubSubService,
    private readonly campaignClient: CampaignService,
    private readonly redis: CacheService,
  ) {
    super();
    this.maxIterations = parseInt(process.env.MAX_AGENT_ITERATIONS || '5');
  }

  async process(job: Job<EnrichmentJobData>) {
    const { personId, userId } = job.data;
    const jobId = job.id!.toString();
    try {
      await this.redis.zadd('active_jobs', Date.now(), jobId);

      this.logger.log(
        `Processing enrichment job ${jobId} for person ${personId}`,
      );

      // Update person status to IN_PROGRESS
      await this.campaignClient.markInProgress(personId, jobId);

      // Publish initial progress
      await this.pubSub.publish(`enrichment:progress:${jobId}`, {
        jobId,
        iteration: 0,
        totalIterations: this.maxIterations,
        currentQuery: 'Starting enrichment...',
        fieldsFound: [],
        fieldsRemaining: [
          'companyValueProp',
          'productNames',
          'pricingModel',
          'keyCompetitors',
          'recentNews',
        ],
        cacheHit: false,
        circuitBreakerState: 'CLOSED',
      });

      // Run the agent
      const result = await this.agent.enrich(personId, jobId, userId);

      // Update person status to COMPLETE
      await this.campaignClient.markComplete(personId);

      // Publish completion
      await this.pubSub.publish(`enrichment:progress:${jobId}`, {
        jobId,
        iteration: result.iterations,
        totalIterations: result.iterations,
        currentQuery: 'Enrichment complete!',
        fieldsFound: Object.keys(result.data),
        fieldsRemaining: [],
        cacheHit: false,
        circuitBreakerState: 'CLOSED',
        complete: true,
        data: result.data,
      });

      this.logger.log(
        `Enrichment job ${jobId} completed successfully for person ${personId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Enrichment job ${jobId} failed for person ${personId}:`,
        error,
      );

      await this.campaignClient.markFailed(personId);

      const message = error instanceof Error ? error.message : 'Unknown error';

      // Publish error
      await this.pubSub.publish(`enrichment:progress:${jobId}`, {
        jobId,
        iteration: 0,
        totalIterations: 5,
        currentQuery: 'Enrichment failed',
        fieldsFound: [],
        fieldsRemaining: [],
        cacheHit: false,
        circuitBreakerState: 'CLOSED',
        complete: true,
        error: message,
      });

      throw error;
    } finally {
      await this.redis.zrem('active_jobs', jobId);
    }
  }
}
