import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import Redis from 'ioredis';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';
import { RateLimitGuard } from '../guards/rate-limit/rate-limit.guard';
import { LoadSheddingGuard } from '../guards/load-shedder/load-shedder.guard';
import { type AuthUser } from '../auth/decorator/user.decorator';
import {
  CircuitBreakerApiResponse,
  getCampaignsApiResponse,
  getCompanyByIdApiResponse,
  getPeopleDetailsById,
  getPeopleList,
} from '@repo/common';
import { AxiosResponse } from 'axios';

@Controller()
export class GatewayController {
  private readonly campaignServiceUrl: string;
  private readonly researchServiceUrl: string;
  private redis: Redis;

  constructor(private readonly httpService: HttpService) {
    this.campaignServiceUrl =
      process.env.CAMPAIGN_SERVICE_URL || 'http://localhost:3001';
    this.researchServiceUrl =
      process.env.RESEARCH_SERVICE_URL || 'http://localhost:3002';
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  @Get('campaigns')
  @UseGuards(JwtAuthGuard)
  async getCampaigns(@Req() req: AuthUser): Promise<getCampaignsApiResponse> {
    const response: AxiosResponse<getCampaignsApiResponse> =
      await firstValueFrom(
        this.httpService.get<getCampaignsApiResponse>(
          `${this.campaignServiceUrl}/api/campaigns`,
          {
            headers: { 'x-user-id': req.user.id },
          },
        ),
      );
    return response.data;
  }

  @Get('companies/:id')
  @UseGuards(JwtAuthGuard)
  async getCompany(
    @Param('id') id: string,
    @Req() req: AuthUser,
  ): Promise<getCompanyByIdApiResponse> {
    const response: AxiosResponse<getCompanyByIdApiResponse> =
      await firstValueFrom(
        this.httpService.get<getCompanyByIdApiResponse>(
          `${this.campaignServiceUrl}/api/companies/${id}`,
          {
            headers: { 'x-user-id': req.user.id },
          },
        ),
      );
    return response.data;
  }

  @Get('people')
  @UseGuards(JwtAuthGuard)
  async getPeople(@Req() req: AuthUser): Promise<getPeopleList> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.campaignServiceUrl}/api/people`, {
        headers: { 'x-user-id': req.user.id },
      }),
    );
    return response.data;
  }

  @Get('people/:id')
  @UseGuards(JwtAuthGuard)
  async getPerson(@Param('id') id: string): Promise<getPeopleDetailsById> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.campaignServiceUrl}/api/people/${id}`),
    );
    return response.data;
  }

  @Post('people/:id/enrich')
  @UseGuards(JwtAuthGuard, RateLimitGuard, LoadSheddingGuard)
  async enrichPerson(
    @Param('id') personId: string,
    @Req() req: AuthUser,
  ): Promise<getPeopleDetailsById> {
    const jobId = `job-${Date.now()}-${personId}`;

    await this.redis.zadd('active_jobs', Date.now(), jobId);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.researchServiceUrl}/api/people/${personId}/enrich`,
          { userId: req.user.id },
        ),
      );

      return response.data;
    } catch (error) {
      // Remove from active jobs on error
      await this.redis.zrem('active_jobs', jobId);
      throw error;
    }
  }

  @Get('jobs/:jobId/status')
  @UseGuards(JwtAuthGuard)
  async getJobStatus(@Param('jobId') jobId: string): Promise<any> {
    //TODO: Fix Any
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.researchServiceUrl}/api/jobs/${jobId}/status`,
      ),
    );
    return response.data;
  }

  @Get('snippets/person/:id')
  @UseGuards(JwtAuthGuard)
  async getPersonSnippets(
    @Param('id') personId: string,
    @Req() req: AuthUser,
  ): Promise<any> {
    //TODO: Fix Any
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.campaignServiceUrl}/api/snippets/person/${personId}`,
        { headers: { 'x-user-id': req.user.id } },
      ),
    );
    return response.data;
  }

  @Get('circuit-breaker/status')
  @UseGuards(JwtAuthGuard)
  async getCircuitBreakerStatus(): Promise<CircuitBreakerApiResponse> {
    const state = await this.redis.get('circuit_breaker:search_api:state');
    const failures = await this.redis.get(
      'circuit_breaker:search_api:failures',
    );
    const lastFailure = await this.redis.get(
      'circuit_breaker:search_api:last_failure',
    );

    return {
      state: state || 'CLOSED',
      failureCount: parseInt(failures || '0'),
      lastFailure: lastFailure ? parseInt(lastFailure) : null,
    };
  }
}
