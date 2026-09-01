// filepath: src/components/admin/ContractGenerator.tsx
import { useState, useEffect } from "react";
import { DEFAULT_TEMPLATES, renderContract, type ContractTemplate } from "../../lib/contracts";

interface ProposalOption {
  id: string;
  project_title: string;
  slug: string;
  status: string;
  client_id?: string;
  clients?: { name: string; email?: string; phone?: string; company?: string };
  investment?: any;
  timeline?: string;
  solution?: string;
  challenge?: string;
  includes?: string[];
  excludes?: string[];
  accepted_at?: string;
  accepted_name?: string;
  accepted_contact?: string;
}

interface Props {
  proposals: ProposalOption[];
  templates?: ContractTemplate[];
  defaultProposalId?: string;
  defaultTemplateName?: string;
}

export default function ContractGenerator({
  proposals = [],
  templates = DEFAULT_TEMPLATES,
  defaultProposalId = "",
  defaultTemplateName = "",
}: Props) {
  const allTemplates = templates.length > 0 ? templates : DEFAULT_TEMPLATES;

  const [selectedProposalId, setSelectedProposalId] = useState(
    defaultProposalId || (proposals[0]?.id || "")
  );
  const [selectedTemplateName, setSelectedTemplateName] = useState(
    defaultTemplateName || (allTemplates[0]?.name || "")
  );

  const [renderedContent, setRenderedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [docFeedback, setDocFeedback] = useState<string | null>(null);

  // Recalcular contrato cuando cambia propuesta o plantilla
  useEffect(() => {
    const prop = proposals.find((p) => p.id === selectedProposalId);
    const tmpl = allTemplates.find((t) => t.name === selectedTemplateName);

    if (prop && tmpl) {
      const generated = renderContract(tmpl.content, prop);
      setRenderedContent(generated);
    } else if (tmpl) {
      setRenderedContent(tmpl.content);
    }
  }, [selectedProposalId, selectedTemplateName, proposals]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(renderedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  function handleDownload() {
    const prop = proposals.find((p) => p.id === selectedProposalId);
    const clientName = prop?.clients?.name || "cliente";
    const filename = `contrato-${clientName.toLowerCase().replace(/\s+/g, "-")}.txt`;

    const blob = new Blob([renderedContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSaveAsDocument() {
    const prop = proposals.find((p) => p.id === selectedProposalId);
    if (!prop) return;

    setSavingDoc(true);
    setDocFeedback(null);

    const clientName = prop.clients?.name || "Cliente";
    const filename = `Contrato Oficial - ${prop.project_title}.txt`;
    const blob = new Blob([renderedContent], { type: "text/plain;charset=utf-8" });
    const file = new File([blob], filename, { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", filename);
    formData.append("type", "contract");
    if (prop.client_id) formData.append("client_id", prop.client_id);
    formData.append("proposal_id", prop.id);
    formData.append("visible_to_client", "true");

    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.ok) {
        setDocFeedback("✓ Contrato guardado en el archivo de Documentos y vinculado a la propuesta.");
        setTimeout(() => setDocFeedback(null), 5000);
      } else {
        setDocFeedback("Error al guardar: " + (data.message || ""));
      }
    } catch {
      setDocFeedback("Error de conexión");
    } finally {
      setSavingDoc(false);
    }
  }

  const currentProposal = proposals.find((p) => p.id === selectedProposalId);
  const currentTemplate = allTemplates.find((t) => t.name === selectedTemplateName);
  const previewUrl = `/admin/contracts/preview?proposal_id=${selectedProposalId}&template_name=${encodeURIComponent(selectedTemplateName)}`;

  return (
    <div className="contract-gen-wrap">
      <div className="gen-controls-grid">
        <div className="control-box">
          <label>1. Propuesta / Proyecto del Cliente</label>
          <select
            value={selectedProposalId}
            onChange={(e) => setSelectedProposalId(e.target.value)}
            className="input-select"
          >
            {proposals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.clients?.name || "Sin cliente"} · {p.project_title} ({p.status})
              </option>
            ))}
          </select>
          {currentProposal && (
            <div className="meta-hint">
              Estado: <span className="highlight">{currentProposal.status}</span> · Aceptado por:{" "}
              {currentProposal.accepted_name || "Pendiente de aceptación"}
            </div>
          )}
        </div>

        <div className="control-box">
          <label>2. Plantilla Legal (AMARGO)</label>
          <select
            value={selectedTemplateName}
            onChange={(e) => setSelectedTemplateName(e.target.value)}
            className="input-select"
          >
            {allTemplates.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          {currentTemplate && <div className="meta-hint">{currentTemplate.description}</div>}
        </div>
      </div>

      {docFeedback && <div className="feedback-banner">{docFeedback}</div>}

      <div className="editor-container">
        <div className="editor-header">
          <div className="editor-title-wrap">
            <span className="editor-title">Editor de Contrato / Orden de Servicio</span>
            <span className="editor-sub">Podés ajustar cláusulas puntuales antes de imprimir o guardar</span>
          </div>

          <div className="editor-actions">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener"
              className="btn-action btn-pdf-view"
            >
              📄 Ver Documento Membretado / PDF ↗
            </a>
            <button type="button" onClick={handleCopy} className="btn-action">
              {copied ? "✓ Copiado" : "Copiar texto"}
            </button>
            <button type="button" onClick={handleDownload} className="btn-action">
              Descargar .txt
            </button>
            <button
              type="button"
              onClick={handleSaveAsDocument}
              disabled={savingDoc}
              className="btn-action-primary"
            >
              {savingDoc ? "Guardando..." : "Guardar en Documentos del Proyecto"}
            </button>
          </div>
        </div>

        <textarea
          value={renderedContent}
          onChange={(e) => setRenderedContent(e.target.value)}
          rows={24}
          className="contract-textarea"
        />
      </div>

      <style>{`
        .contract-gen-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .gen-controls-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          background: var(--adm-card, #18261E);
          border: 1px solid var(--adm-border, #24352A);
          border-radius: 12px;
          padding: 1.5rem;
        }

        @media (min-width: 640px) {
          .gen-controls-grid { grid-template-columns: 1fr 1fr; }
        }

        .control-box {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .control-box label {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--adm-mute, #85968B);
          font-weight: 700;
        }

        .input-select {
          background: #101A13;
          border: 1px solid var(--adm-border, #24352A);
          color: var(--adm-ink, #F4F6F2);
          padding: 0.75rem 0.85rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: inherit;
        }

        .input-select:focus {
          outline: none;
          border-color: var(--adm-lime, #C8FF00);
        }

        .meta-hint {
          font-size: 0.8rem;
          color: var(--adm-mute);
          margin-top: 0.25rem;
        }

        .meta-hint .highlight {
          color: var(--adm-lime);
          font-weight: 600;
        }

        .feedback-banner {
          background: rgba(200, 255, 0, 0.15);
          border: 1px solid var(--adm-lime);
          color: var(--adm-lime);
          padding: 0.85rem 1.25rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .editor-container {
          background: var(--adm-card, #18261E);
          border: 1px solid var(--adm-border, #24352A);
          border-radius: 12px;
          overflow: hidden;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--adm-border);
          background: rgba(0, 0, 0, 0.2);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .editor-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .editor-title {
          font-size: 0.98rem;
          font-weight: 800;
          color: var(--adm-ink);
        }

        .editor-sub {
          font-size: 0.78rem;
          color: var(--adm-mute);
        }

        .editor-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .btn-action {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--adm-border);
          color: var(--adm-ink);
          padding: 0.45rem 0.85rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.15s ease;
        }

        .btn-action:hover {
          background: rgba(255, 255, 255, 0.14);
          border-color: var(--adm-ink);
        }

        .btn-pdf-view {
          background: rgba(200, 255, 0, 0.15);
          border-color: var(--adm-lime);
          color: var(--adm-lime);
          font-weight: 700;
        }

        .btn-pdf-view:hover {
          background: rgba(200, 255, 0, 0.25);
          color: #FFFFFF;
        }

        .btn-action-primary {
          background: var(--adm-lime, #C8FF00);
          color: #141E18;
          border: none;
          padding: 0.45rem 1rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-action-primary:hover:not(:disabled) {
          background: #b5e600;
        }

        .btn-action-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .contract-textarea {
          width: 100%;
          background: #0E1611;
          border: none;
          color: #E2E8E4;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.88rem;
          line-height: 1.65;
          padding: 1.5rem;
          box-sizing: border-box;
          resize: vertical;
        }

        .contract-textarea:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
