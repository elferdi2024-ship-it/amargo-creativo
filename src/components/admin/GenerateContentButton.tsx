// filepath: src/components/admin/GenerateContentButton.tsx
import { useState } from "react";

interface Props {
  projectId: string;
  projectTitle?: string;
}

export default function GenerateContentButton({ projectId, projectTitle }: Props) {
  const [loading, setLoading] = useState(false);

  async function generate() {
    const confirmMsg = projectTitle
      ? `¿Generar paquete de contenidos (Case Study, LinkedIn, Instagram, Web) para "${projectTitle}"?`
      : "¿Generar paquete de contenidos para este proyecto?";

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.ok) {
        window.location.href = "/admin/contenido";
      } else {
        alert("Error al generar contenidos: " + (data.message || "Error desconocido"));
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={generate}
      disabled={loading}
      className="btn-gen-content"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
      </svg>
      <span>{loading ? "Generando piezas..." : "Generar Contenido de Marketing"}</span>

      <style>{`
        .btn-gen-content {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: var(--adm-lime, #C8FF00);
          color: #141E18;
          border: none;
          padding: 0.55rem 1rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-gen-content:hover:not(:disabled) {
          background: #b5e600;
          transform: translateY(-1px);
        }

        .btn-gen-content:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
}
