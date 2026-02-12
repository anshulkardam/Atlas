import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton"; 
import { useState } from "react";
import { toast } from "sonner";
import type { Person } from "@/types/entities";
import { useEnrichPerson, usePeople } from "@/api/entities";

interface PeopleDataTableProps {
  onEnrichStart?: (person: Person, jobId?: string) => void;
}

const getStatusBadge = (status: Person["enrichmentStatus"]) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Pending
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Processing
        </Badge>
      );
    case "COMPLETE":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      );
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString();
};

export function PeopleDataTable({ onEnrichStart }: PeopleDataTableProps) {
  const { data: people, isLoading, error } = usePeople();
  const enrichPerson = useEnrichPerson();
  const [enrichingPersonId, setEnrichingPersonId] = useState<string | null>(
    null,
  );

  const handleEnrich = async (person: Person) => {
    if (person.enrichmentStatus === "IN_PROGRESS") {
      toast.error("Enrichment already in progress");
      return;
    }

    setEnrichingPersonId(person.id);
    try {
      const result = await enrichPerson.mutateAsync(person.id);
      toast.success("Enrichment started successfully");

      // Call the callback to open the modal with the job ID
      if (onEnrichStart) {
        onEnrichStart(person, result.jobId);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start enrichment",
      );
    } finally {
      setEnrichingPersonId(null);
    }
  };

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Error loading people: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-full" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!people || people.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No people found. Create some contacts to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Enriched</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => (
            <TableRow key={person.id}>
              <TableCell className="font-medium">{person.fullName}</TableCell>
              <TableCell>{person.email}</TableCell>
              <TableCell>{person.company?.name || "N/A"}</TableCell>
              <TableCell>{person.title || "N/A"}</TableCell>
              <TableCell>{getStatusBadge(person.enrichmentStatus)}</TableCell>
              <TableCell>{formatDate(person.lastEnrichedAt)}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => handleEnrich(person)}
                  disabled={
                    person.enrichmentStatus === "IN_PROGRESS" ||
                    enrichingPersonId === person.id
                  }
                  variant={
                    person.enrichmentStatus === "COMPLETE"
                      ? "outline"
                      : "default"
                  }
                >
                  {enrichingPersonId === person.id
                    ? "Starting..."
                    : person.enrichmentStatus === "COMPLETE"
                      ? "Re-enrich"
                      : "Enrich"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
