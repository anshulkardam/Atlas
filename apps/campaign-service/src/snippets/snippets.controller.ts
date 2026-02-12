import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { EnrichmentResult, SnippetsService } from './snippets.service.js';

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

    return this.snippetsService.getPersonSnippets(personId);
  }

  @Post('batch')
  async createBatch(@Body('snippets') snippets: any[]) {
    return this.snippetsService.createBatch(snippets);
  }

  @Post('search-logs')
  create(@Body() body: any) {
    return this.snippetsService.createSearchLog(body);
  }

  @Post('complete')
  persist(
    @Body()
    body: {
      personId: string;
      result: EnrichmentResult;
      searchLogs: any[];
    },
  ) {
    return this.snippetsService.persist({
      personId: body.personId,
      result: body.result,
      searchLogs: body.searchLogs,
    });
  }
}
