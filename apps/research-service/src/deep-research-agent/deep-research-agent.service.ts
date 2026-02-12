import { Injectable, Logger } from '@nestjs/common';
import { CampaignService } from 'src/campaign/campaign.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { SearchResult, SearchService } from '../search/search.service';
import { PlannerService } from './planner.service';
import { ExtractorService } from './extractor.service';
import { CircuitBreakerService } from 'src/circuit-breaker/circuit-breaker.service';

const REQUIRED_FIELDS = [
  'companyValueProp',
  'productNames',
  'pricingModel',
  'keyCompetitors',
  'recentNews',
] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];

type EnrichmentResult = {
  companyValueProp: string | null;
  productNames: string[] | null;
  pricingModel: string | null;
  keyCompetitors: string[] | null;
  recentNews: string[] | null;
};

const searchLogs: {
  iteration: number;
  query: string;
  topResults: any;
  cacheHit: boolean;
  circuitBreakerState: string;
  responseTimeMs: number;
}[] = [];

@Injectable()
export class DeepResearchAgent {
  private readonly logger = new Logger(DeepResearchAgent.name);
  private readonly maxIterations: number;

  constructor(
    private readonly searchService: SearchService,
    private readonly pubSubService: PubSubService,
    private readonly campaignService: CampaignService,
    private readonly plannerService: PlannerService,
    private readonly extractorService: ExtractorService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    this.maxIterations = parseInt(process.env.MAX_AGENT_ITERATIONS || '1');
  }

  async enrich(personId: string, jobId: string, userId: string) {
    this.logger.log(`Starting deep research for person ${personId}`);

    const person = await this.campaignService.getPersonById(personId, userId);

    const result: EnrichmentResult = {
      companyValueProp: null,
      keyCompetitors: null,
      pricingModel: null,
      productNames: null,
      recentNews: null,
    };

    let iteration = 0;

    while (iteration < this.maxIterations) {
      iteration++;
      const missingFields = this.getMissingFields(result);

      if (missingFields.length === 0) {
        this.logger.log(`All fields collected in ${iteration - 1} iteration`);
        break;
      }

      const query = await this.plannerService.generateQuery(
        person.company.name,
        missingFields,
      );

      this.logger.log(`Iteration ${iteration} : Query = ${query}`);

      const searchResponse = await this.searchService.search(query);

      const combinedContent = searchResponse.results
        .map((r) => `${r.title}\n${r.description}\n${r.content || ''}`)
        .join('\n');

      let extracted = await this.extractorService.extract(combinedContent);

      if (!extracted) {
        this.logger.warn('Retrying extraction once...');
        extracted = await this.extractorService.extract(combinedContent);
      }

      if (!extracted) {
        continue;
      }

      this.mergeResults(result, extracted);

      const breakerState = await this.circuitBreaker.getState();

      searchLogs.push({
        iteration,
        query,
        topResults: searchResponse.results.slice(0, 5),
        cacheHit: searchResponse.cacheHit,
        circuitBreakerState: breakerState,
        responseTimeMs: searchResponse.responseTime,
      });

      await this.publishProgress(
        jobId,
        iteration,
        query,
        result,
        searchResponse.cacheHit,
      );
    }
    await this.campaignService.persistEnrichment({
      personId,
      result,
      searchLogs,
    });

    return {
      data: result,
      iterations: iteration,
    };
  }

  private getMissingFields(result: EnrichmentResult): RequiredField[] {
    const missing: RequiredField[] = [];

    if (!result.companyValueProp) {
      missing.push('companyValueProp');
    }

    if (!result.productNames || result.productNames.length === 0) {
      missing.push('productNames');
    }

    if (!result.pricingModel) {
      missing.push('pricingModel');
    }

    if (!result.keyCompetitors || result.keyCompetitors.length === 0) {
      missing.push('keyCompetitors');
    }

    if (!result.recentNews || result.recentNews.length === 0) {
      missing.push('recentNews');
    }

    return missing;
  }

  private mergeResults(
    target: EnrichmentResult,
    extracted: Partial<EnrichmentResult>,
  ) {
    if (extracted.companyValueProp && !target.companyValueProp) {
      target.companyValueProp = extracted.companyValueProp;
    }

    if (extracted.productNames?.length && !target.productNames) {
      target.productNames = extracted.productNames;
    }

    if (extracted.pricingModel && !target.pricingModel) {
      target.pricingModel = extracted.pricingModel;
    }

    if (extracted.keyCompetitors?.length && !target.keyCompetitors) {
      target.keyCompetitors = extracted.keyCompetitors;
    }

    if (extracted.recentNews?.length && !target.recentNews) {
      target.recentNews = extracted.recentNews;
    }
  }

  private async logIteration(
    personId: string,
    iteration: number,
    query: string,
    searchResponse: {
      results: SearchResult[];
      cacheHit: boolean;
      responseTime: number;
    },
  ) {
    const breakerState = await this.circuitBreaker.getState();

    await this.campaignService.logSearchIteration({
      personId,
      iteration,
      query,
      results: searchResponse.results.slice(0, 5).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
      })),
      cacheHit: searchResponse.cacheHit,
      circuitBreakerState: breakerState,
      responseTime: searchResponse.responseTime,
    });
  }

  private async publishProgress(
    jobId: string,
    iteration: number,
    query: string,
    result: EnrichmentResult,
    cacheHit: boolean,
  ) {
    const missingFields = this.getMissingFields(result);

    const breakerState = await this.circuitBreaker.getState();

    await this.pubSubService.publish(`enrichment:progress:${jobId}`, {
      jobId,
      iteration,
      totalIterations: this.maxIterations,
      currentQuery: query,
      fieldsFound: REQUIRED_FIELDS.filter((field) => result[field] !== null),
      fieldsRemaining: missingFields,
      cacheHit,
      circuitBreakerState: breakerState,
    });
  }
}
