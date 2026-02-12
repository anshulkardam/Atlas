import { Test, TestingModule } from '@nestjs/testing';
import { CircuitBreakerController } from './circuit-breaker.controller.js';

describe('CircuitBreakerController', () => {
  let controller: CircuitBreakerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CircuitBreakerController],
    }).compile();

    controller = module.get<CircuitBreakerController>(CircuitBreakerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
