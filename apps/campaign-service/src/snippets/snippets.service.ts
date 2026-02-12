import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CircuitBreakerState } from 'src/generated/prisma/enums.js';

export type EnrichmentResult = {
  companyValueProp: string | null;
  productNames: string[] | null;
  pricingModel: string | null;
  keyCompetitors: string[] | null;
  recentNews: string[] | null;
};

@Injectable()
export class SnippetsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBatch(snippets: any[]) {
    return this.prisma.contextSnippet.createMany({
      data: snippets,
    });
  }

  async getPersonSnippets(personId: string) {
    return this.prisma.contextSnippet.findMany({
      where: {
        entityType: 'PERSON',
        entityId: personId,
      },
      include: {
        searchLogs: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSearchLog(data: {
    iteration: number;
    query: string;
    topResults: any;
    cacheHit: boolean;
    circuitBreakerState: CircuitBreakerState;
    responseTimeMs: number;
  }) {
    return this.prisma.searchLog.create({
      data: {
        iteration: data.iteration,
        query: data.query,
        topResults: data.topResults,
        cacheHit: data.cacheHit,
        circuitBreakerState: data.circuitBreakerState,
        responseTimeMs: data.responseTimeMs,
      },
    });
  }

  async persist(payload: {
    personId: string;
    result: EnrichmentResult;
    searchLogs: any[];
  }) {
    const { personId, result: data, searchLogs } = payload;

    return this.prisma.$transaction(async (tx) => {
      const person = await tx.people.findUnique({
        where: { id: personId },
        include: { company: true },
      });

      if (!person) {
        throw new Error('Person not found');
      }

      const fieldsFound = Object.values(data).filter(
        (v) => v && (Array.isArray(v) ? v.length > 0 : true),
      ).length;

      const confidenceScore = (fieldsFound / 5) * 100;

      const rootSnippet = await tx.contextSnippet.create({
        data: {
          entityType: 'PERSON',
          entityId: personId,
          snippetType: 'COMPANY_VALUE_PROP',
          payload: { meta: 'enrichment_run' },
          confidenceScore,
        },
      });

      const creates: any[] = [];

      if (data.companyValueProp) {
        creates.push(
          tx.contextSnippet.create({
            data: {
              entityType: 'COMPANY',
              entityId: person.companyId,
              snippetType: 'COMPANY_VALUE_PROP',
              payload: { value: data.companyValueProp },
              confidenceScore,
            },
          }),
        );
      }

      if (data.productNames?.length) {
        creates.push(
          tx.contextSnippet.create({
            data: {
              entityType: 'COMPANY',
              entityId: person.companyId,
              snippetType: 'PRODUCT_NAMES',
              payload: { products: data.productNames },
              confidenceScore,
            },
          }),
        );
      }

      await Promise.all(creates);

      console.log('bhia', searchLogs);

      if (searchLogs?.length) {
        await tx.searchLog.createMany({
          data: searchLogs.map((log) => ({
            contextSnippetId: rootSnippet.id,
            iteration: log.iteration,
            query: log.query,
            topResults: log.topResults,
            cacheHit: log.cacheHit,
            circuitBreakerState: log.circuitBreakerState,
            responseTimeMs: log.responseTimeMs,
          })),
        });
      }

      await tx.people.update({
        where: { id: personId },
        data: {
          enrichmentStatus: 'COMPLETE',
          lastEnrichedAt: new Date(),
          retry_count: 0,
        },
      });
    });
  }
}
