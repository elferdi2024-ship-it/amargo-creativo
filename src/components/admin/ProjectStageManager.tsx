// filepath: src/components/admin/ProjectStageManager.tsx
import { useState } from "react";
import type { ProjectStage } from "../../lib/stages";

interface Props {
  projectId: string;
  initialStages: ProjectStage[];
  initialCurrentStage?: number;
  initialStatus?: string;
}

export default function ProjectStageManager({
  projectId,
  initialStages,
  initialCurrentStage = 1,
  initialStatus = "active",
}: Props) {
  const [stages, setStages] = useState<ProjectStage[]>(initialStages || []);
  const [status, setStatus] = useState(initialStatus);
  const [newStageName, setNewStageName] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function saveChanges(updatedStages: ProjectStage[], updatedStatus = status) {
    setPending(true);
    setFeedback(null);

    // Determinar etapa actual (la primera en status 'current' o el primer 'pending')
    const currentIdx = updatedStages.findIndex((s) => s.status === "current");
    const currentStageNum = currentIdx >= 0 ? updatedStages[currentIdx].id : 1;

    try {
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projectId,
          stages: updatedStages,
          current_stage: currentStageNum,
          status: updatedStatus,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setFeedback("Etapas actualizadas correctamente");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback("Error al guardar: " + (data.message || "Error desconocido"));
      }
    } catch {
      setFeedback("Error de conexión");
    } finally {
      setPending(false);
    }
  }

  function setStageStatus(index: number, newStatus: "pending" | "current" | "done") {
    const updated = stages.map((stage, i) => {
      if (i === index) {
        return { ...stage, status: newStatus, updated_at: new Date().toISOString() };
      }
      // Si ponemos una como 'current', las anteriores hechas quedan 'done' si se desea
      return stage;
    });

    setStages(updated);
    saveChanges(updated);
  }

  function addStage(e: React.FormEvent) {
    e.preventDefault();
    if (!newStageName.trim()) return;

    const newId = (stages.length > 0 ? Math.max(...stages.map((s) => s.id)) : 0) + 1;
    const updated = [
      ...stages,
      {
        id: newId,
        name: newStageName.trim(),
        status: "pending" as const,
      },
    ];

    setStages(updated);
    setNewStageName("");
    saveChanges(updated);
  }

  function removeStage(index: number) {
    const updated = stages.filter((_, i) => i !== index);
    setStages(updated);
    saveChanges(updated);
  }

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    saveChanges(stages, newStatus);
  }

  return (
    <div className="stage-manager">
      <div className="manager-header">
        <div>
          <h3 className="manager-title">Progreso de Etapas</h3>
          <p className="manager-desc">
            Haz clic en los botones de estado para cambiar el avance en tiempo real. Estos cambios se reflejan inmediatamente en el portal del cliente.
          </p>
        </div>

        <div className="status-selector">
          <label>Estado del Proyecto:</label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="select-status"
            disabled={pending}
          >
            <option value="active">Activo</option>
            <option value="paused">En Pausa</option>
            <option value="finished">Finalizado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {feedback && <div className="feedback-toast">{feedback}</div>}

      <div className="stages-list">
        {stages.map((stage, idx) => (
          <div key={stage.id} className={`stage-card status-${stage.status}`}>
            <div className="stage-num">{idx + 1}</div>
            <div className="stage-name-box">
              <strong>{stage.name}</strong>
              <span className="stage-meta">
                {stage.status === "done" ? "✓ Completado" : stage.status === "current" ? "● En curso" : "○ Pendiente"}
              </span>
            </div>

            <div className="stage-actions">
              <button
                type="button"
                className={`btn-pill ${stage.status === "done" ? "active done" : ""}`}
                onClick={() => setStageStatus(idx, "done")}
                disabled={pending}
                title="Marcar completada"
              >
                Completada
              </button>
              <button
                type="button"
                className={`btn-pill ${stage.status === "current" ? "active current" : ""}`}
                onClick={() => setStageStatus(idx, "current")}
                disabled={pending}
                title="Marcar en curso"
              >
                En curso
              </button>
              <button
                type="button"
                className={`btn-pill ${stage.status === "pending" ? "active pending" : ""}`}
                onClick={() => setStageStatus(idx, "pending")}
                disabled={pending}
                title="Marcar pendiente"
              >
                Pendiente
              </button>
              <button
                type="button"
                className="btn-del"
                onClick={() => removeStage(idx)}
                title="Eliminar etapa"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={addStage} className="add-stage-form">
        <input
          type="text"
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          placeholder="+ Añadir nueva etapa personalizada..."
          className="input-new-stage"
        />
        <button type="submit" className="btn-add-stage" disabled={pending || !newStageName.trim()}>
          Añadir Etapa
        </button>
      </form>

      <style>{`
        .stage-manager {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .manager-title {
          margin: 0 0 0.25rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--adm-ink, #F4F6F2);
        }

        .manager-desc {
          margin: 0;
          font-size: 0.85rem;
          color: var(--adm-mute, #85968B);
          max-width: 500px;
        }

        .status-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--adm-mute);
        }

        .select-status {
          background: #101A13;
          border: 1px solid var(--adm-border, #24352A);
          color: var(--adm-ink, #F4F6F2);
          padding: 0.4rem 0.65rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-family: inherit;
        }

        .feedback-toast {
          background: rgba(200, 255, 0, 0.15);
          border: 1px solid var(--adm-lime, #C8FF00);
          color: var(--adm-lime, #C8FF00);
          padding: 0.5rem 0.85rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .stages-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .stage-card {
          background: #121E16;
          border: 1px solid var(--adm-border, #24352A);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: border-color 0.15s ease;
        }

        .stage-card.status-done {
          border-color: rgba(46, 74, 58, 0.8);
        }

        .stage-card.status-current {
          border-color: var(--adm-lime, #C8FF00);
          background: #16261C;
        }

        .stage-num {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--adm-mute);
          width: 20px;
        }

        .stage-name-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .stage-name-box strong {
          font-size: 0.92rem;
          color: var(--adm-ink);
        }

        .stage-meta {
          font-size: 0.75rem;
          color: var(--adm-mute);
        }

        .status-done .stage-meta { color: #97BC62; }
        .status-current .stage-meta { color: var(--adm-lime); font-weight: 600; }

        .stage-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .btn-pill {
          background: transparent;
          border: 1px solid var(--adm-border, #24352A);
          color: var(--adm-mute);
          font-size: 0.72rem;
          padding: 0.25rem 0.55rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .btn-pill:hover {
          color: var(--adm-ink);
          border-color: var(--adm-ink);
        }

        .btn-pill.active.done {
          background: rgba(151, 188, 98, 0.2);
          border-color: #97BC62;
          color: #97BC62;
          font-weight: 700;
        }

        .btn-pill.active.current {
          background: rgba(200, 255, 0, 0.2);
          border-color: var(--adm-lime);
          color: var(--adm-lime);
          font-weight: 700;
        }

        .btn-pill.active.pending {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--adm-mute);
          color: var(--adm-ink);
        }

        .btn-del {
          background: none;
          border: none;
          color: var(--adm-mute);
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0.25rem 0.4rem;
        }

        .btn-del:hover {
          color: var(--adm-danger, #EF4444);
        }

        .add-stage-form {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .input-new-stage {
          flex: 1;
          background: #101A13;
          border: 1px solid var(--adm-border, #24352A);
          color: var(--adm-ink);
          padding: 0.55rem 0.85rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-family: inherit;
        }

        .input-new-stage:focus {
          outline: none;
          border-color: var(--adm-lime);
        }

        .btn-add-stage {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--adm-border, #24352A);
          color: var(--adm-ink);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.55rem 1rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-add-stage:hover:not(:disabled) {
          background: var(--adm-lime);
          color: #141E18;
          border-color: var(--adm-lime);
        }

        .btn-add-stage:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
