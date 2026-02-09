import {
  Controller,
  Get,
  Headers,
  Param,
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
  getPeopleById(
    @Headers('x-user-id') userId: string,
    @Param('id') peopleId: string,
  ) {
    return this.peopleService.getPeopleById(peopleId, userId);
  }
}
