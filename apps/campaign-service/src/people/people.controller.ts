import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { PeopleService } from './people.service.js';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  getPeopleList(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Missing x-user-id header');
    }

    return this.peopleService.getPeople(userId);
  }

  @Get(':id')
  async getPeopleById(
    @Headers('x-user-id') userId: string,
    @Param('id') peopleId: string,
  ) {
    const lol = await this.peopleService.getPeopleById(peopleId, userId);

    return lol;
  }

  @Post(':id/start')
  async markInProgress(@Param('id') id: string, @Body('jobId') jobId: string) {
    return this.peopleService.markInProgress(id, jobId);
  }

  @Post(':id/complete')
  async markComplete(@Param('id') id: string) {
    return this.peopleService.markComplete(id);
  }

  @Post(':id/failed')
  async markFailed(@Param('id') id: string) {
    return this.peopleService.markFailed(id);
  }
}
