export type User = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  provider: "LOCAL" | "GOOGLE";
  providerId?: string;
};

export type Campaign = {
  id: string;
  name: string;
  status: "ACTIVE" | "STOPPED";
  userId: string;
  createdAt: string;
};

export type Company = {
  id: string;
  name: string;
  domain: string;
  campaignId: string;
  createdAt: string;
};

export type Person = {
  id: string;
  fullName: string;
  email: string;
  title: string;
  enrichmentStatus: "PENDING" | "IN_PROGRESS" | "COMPLETE" | "FAILED";
  lastEnrichedAt?: string;
  enrichmentJobId?: string;
  retryCount: number;
  companyId: string;
  createdAt: string;
  company?: Company;
};

export type ContextSnippet = {
  id: string;
  entityType: "PERSON" | "COMPANY";
  entityId: string;
  snippetType:
    | "COMPANY_VALUE_PROP"
    | "PRODUCT_NAMES"
    | "PRICING_MODEL"
    | "KEY_COMPETITORS"
    | "RECENT_NEWS";
  payload: any;
  sourceUrls: string[];
  confidenceScore: number;
  cacheHitRatio: number;
  createdAt: string;
};

export type SearchLog = {
  id: string;
  contextSnippetId: string;
  iteration: number;
  query: string;
  topResults: any;
  cacheHit: boolean;
  circuitBreakerState: string;
  responseTimeMs: number;
  createdAt: string;
};

export type EnrichmentData = {
  companyValueProp?: string;
  productNames?: string[];
  pricingModel?: string;
  keyCompetitors?: string[];
  recentNews?: string[];
};

export type AgentProgress = {
  iteration: number;
  totalIterations: number;
  currentQuery: string;
  fieldsFound: string[];
  fieldsRemaining: string[];
  cacheHit: boolean;
  circuitBreakerState: string;
  complete?: boolean;
  data?: EnrichmentData;
  error?: string;
};

export type CircuitBreakerStatus = {
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failures: number;
  lastFailure?: string;
  successRate: number;
};
