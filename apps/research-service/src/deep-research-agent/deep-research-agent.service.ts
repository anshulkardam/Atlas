import { Injectable, Logger } from '@nestjs/common';
import { CampaignService } from 'src/campaign/campaign.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { SearchResult, SearchService } from '../search/search.service';

export interface EnrichmentData {
  companyValueProp?: string;
  productNames?: string[];
  pricingModel?: string;
  keyCompetitors?: string[];
  recentNews?: string[];
}

export interface AgentProgress {
  iteration: number;
  totalIterations: number;
  currentQuery: string;
  fieldsFound: string[];
  fieldsRemaining: string[];
  cacheHit: boolean;
  circuitBreakerState: string;
  complete?: boolean;
  data?: EnrichmentData;
  error?: string;
}

const REQUIRED_FIELDS = [
  'companyValueProp',
  'productNames',
  'pricingModel',
  'keyCompetitors',
  'recentNews',
];

@Injectable()
export class DeepResearchAgent {
  private readonly logger = new Logger(DeepResearchAgent.name);
  private readonly maxIterations: number;

  constructor(
    private readonly searchService: SearchService,
    private readonly pubSubService: PubSubService,
    private readonly campaignService: CampaignService,
  ) {
    this.maxIterations = parseInt(process.env.MAX_AGENT_ITERATIONS || '5');
  }

  async enrich(
    personId: string,
    jobId: string,
    userId: string,
  ): Promise<{
    data: EnrichmentData;
    iterations: number;
  }> {
    this.logger.log(`Starting enrichment for person ${personId}, job ${jobId}`);

    try {
      await this.campaignService.markInProgress(personId, jobId);

      const person = await this.campaignService.getPersonById(personId, userId);

      if (!person) {
        throw new Error(`Person ${personId} not found`);
      }

      const enrichmentData: EnrichmentData = {};
      let iteration = 0;
      let totalCacheHits = 0;

      // Agent loop
      while (iteration < this.maxIterations) {
        iteration++;

        const missingFields = this.getMissingFields(enrichmentData);

        if (missingFields.length === 0) {
          this.logger.log(
            `All fields found after ${iteration} iterations, stopping early`,
          );
          break;
        }

        // Plan next query based on missing fields
        const query = this.planQuery(person.company.name, missingFields);

        this.logger.log(
          `Iteration ${iteration}/${this.maxIterations}: ${query}`,
        );

        // Execute search
        const searchResult = await this.searchService.search(query);

        if (searchResult.cacheHit) {
          totalCacheHits++;
        }

        // Get circuit breaker state
        const circuitBreakerState = await this.getCircuitBreakerState();

        // Extract data from results
        const extracted = await this.extractData(
          searchResult.results,
          missingFields,
        );

        // Merge extracted data
        Object.assign(enrichmentData, extracted);

        // Log search iteration
        await this.campaignService.logSearchIteration({
          personId,
          iteration,
          query,
          results: searchResult.results.slice(0, 5),
          cacheHit: searchResult.cacheHit,
          circuitBreakerState,
          responseTime: searchResult.responseTime,
        });

        // Publish progress
        await this.publishProgress(jobId, {
          iteration,
          totalIterations: this.maxIterations,
          currentQuery: query,
          fieldsFound: Object.keys(enrichmentData),
          fieldsRemaining: missingFields,
          cacheHit: searchResult.cacheHit,
          circuitBreakerState,
        });

        // Small delay to avoid rate limiting
        await this.sleep(500);
      }

      const cacheHitRatio = totalCacheHits / iteration;

      await this.saveContextSnippets(
        personId,
        person.companyId,
        enrichmentData,
        cacheHitRatio,
      );

      // Mark person as COMPLETE
      await this.campaignService.markComplete(personId);

      // Publish completion
      await this.publishProgress(jobId, {
        iteration,
        totalIterations: iteration,
        currentQuery: 'Enrichment complete!',
        fieldsFound: Object.keys(enrichmentData),
        fieldsRemaining: [],
        cacheHit: false,
        circuitBreakerState: 'CLOSED',
        complete: true,
        data: enrichmentData,
      });

      this.logger.log(
        `Enrichment complete for person ${personId} after ${iteration} iterations`,
      );

      return {
        data: enrichmentData,
        iterations: iteration,
      };
    } catch (error) {
      this.logger.error(
        `Enrichment failed for person ${personId}: ${error.message}`,
      );

      // Mark person as FAILED
      await this.campaignService.markFailed(personId);

      // Publish error
      await this.publishProgress(jobId, {
        iteration: 0,
        totalIterations: this.maxIterations,
        currentQuery: 'Enrichment failed',
        fieldsFound: [],
        fieldsRemaining: REQUIRED_FIELDS,
        cacheHit: false,
        circuitBreakerState: 'UNKNOWN',
        complete: true,
        error: error.message,
      });

      throw error;
    }
  }

