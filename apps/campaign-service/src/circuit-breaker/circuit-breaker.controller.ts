import { Body, Controller, Post } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service.js';

@Controller('circuit-breaker')
export class CircuitBreakerController {
  constructor(private readonly circuitBreakerService: CircuitBreakerService) {}

  @Post('events')
  async logEvent(
    @Body()
    body: {
      serviceName: string;
      eventType: string;
      errorMessage?: string | null;
    },
  ) {
    return this.circuitBreakerService.createEvent(body);
  }
}
