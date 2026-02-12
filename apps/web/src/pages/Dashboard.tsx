import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeopleDataTable } from "@/components/PeopleDataTable";
import { CircuitBreakerDashboard } from "@/components/CircuitBreakerDashboard";
import { EnrichmentModal } from "@/components/EnrichmentModal";
import type { Person } from "@/types/entities";
import { usePeople } from "@/api/entities";

const Dashboard = () => {
  const { data: people } = usePeople();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [enrichmentModalOpen, setEnrichmentModalOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string>();

  const handleCloseEnrichmentModal = () => {
    setEnrichmentModalOpen(false);
    setSelectedPerson(null);
    setActiveJobId(undefined);
  };

  const completedCount =
    people?.filter((p) => p.enrichmentStatus === "COMPLETE").length || 0;
  const inProgressCount =
    people?.filter((p) => p.enrichmentStatus === "IN_PROGRESS").length || 0;
  const pendingCount =
    people?.filter((p) => p.enrichmentStatus === "PENDING").length || 0;
  const failedCount =
    people?.filter((p) => p.enrichmentStatus === "FAILED").length || 0;
  const totalCount = people?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Contact Enrichment Dashboard</h1>
          <p className="text-gray-600">
            Manage and enrich your contact information with automated research
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">
              Total Contacts
            </h3>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {completedCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
            <p className="text-2xl font-bold text-blue-600">
              {inProgressCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-gray-600">{pendingCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Failed</h3>
            <p className="text-2xl font-bold text-red-600">{failedCount}</p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="people" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="people">People & Contacts</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">People Management</h2>
                <p className="text-sm text-gray-600">
                  {totalCount} contact{totalCount !== 1 ? "s" : ""} found
                </p>
              </div>
              <PeopleDataTable
                onEnrichStart={(person, jobId) => {
                  setSelectedPerson(person);
                  setActiveJobId(jobId);
                  setEnrichmentModalOpen(true);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">System Health</h2>
                <p className="text-sm text-gray-600">
                  Monitor the health and performance of the enrichment system
                </p>
              </div>
              <CircuitBreakerDashboard />
            </div>
          </TabsContent>
        </Tabs>

        {/* Enrichment Modal */}
        <EnrichmentModal
          isOpen={enrichmentModalOpen}
          onClose={handleCloseEnrichmentModal}
          person={selectedPerson}
          jobId={activeJobId}
        />
      </div>
    </div>
  );
};

export default Dashboard;
