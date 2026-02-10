import { Injectable, Logger } from '@nestjs/common';
import FirecrawlApp from '@mendable/firecrawl-js';
import * as crypto from 'crypto';
import { CacheService } from '../cache/cache.service';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
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
        results: JSON.parse(cached as string),
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
      async () => {
        // Fallback: return empty results or cached partial data
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
      // Use Firecrawl's search endpoint
      const searchResponse = await this.firecrawl.search(query, {
        limit: 5,
      });

      if (!searchResponse.web) {
        throw new Error('Firecrawl search failed');
      }

      // Transform Firecrawl results to our format
      const results: SearchResult[] = searchResponse.web.map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        snippet: item.description || item.snippet || '',
        content: item.markdown || item.content || '',
      }));

      this.logger.log(`Found ${results.length} results for query: ${query}`);
      return results;
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
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
      this.logger.error(`Failed to scrape ${url}: ${error.message}`);
      throw error;
    }
  }

  private hashQuery(query: string): string {
    return crypto.createHash('md5').update(query.toLowerCase()).digest('hex');
  }
}
