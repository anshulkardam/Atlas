import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { Person, AgentProgress, EnrichmentData } from "@/types/entities";
import { useWebSocket } from "@/api/ws";

interface EnrichmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  jobId?: string;
}

const getCircuitBreakerColor = (state: string) => {
  switch (state) {
    case "CLOSED":
      return "bg-green-100 text-green-800";
    case "OPEN":
      return "bg-red-100 text-red-800";
    case "HALF_OPEN":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const EnrichmentDataDisplay = ({ data }: { data: EnrichmentData }) => {
  if (!data) return null;

  const currentProgress = useWebSocket(jobId ?? null);

  const getProgressPercentage = () => {
    if (!currentProgress) return 0;
    return Math.round((currentProgress.iteration / currentProgress.totalIterations) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Enrichment Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.companyValueProp && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Company Value Proposition</h4>
            <p className="text-sm text-gray-600">{data.companyValueProp}</p>
          </div>
        )}
        {data.productNames && data.productNames.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Products/Services</h4>
            <div className="flex flex-wrap gap-1">
              {data.productNames.map((product, index) => (
                <Badge key={index} variant="outline">
                  {product}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {data.pricingModel && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Pricing Model</h4>
            <p className="text-sm text-gray-600">{data.pricingModel}</p>
          </div>
        )}
        {data.keyCompetitors && data.keyCompetitors.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Key Competitors</h4>
            <div className="flex flex-wrap gap-1">
              {data.keyCompetitors.map((competitor, index) => (
                <Badge key={index} variant="secondary">
                  {competitor}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {data.recentNews && data.recentNews.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Recent News</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              {data.recentNews.map((news, index) => (
                <li key={index}>{news}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function EnrichmentModal({ isOpen, onClose, person, jobId }: EnrichmentModalProps) {
  const { subscribeToJob, unsubscribeFromJob, getJobProgress } = useWebSocket();
  const [currentProgress, setCurrentProgress] = useState<AgentProgress | null>(null);

  useEffect(() => {
    console.log("EnrichmentModal useEffect:", { isOpen, jobId });
    if (isOpen && jobId) {
      console.log("Subscribing to job:", jobId);
      subscribeToJob(jobId);
    }

    return () => {
      if (jobId) {
        console.log("Unsubscribing from job:", jobId);
        unsubscribeFromJob(jobId);
      }
    };
  }, [isOpen, jobId, subscribeToJob, unsubscribeFromJob]);

  useEffect(() => {
    if (jobId) {
      const progress = getJobProgress(jobId);
      console.log("Progress for job", jobId, ":", progress);
      setCurrentProgress(progress);
    }
  }, [jobId, getJobProgress]);

  const getProgressPercentage = () => {
    if (!currentProgress) return 0;
    return Math.round((currentProgress.iteration / currentProgress.totalIterations) * 100);
  };

  const isComplete = currentProgress?.complete;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Enriching {person?.fullName}
            {person?.company?.name && ` at ${person.company.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                {currentProgress
                  ? `${currentProgress.iteration}/${currentProgress.totalIterations} iterations`
                  : "Starting..."}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="w-full" />
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2">
            <Badge
              className={getCircuitBreakerColor(currentProgress?.circuitBreakerState || "CLOSED")}
            >
              Circuit: {currentProgress?.circuitBreakerState || "CLOSED"}
            </Badge>
            <Badge variant={currentProgress?.cacheHit ? "default" : "secondary"}>
              {currentProgress?.cacheHit ? "Cache Hit" : "Cache Miss"}
            </Badge>
            {isComplete && <Badge className="bg-green-100 text-green-800">Complete</Badge>}
          </div>

          {/* Current Query */}
          {currentProgress?.currentQuery && !isComplete && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Current Search Query</h4>
              <div className="p-3 bg-gray-100 rounded-md">
                <code className="text-sm">{currentProgress.currentQuery}</code>
              </div>
            </div>
          )}

          {/* Fields Progress */}
          {currentProgress && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Fields Found</h4>
                <div className="flex flex-wrap gap-1">
                  {currentProgress.fieldsFound.length > 0 ? (
                    currentProgress.fieldsFound.map((field, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800">
                        {field}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">None yet</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Fields Remaining</h4>
                <div className="flex flex-wrap gap-1">
                  {currentProgress.fieldsRemaining.length > 0 ? (
                    currentProgress.fieldsRemaining.map((field, index) => (
                      <Badge key={index} variant="outline">
                        {field}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">All complete!</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Iteration Log */}
          {currentProgress && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Iteration Log</h4>
              <ScrollArea className="h-32 w-full rounded-md border">
                <div className="p-3 space-y-1">
                  <div className="text-sm">
                    <strong>Iteration {currentProgress.iteration}:</strong>{" "}
                    {currentProgress.currentQuery}
                    {currentProgress.cacheHit && (
                      <Badge className="ml-2" variant="outline">
                        Cache Hit
                      </Badge>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Error Display */}
          {currentProgress?.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">Error: {currentProgress.error}</p>
            </div>
          )}

          {/* Final Results */}
          {isComplete && currentProgress.data && (
            <EnrichmentDataDisplay data={currentProgress.data} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
