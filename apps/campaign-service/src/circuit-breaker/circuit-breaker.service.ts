import { Injectable, BadRequestException } from '@nestjs/common';
import { CircuitBreakerEventType } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CircuitBreakerService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: {
    serviceName: string;
    eventType: string;
    errorMessage?: string | null;
  }) {
    if (
      !Object.values(CircuitBreakerEventType).includes(
        data.eventType as CircuitBreakerEventType,
      )
    ) {
      throw new BadRequestException('Invalid circuit breaker event type');
    }

    return this.prisma.circuitBreakerEvent.create({
      data: {
        serviceName: data.serviceName,
        eventType: data.eventType as CircuitBreakerEventType,
        errorMessage: data.errorMessage ?? null,
      },
    });
  }
}
