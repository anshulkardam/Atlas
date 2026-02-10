import { Test, TestingModule } from '@nestjs/testing';
import { EnrichService } from './enrich.service';

describe('EnrichService', () => {
  let service: EnrichService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnrichService],
    }).compile();

    service = module.get<EnrichService>(EnrichService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
