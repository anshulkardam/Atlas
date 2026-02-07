import { Injectable } from '@nestjs/common';
import { CreateEnrichmentDto } from './dto/create-enrichment.dto';
import { UpdateEnrichmentDto } from './dto/update-enrichment.dto';

@Injectable()
export class EnrichmentService {
  create(createEnrichmentDto: CreateEnrichmentDto) {
    return 'This action adds a new enrichment';
  }

  findAll() {
    return `This action returns all enrichment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} enrichment`;
  }

  update(id: number, updateEnrichmentDto: UpdateEnrichmentDto) {
    return `This action updates a #${id} enrichment`;
  }

  remove(id: number) {
    return `This action removes a #${id} enrichment`;
  }
}
