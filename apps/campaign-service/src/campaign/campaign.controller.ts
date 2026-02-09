import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { CampaignService } from './campaign.service.js';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  getUserCampaigns(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Missing x-user-id header');
    }

    return this.campaignService.getCampaigns(userId);
  }
}
