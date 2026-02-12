import { z } from 'zod';

export const enrichmentSchema = z.object({
  companyValueProp: z.string().nullable().optional(),
  productNames: z.array(z.string()).nullable().optional(),
  pricingModel: z.string().nullable().optional(),
  keyCompetitors: z.array(z.string()).nullable().optional(),
  recentNews: z.array(z.string()).nullable().optional(),
});

export type EnrichmentResult = z.infer<typeof enrichmentSchema>;
