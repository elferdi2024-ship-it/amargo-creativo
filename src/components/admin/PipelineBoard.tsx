// filepath: src/components/admin/PipelineBoard.tsx
import { useState } from "react";
import { formatMoney, formatDate } from "../../lib/format";
import { daysSince } from "../../lib/health";

export interface PipelineItem {
  id: string;
  type: "proposal" | "project";
  title: string;
  clientName: string;
  clientCompany?: string;
  status: string;
  amount?: number;
  currency?: string;
  createdAt: string;
  slug?: string;
  proposalId?: string;
}

interface Props {
  initialProposals: any[];
  initialProjects: any[];
}

export default function PipelineBoard({ initialProposals = [], initialProjects = [] }: Props) {
  const [proposals, setProposals] = useState(initialProposals);
  const [projects, setProjects] = useState(initialProjects);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Columnas calculadas
  const colSent = proposals.filter((p) => p.status === "active");
  const colAccepted = proposals.filter((p) => p.status === "accepted");
  const colActive = projects.filter((pr) => pr.status === "active");
  const colFinished = projects.filter((pr) => pr.status === "finished");

  async function updateProposalStatus(id: string, newStatus: string) {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/proposals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        setProposals((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
      }
    } catch {
      alert("Error al actualizar propuesta");
    } finally {
      setLoadingId(null);
    }
  }

  async function updateProjectStatus(id: string, newStatus: string) {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        setProjects((prev) =>
          prev.map((pr) => (pr.id === id ? { ...pr, status: newStatus } : pr))
        );
      }
    } catch {
      alert("Error al actualizar proyecto");
    } finally {
      setLoadingId(null);
    }
  }

  const columns = [
    {
      id: "sent",
      title: "1. Propuesta Enviada",
      subtitle: "Links activos en decisión",
      color: "#97BC62",
      items: colSent.map((p) => ({
        id: p.id,
        type: "proposal" as const,
        title: p.project_title,
        clientName: p.clients?.name || "Sin cliente",
        clientCompany: p.clients?.company,
        status: p.status,
        amount: p.investment?.amount,
        currency: p.investment?.currency || "USD",
        createdAt: p.created_at,
        slug: p.slug,
      })),
    },
    {
      id: "accepted",
      title: "2. Propuesta Aceptada",
      subtitle: "Confirmadas por el cliente",
      color: "#C8FF00",
      items: colAccepted.map((p) => ({
        id: p.id,
        type: "proposal" as const,
        title: p.project_title,
        clientName: p.clients?.name || "Sin cliente",
        clientCompany: p.clients?.company,
        status: p.status,
        amount: p.investment?.amount,
        currency: p.investment?.currency || "USD",
        createdAt: p.accepted_at || p.created_at,
        slug: p.slug,
      })),
    },
    {
      id: "active",
      title: "3. En Desarrollo",
      subtitle: "Proyectos en ejecución",
      color: "#10B981",
      items: colActive.map((pr) => ({
        id: pr.id,
        type: "project" as const,
        title: pr.title,
        clientName: pr.clients?.name || "Sin cliente",
        clientCompany: pr.clients?.company,
        status: pr.status,
        createdAt: pr.created_at,
      })),
    },
    {
      id: "finished",
      title: "4. Finalizado",
      subtitle: "Listos para generar contenido",
      color: "#85968B",
      items: colFinished.map((pr) => ({
        id: pr.id,
        type: "project" as const,
        title: pr.title,
        clientName: pr.clients?.name || "Sin cliente",
        clientCompany: pr.clients?.company,
        status: pr.status,
        createdAt: pr.updated_at || pr.created_at,
      })),
    },
  ];

  return (
    <div className="pipeline-board">
      {columns.map((col) => (
        <div key={col.id} className="pipeline-col">
          <div className="col-header" style={{ borderTopColor: col.color }}>
            <div>
              <h3 className="col-title">{col.title}</h3>
              <span className="col-sub">{col.subtitle}</span>
            </div>
            <span className="col-count" style={{ background: `${col.color}22`, color: col.color }}>
              {col.items.length}
            </span>
          </div>

          <div className="col-cards-list">
            {col.items.map((item) => {
              const days = daysSince(item.createdAt);
              const isLoading = loadingId === item.id;

              return (
                <div key={item.id} className={`pipeline-card ${isLoading ? "is-loading" : ""}`}>
                  <div className="card-top">
                    <a
                      href={item.type === "proposal" ? `/admin/proposals/${item.id}` : `/admin/projects/${item.id}`}
                      className="item-title"
                    >
                      {item.title}
                    </a>
                    <span className="days-badge">hace {days}d</span>
                  </div>

                  <div className="client-line">
                    👤 {item.clientName} {item.clientCompany ? `(${item.clientCompany})` : ""}
                  </div>

                  {item.amount !== undefined && item.amount > 0 && (
                    <div className="amount-tag">
                      {formatMoney(item.amount, item.currency)}
                    </div>
                  )}

                  {/* Acciones de transición rápida */}
                  <div className="card-actions-bar">
                    {item.type === "proposal" && item.status === "active" && (
                      <button
                        type="button"
                        onClick={() => updateProposalStatus(item.id, "accepted")}
                        disabled={isLoading}
                        className="btn-move"
                      >
                        ✓ Marcar Aceptada
                      </button>
                    )}

                    {item.type === "proposal" && item.status === "accepted" && (
                      <a href={`/admin/proposals/${item.id}`} className="btn-move">
                        Ver Proyecto →
                      </a>
                    )}

                    {item.type === "project" && item.status === "active" && (
                      <button
                        type="button"
                        onClick={() => updateProjectStatus(item.id, "finished")}
                        disabled={isLoading}
                        className="btn-move highlight"
                      >
                        ★ Marcar Terminado
                      </button>
                    )}

                    {item.type === "project" && item.status === "finished" && (
                      <a href={`/admin/projects/${item.id}`} className="btn-move content-btn">
                        ✨ Contenido
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {col.items.length === 0 && (
              <div className="col-empty">Sin elementos en esta etapa</div>
            )}
          </div>
        </div>
      ))}

      <style>{`
        .pipeline-board {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          overflow-x: auto;
          padding-bottom: 1rem;
        }

        @media (min-width: 768px) {
          .pipeline-board {
            grid-template-columns: repeat(4, minmax(260px, 1fr));
          }
        }

        .pipeline-col {
          background: var(--adm-card, #18261E);
          border: 1px solid var(--adm-border, #24352A);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          min-height: 480px;
        }

        .col-header {
          padding: 1rem 1.25rem;
          border-top: 3px solid #85968B;
          border-bottom: 1px solid var(--adm-border, #24352A);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-radius: 12px 12px 0 0;
          background: rgba(0, 0, 0, 0.15);
        }

        .col-title {
          margin: 0;
          font-size: 0.92rem;
          font-weight: 800;
          color: var(--adm-ink, #F4F6F2);
        }

        .col-sub {
          font-size: 0.75rem;
          color: var(--adm-mute, #85968B);
          display: block;
          margin-top: 0.15rem;
        }

        .col-count {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .col-cards-list {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          flex: 1;
        }

        .pipeline-card {
          background: #111C14;
          border: 1px solid var(--adm-border, #24352A);
          border-radius: 8px;
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .pipeline-card:hover {
          border-color: var(--adm-border-light, #32473A);
          transform: translateY(-2px);
        }

        .pipeline-card.is-loading {
          opacity: 0.5;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .item-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--adm-ink, #F4F6F2);
          text-decoration: none;
          line-height: 1.3;
        }

        .item-title:hover {
          color: var(--adm-lime, #C8FF00);
        }

        .days-badge {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.68rem;
          color: var(--adm-mute, #85968B);
          white-space: nowrap;
        }

        .client-line {
          font-size: 0.78rem;
          color: var(--adm-mute, #85968B);
        }

        .amount-tag {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--adm-lime, #C8FF00);
        }

        .card-actions-bar {
          display: flex;
          justify-content: flex-end;
          gap: 0.4rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .btn-move {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--adm-border, #24352A);
          color: var(--adm-ink, #F4F6F2);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .btn-move:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: var(--adm-ink);
        }

        .btn-move.highlight {
          background: rgba(200, 255, 0, 0.15);
          border-color: var(--adm-lime);
          color: var(--adm-lime);
        }

        .btn-move.content-btn {
          background: rgba(151, 188, 98, 0.2);
          color: #97BC62;
          border-color: #97BC62;
        }

        .col-empty {
          text-align: center;
          color: var(--adm-mute, #85968B);
          font-size: 0.8rem;
          padding: 2rem 0.5rem;
          border: 1px dashed rgba(255, 255, 255, 0.06);
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
