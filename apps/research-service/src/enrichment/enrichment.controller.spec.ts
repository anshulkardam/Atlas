import { Test, TestingModule } from '@nestjs/testing';
import { EnrichmentController } from './enrichment.controller';
import { EnrichmentService } from './enrichment.service';

describe('EnrichmentController', () => {
  let controller: EnrichmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrichmentController],
      providers: [EnrichmentService],
    }).compile();

    controller = module.get<EnrichmentController>(EnrichmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