  private getMissingFields(data: EnrichmentData): string[] {
    return REQUIRED_FIELDS.filter((field) => {
      const value = data[field as keyof EnrichmentData];
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      return !value;
    });
  }

  private planQuery(companyName: string, missingFields: string[]): string {
    const field = missingFields[0];

    const queryMap: Record<string, string> = {
      companyValueProp: `${companyName} company value proposition mission`,
      productNames: `${companyName} products services offerings`,
      pricingModel: `${companyName} pricing plans cost`,
      keyCompetitors: `${companyName} competitors alternatives`,
      recentNews: `${companyName} news latest updates`,
    };

    return queryMap[field] || `${companyName} overview`;
  }

  private async extractData(
    results: SearchResult[],
    targetFields: string[],
  ): Promise<Partial<EnrichmentData>> {
    const extracted: Partial<EnrichmentData> = {};

    if (results.length === 0) {
      return extracted;
    }

    // Combine all content
    const combinedContent = results
      .map((r) => `${r.title} ${r.snippet} ${r.content || ''}`)
      .join(' ')
      .toLowerCase();

    // Extract data for each target field
    for (const field of targetFields) {
      switch (field) {
        case 'companyValueProp':
          extracted.companyValueProp = this.extractValueProp(
            combinedContent,
            results,
          );
          break;
        case 'productNames':
          extracted.productNames = this.extractProducts(combinedContent);
          break;
        case 'pricingModel':
          extracted.pricingModel = this.extractPricing(combinedContent);
          break;
        case 'keyCompetitors':
          extracted.keyCompetitors = this.extractCompetitors(combinedContent);
          break;
        case 'recentNews':
          extracted.recentNews = this.extractNews(results);
          break;
      }
    }

    return extracted;
  }

  private extractValueProp(content: string, results: SearchResult[]): string {
    const indicators = [
      'mission',
      'value proposition',
      'we help',
      'we provide',
      'enables',
      'platform for',
      'empowers',
      'dedicated to',
    ];

    for (const result of results) {
      const text = `${result.title} ${result.snippet}`.toLowerCase();
      for (const indicator of indicators) {
        if (text.includes(indicator)) {
          return result.snippet.substring(0, 200);
        }
      }
    }

    return results[0]?.snippet.substring(0, 200) || '';
  }

