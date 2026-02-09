import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client.js';
import { PrismaService } from 'src/prisma.service.js';

interface EnrichmentCompletionPayload {
  personId: string;
  iterations: number;
  data: {
    companyValueProp?: string;
    productNames?: string[];
    pricingModel?: string;
    keyCompetitors?: string[];
    recentNews?: string[];
  };
}

@Injectable()
export class SnippetsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPersonSnippets(personId: string, userId: string) {
    return this.prisma.contextSnippet.findMany({
      where: {
        entityType: 'PERSON',
        entityId: personId,
        person: {
          company: {
            campaign: {
              userId,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async persist(payload: EnrichmentCompletionPayload) {
    const { personId, data } = payload;

    return this.prisma.$transaction(async (tx) => {
      const person = await tx.people.findUnique({
        where: { id: personId },
        include: { company: true },
      });

      if (!person) {
        throw new Error('Person not found');
      }

      const fieldsFound = Object.keys(data).length;
      const confidenceScore = (fieldsFound / 5) * 100;

      const creates: Prisma.PrismaPromise<any>[] = [];

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

      if (data.pricingModel) {
        creates.push(
          tx.contextSnippet.create({
            data: {
              entityType: 'COMPANY',
              entityId: person.companyId,
              snippetType: 'PRICING_MODEL',
              payload: { model: data.pricingModel },
              confidenceScore,
            },
          }),
        );
      }

      if (data.keyCompetitors?.length) {
        creates.push(
          tx.contextSnippet.create({
            data: {
              entityType: 'COMPANY',
              entityId: person.companyId,
              snippetType: 'KEY_COMPETITORS',
              payload: { competitors: data.keyCompetitors },
              confidenceScore,
            },
          }),
        );
      }

      if (data.recentNews?.length) {
        creates.push(
          tx.contextSnippet.create({
            data: {
              entityType: 'COMPANY',
              entityId: person.companyId,
              snippetType: 'RECENT_NEWS',
              payload: { news: data.recentNews },
              confidenceScore,
            },
          }),
        );
      }

      await Promise.all(creates);

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
