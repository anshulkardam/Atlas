import type { Person } from "@/types/entities";
import type { ColumnDef } from "@tanstack/react-table";

export const getPeopleColumns = (
  onEnrichClick: (person: Person) => void,
): ColumnDef<Person>[] => [
  {
    accessorKey: "fullName",
    header: "Name",
  },
  {
    accessorKey: "company.name",
    header: "Company",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "enrichmentStatus",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<Person["enrichmentStatus"]>();
      return <span className="text-xs px-2 py-1 rounded border">{status}</span>;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <button
        onClick={() => onEnrichClick(row.original)}
        className="text-sm underline"
      >
        Enrich
      </button>
    ),
  },
];
