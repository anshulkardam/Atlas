import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PeopleService {
  constructor(private readonly prisma: PrismaService) {}

  async getPeople(userId: string) {
    return this.prisma.people.findMany({
      where: {
        company: {
          campaign: {
            userId,
          },
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPeopleById(personId: string, userId: string) {
    return await this.prisma.people.findFirst({
      where: {
        id: personId,
        company: {
          campaign: {
            userId,
          },
        },
      },
      include: {
        company: true,
      },
    });
  }
  async markInProgress(id: string, jobId: string) {
    return await this.prisma.people.update({
      where: { id },
      data: {
        enrichmentStatus: 'IN_PROGRESS',
        enrichmentJobId: jobId,
      },
    });
  }

  async markComplete(id: string) {
    return await this.prisma.people.update({
      where: { id },
      data: {
        enrichmentStatus: 'COMPLETE',
        lastEnrichedAt: new Date(),
        retry_count: 0,
      },
    });
  }

  async markFailed(id: string) {
    return await this.prisma.people.update({
      where: { id },
      data: {
        enrichmentStatus: 'FAILED',
        retry_count: {
          increment: 1,
        },
      },
    });
  }
}
