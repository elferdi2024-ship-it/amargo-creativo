// filepath: src/components/admin/ProjectHealth.tsx
import { useState } from "react";
import { healthLabel, healthColor, daysSince, type HealthStatus } from "../../lib/health";

interface Props {
  projectId: string;
  initialHealth?: HealthStatus | string;
  lastCheckinAt?: string | null;
  updatedAt?: string;
  compact?: boolean;
}

export default function ProjectHealth({
  projectId,
  initialHealth = "green",
  lastCheckinAt,
  updatedAt = new Date().toISOString(),
  compact = false,
}: Props) {
  const [status, setStatus] = useState<string>(initialHealth);
  const [lastCheckin, setLastCheckin] = useState<string | null | undefined>(lastCheckinAt);
  const [loading, setLoading] = useState(false);

  const days = daysSince(lastCheckin || updatedAt);

  async function handleCheckin(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const res = await fetch("/api/project-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("green");
        setLastCheckin(new Date().toISOString());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const dotColor = healthColor(status);

  if (compact) {
    return (
      <div className="health-compact" title={`Salud: ${healthLabel(status)} (${days}d sin check-in)`}>
        <span className="health-dot" style={{ background: dotColor }} />
        <button
          type="button"
          onClick={handleCheckin}
          disabled={loading}
          className="btn-tiny-checkin"
          title="Registrar check-in hoy"
        >
          {loading ? "…" : "Check-in"}
        </button>

        <style>{`
          .health-compact {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
          }
          .health-dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 5px currentColor;
          }
          .btn-tiny-checkin {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid var(--adm-border, #24352A);
            color: var(--adm-ink, #F4F6F2);
            font-size: 0.68rem;
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            cursor: pointer;
          }
          .btn-tiny-checkin:hover {
            border-color: var(--adm-lime, #C8FF00);
            color: var(--adm-lime, #C8FF00);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="health-box">
      <div className="health-indicator">
        <span className="health-dot-lg" style={{ background: dotColor, color: dotColor }} />
        <div className="health-text">
          <strong style={{ color: dotColor }}>{healthLabel(status)}</strong>
          <span className="health-sub">
            {days === 0 ? "Check-in realizado hoy" : `Hace ${days} ${days === 1 ? "día" : "días"} sin check-in`}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCheckin}
        disabled={loading}
        className="btn-checkin"
      >
        {loading ? "Registrando..." : "✓ Registrar Check-in"}
      </button>

      <style>{`
        .health-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #111C14;
          border: 1px solid var(--adm-border, #24352A);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          gap: 1rem;
        }

        .health-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .health-dot-lg {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px currentColor;
          flex-shrink: 0;
        }

        .health-text {
          display: flex;
          flex-direction: column;
        }

        .health-text strong {
          font-size: 0.85rem;
        }

        .health-sub {
          font-size: 0.75rem;
          color: var(--adm-mute, #85968B);
        }

        .btn-checkin {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid var(--adm-border, #24352A);
          color: var(--adm-ink, #F4F6F2);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-checkin:hover:not(:disabled) {
          background: rgba(200, 255, 0, 0.15);
          border-color: var(--adm-lime, #C8FF00);
          color: var(--adm-lime, #C8FF00);
        }

        .btn-checkin:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
