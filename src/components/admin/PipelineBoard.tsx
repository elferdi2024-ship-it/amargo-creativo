// filepath: src/components/admin/PipelineBoard.tsx
import { useState } from "react";
import { formatMoney } from "../../lib/format";
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
  planName?: string;
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
      items: colSent.map((p) => {
        const inv = p.investment || {};
        const plans = inv.plans || [];
        const defaultPlan = plans.find((x: any) => x.recommended || x.featured) || plans[0];
        const amount = inv.amount || defaultPlan?.price || 0;
        return {
          id: p.id,
          type: "proposal" as const,
          title: p.project_title,
          clientName: p.clients?.name || "Sin cliente",
          clientCompany: p.clients?.company,
          status: p.status,
          amount,
          currency: inv.currency || "UYU",
          createdAt: p.created_at,
          slug: p.slug,
          planName: defaultPlan?.name,
        };
      }),
    },
    {
      id: "accepted",
      title: "2. Propuesta Aceptada",
      subtitle: "Confirmadas por el cliente",
      color: "#C8FF00",
      items: colAccepted.map((p) => {
        const inv = p.investment || {};
        const plans = inv.plans || [];
        let price = p.accepted_price;
        if (!price && p.accepted_plan && plans.length > 0) {
          const match = plans.find((x: any) => x.name === p.accepted_plan);
          if (match) price = match.price;
        }
        if (!price) price = inv.amount || plans[0]?.price || 0;

        return {
          id: p.id,
          type: "proposal" as const,
          title: p.project_title,
          clientName: p.clients?.name || "Sin cliente",
          clientCompany: p.clients?.company,
          status: p.status,
          amount: price,
          currency: inv.currency || "UYU",
          createdAt: p.accepted_at || p.created_at,
          slug: p.slug,
          planName: p.accepted_plan || "Plan Confirmado",
        };
      }),
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
        amount: pr.budget || 0,
        currency: pr.currency || "UYU",
        createdAt: pr.created_at,
        planName: pr.plan,
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
        amount: pr.budget || 0,
        currency: pr.currency || "UYU",
        createdAt: pr.updated_at || pr.created_at,
        planName: pr.plan,
      })),
    },
  ];

  return (
    <div className="pipeline-board">
      {columns.map((col) => {
        const colTotal = col.items.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        return (
          <div key={col.id} className="pipeline-col">
            <div className="col-header" style={{ borderTopColor: col.color }}>
              <div className="col-header-info">
                <h3 className="col-title">{col.title}</h3>
                <span className="col-sub">{col.subtitle}</span>
                {colTotal > 0 && (
                  <span className="col-total-badge font-mono">
                    Σ {formatMoney(colTotal, "UYU")}
                  </span>
                )}
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

                    {/* Plan Badge & Revenue */}
                    <div className="card-revenue-row">
                      {item.planName && (
                        <span className="card-plan-chip">
                          {item.planName}
                        </span>
                      )}
                      {item.amount !== undefined && item.amount > 0 && (
                        <span className="amount-tag font-mono">
                          {formatMoney(item.amount, item.currency)}
                        </span>
                      )}
                    </div>

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
                          Ver Propuesta & Proyecto →
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
        );
      })}

      <style>{`
        .pipeline-board {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          align-items: start;
        }

        @media (max-width: 1200px) {
          .pipeline-board {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .pipeline-board {
            grid-template-columns: 1fr;
          }
        }

        .pipeline-col {
          background: #F4F6F2;
          border: 1px solid #E1E6DF;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .col-header {
          background: #FFFFFF;
          padding: 1rem 1.15rem;
          border-top: 3px solid transparent;
          border-bottom: 1px solid #E1E6DF;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .col-header-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .col-title {
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: 0.95rem;
          font-weight: 800;
          color: #141E18;
          margin: 0;
        }

        .col-sub {
          font-size: 0.72rem;
          color: #6C776E;
        }

        .col-total-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: #2E5339;
          margin-top: 0.25rem;
        }

        .col-count {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.2rem 0.55rem;
          border-radius: 20px;
          flex-shrink: 0;
        }

        .col-cards-list {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          min-height: 200px;
        }

        .pipeline-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E4DC;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          box-shadow: 0 2px 8px rgba(20, 30, 24, 0.03);
          transition: all 0.15s ease;
        }

        .pipeline-card:hover {
          border-color: #2E5339;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(20, 30, 24, 0.06);
        }

        .pipeline-card.is-loading {
          opacity: 0.5;
          pointer-events: none;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .item-title {
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          color: #141E18;
          text-decoration: none;
          line-height: 1.35;
        }

        .item-title:hover {
          color: #2E5339;
        }

        .days-badge {
          font-size: 0.65rem;
          color: #8C9990;
          background: #F4F3EE;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          white-space: nowrap;
        }

        .client-line {
          font-size: 0.8rem;
          color: #55665B;
        }

        .card-revenue-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          background: #FAF9F5;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          border: 1px solid #ECEBE4;
        }

        .card-plan-chip {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.65rem;
          font-weight: 700;
          color: #2E5339;
          background: rgba(46, 83, 57, 0.08);
          padding: 0.12rem 0.4rem;
          border-radius: 4px;
        }

        .amount-tag {
          font-weight: 700;
          font-size: 0.84rem;
          color: #141E18;
        }

        .card-actions-bar {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
          padding-top: 0.5rem;
          border-top: 1px solid #F0EFEA;
        }

        .btn-move {
          flex: 1;
          font-family: "Archivo", system-ui, sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          text-align: center;
          padding: 0.4rem 0.5rem;
          border-radius: 6px;
          border: 1px solid #D5D6CC;
          background: #FFFFFF;
          color: #2D3630;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .btn-move:hover {
          background: #2E5339;
          color: #FFFFFF;
          border-color: #2E5339;
        }

        .btn-move.highlight {
          background: #2E5339;
          color: #FFFFFF;
          border-color: #2E5339;
        }

        .btn-move.content-btn {
          background: #141E18;
          color: #D4FF00;
          border-color: #141E18;
        }

        .col-empty {
          text-align: center;
          padding: 2rem 1rem;
          font-size: 0.8rem;
          color: #8C9990;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
