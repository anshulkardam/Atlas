import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DeepResearchAgent } from '../deep-research-agent/deep-research-agent.service';
import { PubSubService } from '../pubsub/pubsub.service';
import { CampaignService } from '../campaign/campaign.service';

interface EnrichmentJobData {
  personId: string;
  userId: string;
}

@Processor('enrichment_jobs')
export class EnrichmentProcessor extends WorkerHost {
  private readonly logger = new Logger(EnrichmentProcessor.name);

  constructor(
    private readonly agent: DeepResearchAgent,
    private readonly pubSub: PubSubService,
    private readonly campaignClient: CampaignService,
  ) {
    super();
  }

  async process(job: Job<EnrichmentJobData>) {
    const { personId, userId } = job.data;
    const jobId = job.id!.toString();

    this.logger.log(
      `Processing enrichment job ${jobId} for person ${personId}`,
    );

    try {
      // Update person status to IN_PROGRESS
      await this.campaignClient.markInProgress(personId, jobId);

      // Publish initial progress
      await this.pubSub.publish(`enrichment:progress:${jobId}`, {
        iteration: 0,
        totalIterations: 5,
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

      // Publish error
      await this.pubSub.publish(`enrichment:progress:${jobId}`, {
        iteration: 0,
        totalIterations: 5,
        currentQuery: 'Enrichment failed',
        fieldsFound: [],
        fieldsRemaining: [],
        cacheHit: false,
        circuitBreakerState: 'UNKNOWN',
        complete: true,
        error: error.message,
      });

      throw error;
    }
  }
}
