import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service.js';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaigns(userId: string) {
    return await this.prisma.campaign.findMany({
      where: {
        userId,
      },
    });
  }
}
