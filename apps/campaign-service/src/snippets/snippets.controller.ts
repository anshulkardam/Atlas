import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { SnippetsService } from './snippets.service.js';

@Controller('snippets')
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  @Get('person/:id')
  getPersonSnippets(
    @Param('id') personId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.snippetsService.getPersonSnippets(personId, userId);
  }

  @Post('complete')
  complete(@Body() payload: any) {
    return this.snippetsService.persist(payload);
  }

  @Post('batch')
  async createBatch(@Body('snippets') snippets: any[]) {
    return this.snippetsService.createBatch(snippets);
  }

  @Post('search-logs')
  async createSearchLog(@Body() data: any) {
    return this.snippetsService.SaveSearchLogs(data);
  }
}
