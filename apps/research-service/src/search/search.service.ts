import { Injectable, Logger } from '@nestjs/common';
import FirecrawlApp, {
  SearchResultNews,
  SearchResultWeb,
} from '@mendable/firecrawl-js';
import * as crypto from 'crypto';
import { CacheService } from '../cache/cache.service';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  content?: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly firecrawl: FirecrawlApp;
  private readonly cacheTTL: number;

  constructor(
    private readonly cacheService: CacheService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    this.firecrawl = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY,
    });
    this.cacheTTL = parseInt(process.env.SEARCH_CACHE_TTL || '1800');
  }

  async search(query: string): Promise<{
    results: SearchResult[];
    cacheHit: boolean;
    responseTime: number;
  }> {
    const startTime = Date.now();
    const queryHash = this.hashQuery(query);
    const cacheKey = `search_cache:${queryHash}`;

    // Check cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT for query: ${query}`);
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        results: JSON.parse(cached),
        cacheHit: true,
        responseTime: Date.now() - startTime,
      };
    }

    this.logger.log(`Cache MISS for query: ${query}, executing search...`);

    // Execute search with circuit breaker
    const results = await this.circuitBreaker.execute(
      async () => {
        return await this.executeSearch(query);
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      async () => {
        // Fallback: return empty results
        this.logger.warn('Using fallback for search');
        return [];
      },
    );

    // Cache the results
    if (results.length > 0) {
      await this.cacheService.set(
        cacheKey,
        JSON.stringify(results),
        this.cacheTTL,
      );
    }

    return {
      results,
      cacheHit: false,
      responseTime: Date.now() - startTime,
    };
  }

  private async executeSearch(query: string): Promise<SearchResult[]> {
    try {
      const searchResponse = await this.firecrawl.search(query, {
        limit: 3,
        sources: ['news', 'web'],
      });

      if (!searchResponse.web && !searchResponse.news) {
        throw new Error('Firecrawl search returned no data');
      }

      const webResults: SearchResult[] = (searchResponse.web || []).map(
        (item: SearchResultWeb) => ({
          title: item.title || '',
          url: item.url || '',
          description: item.description || '',
        }),
      );

      const newsResults: SearchResult[] = (searchResponse.news || []).map(
        (item: SearchResultNews) => ({
          title: item.title || '',
          url: item.url || '',
          description: item.snippet || '',
        }),
      );

      const results = [...webResults, ...newsResults].slice(0, 5);

      this.logger.log(`Found ${results.length} results for query: ${query}`);

      const enrichedResults: SearchResult[] = await Promise.all(
        results.map(async (item) => {
          try {
            const content = await this.scrapeUrl(item.url);
            const trimmed = content.slice(0, 4000);
            return {
              ...item,
              trimmed,
            };
          } catch {
            return item;
          }
        }),
      );

      return enrichedResults;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Search failed: ${message}`);
      throw error;
    }
  }

  async scrapeUrl(url: string): Promise<string> {
    try {
      const scrapeResponse = await this.firecrawl.scrape(url, {
        formats: ['markdown'],
      });

      if (!scrapeResponse.markdown) {
        throw new Error('Firecrawl scrape failed');
      }

      return scrapeResponse.markdown;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to scrape ${url}: ${message}`);
      throw error;
    }
  }

  private hashQuery(query: string): string {
    return crypto.createHash('md5').update(query.toLowerCase()).digest('hex');
  }
}
