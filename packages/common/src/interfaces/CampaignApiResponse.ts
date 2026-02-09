export interface getCampaignsApiResponse {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
[];

export interface getCompanyByIdApiResponse {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  campaignId: string;
}

export interface getPeopleList {
  id: string;
  fullName: string;
  email: string;
  title: string;
  enrichmentStatus: string;
  lastEnrichedAt: string;
  enrichmentJobId: string | null;
  retry_count: number;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
}
[];

export interface getPeopleDetailsById {
  id: string;
  fullName: string;
  email: string;
  title: string;
  enrichmentStatus: string;
  lastEnrichedAt: string;
  enrichmentJobId: string | null;
  retry_count: number;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    domain: string;
    createdAt: string;
    updatedAt: string;
    campaignId: string;
  };
}

export interface CircuitBreakerApiResponse {
  state: string;
  failureCount: number;
  lastFailure: number | null;
}
