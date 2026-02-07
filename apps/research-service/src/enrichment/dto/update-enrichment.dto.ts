import { PartialType } from '@nestjs/mapped-types';
import { CreateEnrichmentDto } from './create-enrichment.dto';

export class UpdateEnrichmentDto extends PartialType(CreateEnrichmentDto) {}
