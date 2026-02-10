import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyById(companyId: string, userId: string) {
    return this.prisma.company.findFirst({
      where: {
        id: companyId,
        campaign: {
          userId,
        },
      },
    });
  }
}
