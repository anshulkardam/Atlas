import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/authFetch";
import type {
  Campaign,
  Company,
  Person,
  ContextSnippet,
} from "@/types/entities";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useCampaigns = () => {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async (): Promise<Campaign[]> => {
      const response = await authFetch(`${API_BASE}/campaigns`);
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      return response.json();
    },
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: async (): Promise<Company> => {
      const response = await authFetch(`${API_BASE}/companies/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company");
      }
      return response.json();
    },
    enabled: !!id,
  });
};

export const usePeople = () => {
  return useQuery({
    queryKey: ["people"],
    queryFn: async (): Promise<Person[]> => {
      const response = await authFetch(`${API_BASE}/people`);
      if (!response.ok) {
        throw new Error("Failed to fetch people");
      }
      const data = await response.json();
      return data || [];
    },
  });
};

export const usePerson = (id: string) => {
  return useQuery({
    queryKey: ["person", id],
    queryFn: async (): Promise<Person> => {
      const response = await authFetch(`${API_BASE}/people/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch person");
      }
      return response.json();
    },
    enabled: !!id,
  });
};

export const useEnrichPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personId: string): Promise<{ jobId: string }> => {
      console.log("Starting enrichment for person:", personId);
      console.log("API Base URL:", API_BASE);

      const response = await authFetch(
        `${API_BASE}/people/${personId}/enrich`,
        {
          method: "POST",
        },
      );
      console.log("Enrichment response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("Enrichment error:", error);
        throw new Error(error.message || "Failed to start enrichment");
      }
      const result = await response.json();
      console.log("Enrichment result:", result);
      return result;
    },
    onSuccess: (_, personId) => {
      queryClient.invalidateQueries({ queryKey: ["person", personId] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
};

export const useContextSnippets = (personId: string) => {
  return useQuery({
    queryKey: ["snippets", personId],
    queryFn: async (): Promise<ContextSnippet[]> => {
      const response = await authFetch(
        `${API_BASE}/snippets/person/${personId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch context snippets");
      }
      const data = await response.json();
      return data || [];
    },
    enabled: !!personId,
  });
};

export const useJobStatus = (jobId: string) => {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const response = await authFetch(`${API_BASE}/jobs/${jobId}/status`);
      if (!response.ok) {
        throw new Error("Failed to fetch job status");
      }
      return response.json();
    },
    enabled: !!jobId,
    refetchInterval: 2000, // Refetch every 2 seconds
  });
};

export const useCircuitBreakerStatus = () => {
  return useQuery({
    queryKey: ["circuit-breaker"],
    queryFn: async () => {
      const response = await authFetch(`${API_BASE}/circuit-breaker/status`);
      if (!response.ok) {
        throw new Error("Failed to fetch circuit breaker status");
      }
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

