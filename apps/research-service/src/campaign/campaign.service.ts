import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { getPeopleDetailsById } from '@repo/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { EnrichmentResult } from 'src/deep-research-agent/schemas/enrichment.schema';

export interface CircuitBreakerEventData {
  serviceName: string;
  eventType: string;
  errorMessage?: string | null;
}

export interface SearchLogData {
  personId: string;
  iteration: number;
  query: string;
  results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  cacheHit: boolean;
  circuitBreakerState: string;
  responseTime: number;
}

export interface ContextSnippetData {
  entityType: string;
  entityId: string;
  snippetType: string;
  payload: any;
  sourceUrls: string[];
  confidenceScore: number;
  cacheHitRatio: number;
}

@Injectable()
export class CampaignService {
  private readonly baseUrl: string;
  private readonly logger = new Logger(CampaignService.name);

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.CAMPAIGN_SERVICE_URL || 'http://localhost:3001';
  }

  async getPersonById(
    personId: string,
    userId: string,
  ): Promise<getPeopleDetailsById> {
    const res: AxiosResponse<getPeopleDetailsById> = await firstValueFrom(
      this.httpService.get<getPeopleDetailsById>(
        `${this.baseUrl}/api/people/${personId}`,
        {
          headers: { 'x-user-id': userId },
        },
      ),
    );

    return res.data;
  }

  async markInProgress(personId: string, jobId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/people/${personId}/start`, {
          jobId,
        }),
      );
      this.logger.log(`Marked person ${personId} as IN_PROGRESS`);
    } catch (error) {
      this.logger.error(
        `Failed to mark person ${personId} as IN_PROGRESS: ${error}`,
      );
      throw error;
    }
  }

  async markComplete(personId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/api/people/${personId}/complete`,
        ),
      );
      this.logger.log(`Marked person ${personId} as COMPLETE`);
    } catch (error) {
      this.logger.error(
        `Failed to mark person ${personId} as COMPLETE: ${error}`,
      );
      throw error;
    }
  }

  async markFailed(personId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/people/${personId}/failed`),
      );
      this.logger.log(`Marked person ${personId} as FAILED`);
    } catch (error) {
      this.logger.error(
        `Failed to mark person ${personId} as FAILED: ${error}`,
      );
    }
  }

  async logSearchIteration(data: SearchLogData): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/snippets/search-logs`, {
          iteration: data.iteration,
          query: data.query,
          topResults: data.results,
          cacheHit: data.cacheHit,
          circuitBreakerState: data.circuitBreakerState,
          responseTimeMs: data.responseTime,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to log search iteration: ${error}`);
    }
  }

  async saveContextSnippets(snippets: ContextSnippetData[]): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/snippets/batch`, {
          snippets,
        }),
      );
      this.logger.log(`Saved ${snippets.length} context snippets`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Failed to save context snippets: ${message}`);
      throw error;
    }
  }

  async logCircuitBreakEvent(
    serviceName: string,
    eventType: string,
    errorMessage: string | null,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/circuit-breaker/events`, {
          serviceName,
          eventType,
          errorMessage,
        }),
      );

      this.logger.log(
        `Logged circuit breaker event: ${serviceName} - ${eventType}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Failed to log circuit breaker event: ${message}`);
    }
  }

  async persistEnrichment(payload: {
    personId: string;
    result: EnrichmentResult;
    searchLogs: any[];
  }) {
    await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/api/snippets/complete`, payload),
    );
  }
}
