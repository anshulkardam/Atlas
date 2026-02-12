import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCircuitBreakerStatus } from "@/api/entities";
import { Skeleton } from "@/components/ui/skeleton";
import type { CircuitBreakerStatus } from "@/types/entities";

const getStateColor = (state: CircuitBreakerStatus["state"]) => {
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

const getStateDescription = (state: CircuitBreakerStatus["state"]) => {
  switch (state) {
    case "CLOSED":
      return "Normal operation - requests are flowing normally";
    case "OPEN":
      return "Circuit is open - requests are blocked and using fallback";
    case "HALF_OPEN":
      return "Testing service - limited requests are allowed";
    default:
      return "Unknown state";
  }
};

const formatLastFailure = (lastFailure?: string) => {
  if (!lastFailure) return "No failures";
  return new Date(lastFailure).toLocaleString();
};

export function CircuitBreakerDashboard() {
  const { data: status, isLoading, error, refetch } = useCircuitBreakerStatus();

  const handleManualRefetch = () => {
    refetch();
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Circuit Breaker Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">
              Error loading circuit breaker status
            </p>
            <Button onClick={handleManualRefetch} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Circuit Breaker Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-36" />
        </CardContent>
      </Card>
    );
  }

  const isHealthy = status.state === "CLOSED" && status.failures === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Circuit Breaker Status</CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant={isHealthy ? "default" : "destructive"}
            className="text-xs"
          >
            {isHealthy ? "Healthy" : "Degraded"}
          </Badge>
          <Button
            onClick={handleManualRefetch}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current State */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Current State</h4>
          <div className="flex items-center gap-2">
            <Badge className={getStateColor(status.state)}>
              {status.state}
            </Badge>
            <span className="text-sm text-gray-600">
              {getStateDescription(status.state)}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Failure Count</h4>
            <p className="text-2xl font-bold text-red-600">{status.failures}</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Success Rate</h4>
            <p className="text-2xl font-bold text-green-600">
              {Math.round(status.successRate * 100)}%
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Additional Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Last Failure:</strong>{" "}
              {formatLastFailure(status.lastFailure)}
            </p>
            <p>
              <strong>Threshold:</strong> 3 consecutive failures trigger opening
            </p>
            <p>
              <strong>Recovery:</strong> Half-open after 30 seconds, closes
              after 2 successes
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Status Timeline</h4>
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>CLOSED: Normal operation</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>OPEN: Circuit open after 3 failures</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>HALF_OPEN: Testing recovery</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex gap-2">
            <Button onClick={handleManualRefetch} variant="outline" size="sm">
              Check Status
            </Button>
            <Button variant="outline" size="sm" disabled>
              Admin Controls
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
