import type { Person } from "@/types/entities";
import type { ColumnDef } from "@tanstack/react-table";

export const getPeopleColumns = (onEnrichClick: (person: Person) => void): ColumnDef<Person>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<Person["status"]>();
      return <span className="text-xs px-2 py-1 rounded border">{status}</span>;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <button onClick={() => onEnrichClick(row.original)} className="text-sm underline">
        Enrich
      </button>
    ),
  },
];