  private extractProducts(content: string): string[] {
    const products: string[] = [];
    const patterns = [
      /products?:?\s*([^.]+)/gi,
      /services?:?\s*([^.]+)/gi,
      /offers?\s+([^.]+)/gi,
      /solutions?:?\s*([^.]+)/gi,
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const items = match
            .split(/,|and|\||&/)
            .map((s) => s.trim())
            .filter((s) => s.length > 3 && s.length < 50)
            .map((s) =>
              s.replace(
                /^(products?|services?|offers?|solutions?)[:|\s]*/i,
                '',
              ),
            );
          products.push(...items);
        });
      }
    }

    return [...new Set(products)].slice(0, 5);
  }

  private extractPricing(content: string): string {
    const pricingIndicators = {
      freemium: ['free', 'paid', 'premium'],
      subscription: ['subscription', 'monthly', 'annual', 'recurring'],
      enterprise: ['enterprise', 'contact sales', 'custom pricing'],
      free: ['free', 'open source', 'no cost'],
      usage: ['pay as you go', 'usage-based', 'metered'],
    };

    for (const [model, indicators] of Object.entries(pricingIndicators)) {
      const matches = indicators.filter((ind) => content.includes(ind));
      if (matches.length >= 2) {
        return model.charAt(0).toUpperCase() + model.slice(1);
      }
    }

    if (content.includes('$')) {
      return 'Paid';
    }

    return 'Unknown';
  }

  private extractCompetitors(content: string): string[] {
    const competitors: string[] = [];
    const patterns = [
      /competitors?:?\s*([^.]+)/gi,
      /alternatives?:?\s*([^.]+)/gi,
      /vs\.?\s+([A-Z][a-z]+)/g,
      /compared to\s+([A-Z][a-z]+)/gi,
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const items = match
            .split(/,|and|\||&/)
            .map((s) => s.trim())
            .filter((s) => s.length > 2 && s.length < 30)
            .map((s) =>
              s.replace(
                /^(competitors?|alternatives?|vs\.?|compared to)[:|\s]*/i,
                '',
              ),
            );
          competitors.push(...items);
        });
      }
    }

    return [...new Set(competitors)].slice(0, 5);
  }

  private extractNews(results: SearchResult[]): string[] {
    return results.slice(0, 3).map((r) => r.title);
  }

  private async saveContextSnippets(
    personId: string,
    companyId: string,
    data: EnrichmentData,
    cacheHitRatio: number,
  ): Promise<void> {
    const fieldsFound = Object.keys(data).length;
    const confidenceScore = (fieldsFound / REQUIRED_FIELDS.length) * 100;

    type ContextSnippet = {
      entityType: string;
      entityId: string;
      snippetType: string;
      payload: any;
      sourceUrls: string[];
      confidenceScore: number;
      cacheHitRatio: number;
    };
    const snippets: ContextSnippet[] = [];

    if (data.companyValueProp) {
      snippets.push({
        entityType: 'COMPANY',
        entityId: companyId,
        snippetType: 'COMPANY_VALUE_PROP',
        payload: { value: data.companyValueProp },
        sourceUrls: [],
        confidenceScore,
        cacheHitRatio,
      });
    }

    if (data.productNames && data.productNames.length > 0) {
      snippets.push({
        entityType: 'COMPANY',
        entityId: companyId,
        snippetType: 'PRODUCT_NAMES',
        payload: { products: data.productNames },
        sourceUrls: [],
        confidenceScore,
        cacheHitRatio,
      });
    }

    if (data.pricingModel) {
      snippets.push({
        entityType: 'COMPANY',
        entityId: companyId,
        snippetType: 'PRICING_MODEL',
        payload: { model: data.pricingModel },
        sourceUrls: [],
        confidenceScore,
        cacheHitRatio,
      });
    }

    if (data.keyCompetitors && data.keyCompetitors.length > 0) {
      snippets.push({
        entityType: 'COMPANY',
        entityId: companyId,
        snippetType: 'KEY_COMPETITORS',
        payload: { competitors: data.keyCompetitors },
        sourceUrls: [],
        confidenceScore,
        cacheHitRatio,
      });
    }

    if (data.recentNews && data.recentNews.length > 0) {
      snippets.push({
        entityType: 'COMPANY',
        entityId: companyId,
        snippetType: 'RECENT_NEWS',
        payload: { news: data.recentNews },
        sourceUrls: [],
        confidenceScore,
        cacheHitRatio,
      });
    }

    // Save all snippets via campaign service
    await this.campaignService.saveContextSnippets(snippets);
  }

  private async publishProgress(
    jobId: string,
    progress: AgentProgress,
  ): Promise<void> {
    await this.pubSubService.publish(`enrichment:progress:${jobId}`, progress);
  }

  private async getCircuitBreakerState(): Promise<string> {
    try {
      const status = await this.searchService['circuitBreaker'].getStatus();
      return status.state;
    } catch {
      return 'UNKNOWN';
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
