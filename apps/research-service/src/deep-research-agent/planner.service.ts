import { Injectable } from '@nestjs/common';
import { GeminiService } from 'src/gemini/gemini.service';
import { RequiredField } from './deep-research-agent.service';

@Injectable()
export class PlannerService {
  constructor(private readonly gemini: GeminiService) {}

  async generateQuery(Name: string, missingFields: string[]): Promise<string> {
    const prompt = `
You are a research assistant.

Company: ${Name}
Missing fields: ${missingFields.join(', ')}

Generate a concise Google search query to enrich missing fields data. Just give the query and nothing else.
    `;

    const response = await this.gemini.generate(prompt, {
      temperature: 0.2,
      maxTokens: 100,
    });

    return response.replace(/["`\n]/g, '').trim();
  }

  buildDeterministicQuery(company: string, field: RequiredField) {
    switch (field) {
      case 'companyValueProp':
        return `${company} company value proposition`;
      case 'productNames':
        return `${company} products list`;
      case 'pricingModel':
        return `${company} pricing model`;
      case 'keyCompetitors':
        return `${company} competitors`;
      case 'recentNews':
        return `${company} recent news 2025`;
    }
  }
}
