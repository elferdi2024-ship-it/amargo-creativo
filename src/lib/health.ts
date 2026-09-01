// filepath: src/lib/health.ts
export type HealthStatus = "green" | "yellow" | "red";

export function calculateHealth(lastCheckin: string | null | undefined, updatedAt: string): HealthStatus {
  const last = lastCheckin ? new Date(lastCheckin) : new Date(updatedAt);
  const diffMs = Date.now() - last.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);

  if (days <= 7) return "green";
  if (days <= 14) return "yellow";
  return "red";
}

export function daysSince(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function healthLabel(status: string): string {
  switch (status) {
    case "green":
      return "Al día";
    case "yellow":
      return "Requiere atención";
    case "red":
      return "Estancado / Urgente";
    default:
      return status;
  }
}

export function healthColor(status: string): string {
  switch (status) {
    case "green":
      return "#10B981";
    case "yellow":
      return "#F59E0B";
    case "red":
      return "#EF4444";
    default:
      return "#85968B";
  }
}
