import {
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { EnrichService } from './enrich.service';

@Controller()
export class EnrichController {
  constructor(private readonly enrichService: EnrichService) {}

  @Post('people/:id/enrich')
  async enrichPerson(
    @Param('id') personId: string,
    @Headers('x-user-id') userId: string,
  ) {
    try {
      const job = await this.enrichService.enqueueEnrichment(personId, userId);

      return {
        success: true,
        jobId: job.id,
        message: 'Enrichment job queued successfully',
      };
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('jobs/:jobId/status')
  async getJobStatus(@Param('jobId') jobId: string) {
    try {
      const status = await this.enrichService.getJobStatus(jobId);
      return status;
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }
}
