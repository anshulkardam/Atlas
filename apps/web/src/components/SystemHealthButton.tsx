type SystemHealthStatus = "operational" | "degraded" | "down";

const STATUS_CONFIG: Record<SystemHealthStatus, {
  label: string;
  color: string;
  pulse: string;
}> = {
  operational: {
    label: "System Operational",
    color: "bg-green-500",
    pulse: "bg-green-500/40",
  },
  degraded: {
    label: "Degraded Performance",
    color: "bg-yellow-500",
    pulse: "bg-yellow-500/40",
  },
  down: {
    label: "System Issues Detected",
    color: "bg-red-500",
    pulse: "bg-red-500/40",
  },
};

export function SystemHealthButton({
  status,
  onClick,
}: {
  status: SystemHealthStatus;
  onClick?: () => void;
}) {
  const { label, color, pulse } = STATUS_CONFIG[status];

  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center gap-3 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
    >
      {/* Pulse */}
      <span className="relative flex h-3 w-3">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pulse}`}
        />
        <span
          className={`relative inline-flex h-3 w-3 rounded-full ${color}`}
        />
      </span>

      {label}
    </button>
  );
}
