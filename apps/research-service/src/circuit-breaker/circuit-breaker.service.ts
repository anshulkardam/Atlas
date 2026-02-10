import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';
import { CampaignService } from 'src/campaign/campaign.service';

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  halfOpenTimeout: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly config: CircuitBreakerConfig;
  private readonly serviceName: string = 'search_api';

  constructor(
    private readonly cacheService: CacheService,
    private readonly campaignClient: CampaignService,
  ) {
    this.config = {
      failureThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '3',
      ),
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '30000'),
      halfOpenTimeout: parseInt(
        process.env.CIRCUIT_BREAKER_HALF_OPEN_TIMEOUT || '30000',
      ),
    };
  }

  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    const state = await this.getState();

    if (state === CircuitBreakerState.OPEN) {
      this.logger.warn('Circuit breaker is OPEN, checking timeout...');

      const lastFailure = await this.getLastFailureTime();
      const now = Date.now();

      if (lastFailure && now - lastFailure > this.config.timeout) {
        this.logger.log('Timeout elapsed, transitioning to HALF_OPEN');
        await this.transitionTo(CircuitBreakerState.HALF_OPEN);
      } else {
        if (fallback) {
          this.logger.log('Using fallback due to OPEN circuit');
          return await fallback();
        }
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      await this.onSuccess();
      return result;
    } catch (error) {
      await this.onFailure(error);

      if (fallback) {
        this.logger.log('Using fallback after operation failure');
        return await fallback();
      }
      throw error;
    }
  }

  async getState(): Promise<CircuitBreakerState> {
    const state = await this.cacheService.get(
      `circuit_breaker:${this.serviceName}:state`,
    );
    return (state as CircuitBreakerState) || CircuitBreakerState.CLOSED;
  }

  async getFailureCount(): Promise<number> {
    const count = await this.cacheService.get(
      `circuit_breaker:${this.serviceName}:failures`,
    );
    return parseInt(count as string) || 0;
  }

  async getLastFailureTime(): Promise<number | null> {
    const time = await this.cacheService.get(
      `circuit_breaker:${this.serviceName}:last_failure`,
    );
    return time ? parseInt(time) : null;
  }

  async getSuccessCount(): Promise<number> {
    const count = await this.cacheService.get(
      `circuit_breaker:${this.serviceName}:successes`,
    );
    return parseInt(count as string) || 0;
  }

  private async onSuccess(): Promise<void> {
    const state = await this.getState();

    if (state === CircuitBreakerState.HALF_OPEN) {
      const successes = await this.getSuccessCount();
      await this.cacheService.set(
        `circuit_breaker:${this.serviceName}:successes`,
        (successes + 1).toString(),
        30,
      );

      // Close circuit after 2 successes in HALF_OPEN state
      if (successes + 1 >= 2) {
        this.logger.log('2 successes in HALF_OPEN, transitioning to CLOSED');
        await this.transitionTo(CircuitBreakerState.CLOSED);
        await this.reset();
      }
    } else if (state === CircuitBreakerState.CLOSED) {
      // Reset failure count on success
      await this.cacheService.delete(
        `circuit_breaker:${this.serviceName}:failures`,
      );
    }

    await this.logEvent('SUCCESS', null);
  }

  private async onFailure(error: any): Promise<void> {
    const state = await this.getState();
    const failures = await this.getFailureCount();

    await this.cacheService.set(
      `circuit_breaker:${this.serviceName}:failures`,
      (failures + 1).toString(),
      30,
    );

    await this.cacheService.set(
      `circuit_breaker:${this.serviceName}:last_failure`,
      Date.now().toString(),
      30,
    );

    this.logger.error(
      `Circuit breaker failure #${failures + 1}: ${error.message}`,
    );

    if (state === CircuitBreakerState.HALF_OPEN) {
      // Any failure in HALF_OPEN state reopens the circuit
      this.logger.warn('Failure in HALF_OPEN, transitioning to OPEN');
      await this.transitionTo(CircuitBreakerState.OPEN);
    } else if (
      state === CircuitBreakerState.CLOSED &&
      failures + 1 >= this.config.failureThreshold
    ) {
      this.logger.warn(
        `Failure threshold (${this.config.failureThreshold}) reached, transitioning to OPEN`,
      );
      await this.transitionTo(CircuitBreakerState.OPEN);
    }

    await this.logEvent('FAILURE', error.message);
  }

  private async transitionTo(newState: CircuitBreakerState): Promise<void> {
    const oldState = await this.getState();

    await this.cacheService.set(
      `circuit_breaker:${this.serviceName}:state`,
      newState,
      this.config.halfOpenTimeout / 1000,
    );

    this.logger.log(`Circuit breaker: ${oldState} -> ${newState}`);

    const eventType =
      newState === CircuitBreakerState.OPEN
        ? 'OPENED'
        : newState === CircuitBreakerState.HALF_OPEN
          ? 'HALF_OPENED'
          : 'CLOSED';

    await this.logEvent(eventType, null);
  }

  private async reset(): Promise<void> {
    await this.cacheService.delete(
      `circuit_breaker:${this.serviceName}:failures`,
    );
    await this.cacheService.delete(
      `circuit_breaker:${this.serviceName}:successes`,
    );
    await this.cacheService.delete(
      `circuit_breaker:${this.serviceName}:last_failure`,
    );
  }

  private async logEvent(
    eventType: string,
    errorMessage: string | null,
  ): Promise<void> {
    try {
      // await this.campaignClient.logCircuitBreakEvent(
      //   this.serviceName,
      //   eventType,
      //   errorMessage,
      // );
      // await this.prisma.circuitBreakerEvent.create({
      //   data: {
      //     serviceName: this.serviceName,
      //     eventType: eventType,
      //     errorMessage,
      //   },
      // });
    } catch (error) {
      this.logger.error(
        `Failed to log circuit breaker event: ${error.message}`,
      );
    }
  }

  async getStatus() {
    return {
      state: await this.getState(),
      failureCount: await this.getFailureCount(),
      successCount: await this.getSuccessCount(),
      lastFailure: await this.getLastFailureTime(),
    };
  }
}
