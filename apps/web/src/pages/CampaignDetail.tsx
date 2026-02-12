import { useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { getPeopleColumns } from "@/components/table/peopleColumns";
import type { Person } from "@/types/entities";
import { EnrichModal } from "@/components/table/enrichPeopleModal";

const mockData: Person[] = [
  {
    id: "1",
    fullName: "John Doe",
    title: "CTO",
    enrichmentStatus: "PENDING",
    companyId: "1",
    email: "john@acme.com",
    retryCount: 0,
    createdAt: new Date().toISOString(),
    company: {
      id: "1",
      name: "Acme Inc",
      domain: "acme.com",
      campaignId: "1",
      createdAt: new Date().toISOString(),
    },
  },
];

export default function CampaignDetail() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const columns = getPeopleColumns((person) => {
    setSelectedPerson(person);
    setModalOpen(true);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Campaign: SaaS Founders</h1>

      <DataTable data={mockData} columns={columns} />

      <EnrichModal
        open={modalOpen}
        person={selectedPerson}
        onClose={() => {
          setModalOpen(false);
          setSelectedPerson(null);
        }}
      />
    </div>
  );
}
