import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from 'src/gemini/gemini.service';
import {
  EnrichmentResult,
  enrichmentSchema,
} from './schemas/enrichment.schema';

@Injectable()
export class ExtractorService {
  private readonly logger = new Logger(ExtractorService.name);

  constructor(private readonly gemini: GeminiService) {}

  async extract(content: string): Promise<EnrichmentResult | null> {
    const systemInstruction =
      'You are a specialized Business Intelligence agent. Extract structured data from provided content. If a value is missing, return null.';

    const prompt = `Analyze the following content and extract business details:\n\n${content.slice(0, 12000)}`;

    try {
      const parsed = await this.gemini.generateStructuredJSON(
        prompt,
        enrichmentSchema,
        systemInstruction,
      );

      return parsed;
    } catch (error) {
      this.logger.error('Structured extraction failed', error);
      return null;
    }
  }
}
