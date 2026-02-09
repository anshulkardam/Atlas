import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service.js';

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
    return this.prisma.people.findFirst({
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
}
