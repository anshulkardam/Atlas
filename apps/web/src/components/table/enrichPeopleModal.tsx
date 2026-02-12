import { type Person } from "@/types/entities";

type Props = {
  open: boolean;
  onClose: () => void;
  person: Person | null;
};

export function EnrichModal({ open, onClose, person }: Props) {
  if (!open || !person) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Enrich Person</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="space-y-1">
          <p className="font-medium">{person.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {person.title} · {person.company?.name}
          </p>
        </div>

        <div className="border rounded p-3 text-sm">
          Status: <strong>{person.enrichmentStatus}</strong>
        </div>

        {/* placeholder for enriched data */}
        {person.enrichmentStatus === "COMPLETE" && (
          <div className="space-y-2 text-sm">
            <p>Email: {person.email}</p>
            {/* more fields later */}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button className="px-3 py-2 border rounded" onClick={onClose}>
            Close
          </button>
          <button className="px-3 py-2 bg-black text-white rounded">
            Re-Enrich
          </button>
        </div>
      </div>
    </div>
  );
}
