import { type Person } from "@/types/entities";
import { useWebSocket } from "@/api/ws";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  person: Person | null;
};

export function EnrichModal({ open, onClose, person }: Props) {
  const [isEnriching, setIsEnriching] = useState(false);
  const { subscribeToJob, unsubscribeFromJob, getJobProgress, isConnected } =
    useWebSocket();

  useEffect(() => {
    if (open && person?.enrichmentJobId) {
      const jobId = person.enrichmentJobId;
      subscribeToJob(jobId);
      return () => {
        unsubscribeFromJob(jobId);
      };
    }
  }, [open, person?.enrichmentJobId, subscribeToJob, unsubscribeFromJob]);

  const progress = person?.enrichmentJobId
    ? getJobProgress(person.enrichmentJobId)
    : null;
  const progressPercentage = progress
    ? (progress.iteration / progress.totalIterations) * 100
    : 0;

  const handleReEnrich = async () => {
    if (!person) return;

    setIsEnriching(true);
    try {
      // API call to start enrichment would go here
      console.log("Starting enrichment for:", person.id);
    } catch (error) {
      console.error("Failed to start enrichment:", error);
    } finally {
      setIsEnriching(false);
    }
  };

  if (!open || !person) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Enrich Person</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1">
          <p className="font-medium">{person.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {person.title} · {person.company?.name}
          </p>
        </div>

        <div className="border rounded p-3 text-sm">
          <div className="flex items-center gap-2">
            Status: <strong>{person.enrichmentStatus}</strong>
            {!isConnected && (
              <span className="text-red-500 text-xs">
                (WebSocket disconnected)
              </span>
            )}
          </div>
        </div>

        {/* Progress Section */}
        {(person.enrichmentStatus === "IN_PROGRESS" || progress) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Enrichment Progress</span>
              <span className="text-muted-foreground">
                {progress
                  ? `${progress.iteration}/${progress.totalIterations}`
                  : "Starting..."}
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />

            {progress && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Current: {progress.currentQuery}</p>
                <p>Fields found: {progress.fieldsFound.join(", ") || "None"}</p>
                {progress.error && (
                  <p className="text-red-500">Error: {progress.error}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Enriched Data Display */}
        {person.enrichmentStatus === "COMPLETE" && progress?.data && (
          <div className="space-y-2 text-sm border rounded p-3">
            <h3 className="font-medium">Enriched Data</h3>
            {progress.data.companyValueProp && (
              <p>
                <strong>Value Proposition:</strong>{" "}
                {progress.data.companyValueProp}
              </p>
            )}
            {progress.data.productNames &&
              progress.data.productNames.length > 0 && (
                <p>
                  <strong>Products:</strong>{" "}
                  {progress.data.productNames.join(", ")}
                </p>
              )}
            {progress.data.pricingModel && (
              <p>
                <strong>Pricing:</strong> {progress.data.pricingModel}
              </p>
            )}
            {progress.data.keyCompetitors &&
              progress.data.keyCompetitors.length > 0 && (
                <p>
                  <strong>Competitors:</strong>{" "}
                  {progress.data.keyCompetitors.join(", ")}
                </p>
              )}
            {progress.data.recentNews &&
              progress.data.recentNews.length > 0 && (
                <p>
                  <strong>Recent News:</strong>{" "}
                  {progress.data.recentNews.join(", ")}
                </p>
              )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-2 border rounded hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-3 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
            onClick={handleReEnrich}
            disabled={isEnriching || person.enrichmentStatus === "IN_PROGRESS"}
          >
            {isEnriching ? "Starting..." : "Re-Enrich"}
          </button>
        </div>
      </div>
    </div>
  );
}
