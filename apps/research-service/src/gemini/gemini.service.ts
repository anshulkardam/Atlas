import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ZodType } from 'zod';
import { EnrichmentResult } from 'src/deep-research-agent/schemas/enrichment.schema';

interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not set');
      throw new Error('GEMINI_API_KEY is not set');
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          temperature: options?.temperature ?? 0.2,
          maxOutputTokens: options?.maxTokens ?? 512,
        },
      });

      const response = result.text?.trim() ?? '';

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Gemini generation failed: ${message}`);
      throw error;
    }
  }

  async generateStructuredJSON(
    prompt: string,
    schema: ZodType,
    systemInstruction: string,
  ): Promise<EnrichmentResult> {
    try {
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseJsonSchema: schema.toJSONSchema(),
          systemInstruction,
        },
      });

      console.log('ceec', result.text);

      const response = schema.parse(
        JSON.parse(result.text ?? ''),
      ) as EnrichmentResult;

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Gemini generation failed: ${message}`);
      throw error;
    }
  }
}
