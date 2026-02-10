import { Test, TestingModule } from '@nestjs/testing';
import { EnrichController } from './enrich.controller';
import { EnrichService } from './enrich.service';

describe('EnrichController', () => {
  let controller: EnrichController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrichController],
      providers: [EnrichService],
    }).compile();

    controller = module.get<EnrichController>(EnrichController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
