import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CampaignService } from '../campaign/campaign.service';

export interface EnrichPersonJob {
  personId: string;
  userId: string;
}

@Injectable()
export class EnrichService {
  private readonly logger = new Logger(EnrichService.name);

  constructor(
    @InjectQueue('enrichment_jobs')
    private enrichmentQueue: Queue<EnrichPersonJob>,
    private readonly campaignClient: CampaignService,
  ) {}

  async enqueueEnrichment(personId: string, userId: string) {
    const person = await this.campaignClient.getPersonById(personId, userId);

    if (!person) {
      throw new Error(`Person ${personId} not found`);
    }

    // Add job to queue with high priority for new enrichments
    const job = await this.enrichmentQueue.add(
      'enrich-person',
      {
        personId,
        userId,
      },
      {
        priority: person.retry_count > 0 ? 5 : 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`Enqueued enrichment job ${job.id} for person ${personId}`);

    return job;
  }

  async getJobStatus(jobId: string) {
    const job = await this.enrichmentQueue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const state = await job.getState();

    return {
      jobId: job.id,
      name: job.name,
      state,
      progress: job.progress,
      data: job.data,
      attemptsMade: job.attemptsMade,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    };
  }
}
