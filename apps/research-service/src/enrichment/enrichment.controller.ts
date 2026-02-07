import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';

@Controller()
export class EnrichmentController {
  constructor(private readonly enrichmentService: EnrichmentService) {}

  @Post('people/:id/enrich')
  @HttpCode(HttpStatus.ACCEPTED)
  enrichPerson(@Param('personId') personId: string) {
    return personId;
  }

  @Get('jobs/:jobId/status')
  getJobStatus(@Param('jobId') jobId: string) {
    return jobId;
  }
}
