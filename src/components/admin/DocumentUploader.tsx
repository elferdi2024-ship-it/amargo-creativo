// filepath: src/components/admin/DocumentUploader.tsx
import { useState } from "react";

interface ClientOption {
  id: string;
  name: string;
}

interface ProjectOption {
  id: string;
  title: string;
  client_id?: string;
}

interface ProposalOption {
  id: string;
  project_title: string;
  client_id?: string;
}

interface Props {
  clients?: ClientOption[];
  projects?: ProjectOption[];
  proposals?: ProposalOption[];
  defaultClientId?: string;
  defaultProjectId?: string;
  defaultProposalId?: string;
  onUploaded?: () => void;
}

export default function DocumentUploader({
  clients = [],
  projects = [],
  proposals = [],
  defaultClientId = "",
  defaultProjectId = "",
  defaultProposalId = "",
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"contract" | "proposal" | "deliverable" | "brief" | "other">("deliverable");
  const [clientId, setClientId] = useState(defaultClientId);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [proposalId, setProposalId] = useState(defaultProposalId);
  const [visibleToClient, setVisibleToClient] = useState(false);

  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!name) {
        // Remover extension para el display name
        const cleanName = selected.name.replace(/\.[^/.]+$/, "");
        setName(cleanName);
      }
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Por favor selecciona un archivo." });
      return;
    }

    setPending(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name.trim() || file.name);
    formData.append("type", type);
    if (clientId) formData.append("client_id", clientId);
    if (projectId) formData.append("project_id", projectId);
    if (proposalId) formData.append("proposal_id", proposalId);
    formData.append("visible_to_client", String(visibleToClient));

    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage({ type: "error", text: data.message || "Error al subir archivo" });
        return;
      }

      setMessage({ type: "success", text: "Documento subido con éxito a Supabase Storage." });
      setFile(null);
      setName("");
      if (onUploaded) onUploaded();
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch {
      setMessage({ type: "error", text: "Error de red al subir archivo." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="uploader-card">
      <h3 className="uploader-title">Subir Documento o Entregable</h3>
      <p className="uploader-desc">
        Sube contratos en PDF, briefs, manuales de marca o entregables. Puedes decidir si se muestra en el portal público del cliente.
      </p>

      {message && (
        <div className={`uploader-alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          {message.text}
        </div>
      )}

      <div className="dropzone-box">
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          className="file-hidden-input"
          required
        />
        <label htmlFor="file-input" className="file-drop-label">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span className="drop-text">
            {file ? file.name : "Haz clic para seleccionar archivo (PDF, ZIP, DOCX, PNG, etc.)"}
          </span>
          {file && <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>}
        </label>
      </div>

      <div className="form-grid-2">
        <label className="field-group">
          <span>Nombre del documento</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Contrato de Desarrollo Web Firmado"
            required
            className="input-adm"
          />
        </label>

        <label className="field-group">
          <span>Tipo de documento</span>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="input-adm">
            <option value="contract">Contrato / Legal</option>
            <option value="proposal">Propuesta PDF</option>
            <option value="deliverable">Entregable / Activo Final</option>
            <option value="brief">Briefing / Requerimientos</option>
            <option value="other">Otro Documento</option>
          </select>
        </label>
      </div>

      <div className="form-grid-3">
        {clients.length > 0 && (
          <label className="field-group">
            <span>Cliente asociado</span>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="input-adm">
              <option value="">Ninguno</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {proposals.length > 0 && (
          <label className="field-group">
            <span>Propuesta asociada</span>
            <select value={proposalId} onChange={(e) => setProposalId(e.target.value)} className="input-adm">
              <option value="">Ninguna</option>
              {proposals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_title}
                </option>
              ))}
            </select>
          </label>
        )}

        {projects.length > 0 && (
          <label className="field-group">
            <span>Proyecto asociado</span>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input-adm">
              <option value="">Ninguno</option>
              {projects.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="visibility-switch-row">
        <label className="switch-label">
          <input
            type="checkbox"
            checked={visibleToClient}
            onChange={(e) => setVisibleToClient(e.target.checked)}
            className="switch-checkbox"
          />
          <span className="switch-text">
            <strong>Visible para el cliente en el Magic Link</strong>
            <small>Si está activado, el cliente podrá ver y descargar este documento en /p/[slug]</small>
          </span>
        </label>
      </div>

      <div className="uploader-actions">
        <button type="submit" disabled={pending || !file} className="btn-upload">
          {pending ? "Subiendo a Storage..." : "Subir y Guardar Documento"}
        </button>
      </div>

      <style>{`
        .uploader-card {
          background: var(--adm-card, #18261E);
          border: 1px solid var(--adm-border, #24352A);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .uploader-title {
          margin: 0 0 0.25rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--adm-ink, #F4F6F2);
        }

        .uploader-desc {
          margin: 0;
          font-size: 0.85rem;
          color: var(--adm-mute, #85968B);
          line-height: 1.4;
        }

        .dropzone-box {
          border: 2px dashed var(--adm-border, #24352A);
          border-radius: 10px;
          padding: 1.5rem;
          text-align: center;
          background: rgba(0, 0, 0, 0.2);
          transition: border-color 0.15s ease;
        }

        .dropzone-box:hover {
          border-color: var(--adm-lime, #C8FF00);
        }

        .file-hidden-input {
          display: none;
        }

        .file-drop-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: var(--adm-mute, #85968B);
          font-size: 0.9rem;
        }

        .file-drop-label svg {
          color: var(--adm-lime, #C8FF00);
        }

        .drop-text {
          font-weight: 600;
          color: var(--adm-ink, #F4F6F2);
        }

        .file-size {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.75rem;
          color: var(--adm-mute);
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .form-grid-2 { grid-template-columns: 1fr 1fr; }
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .form-grid-3 { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .field-group span {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--adm-mute);
          font-weight: 600;
        }

        .input-adm {
          background: #101A13;
          border: 1px solid var(--adm-border, #24352A);
          color: var(--adm-ink);
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-family: inherit;
        }

        .input-adm:focus {
          outline: none;
          border-color: var(--adm-lime);
        }

        .visibility-switch-row {
          background: #121E16;
          border: 1px solid var(--adm-border);
          border-radius: 8px;
          padding: 0.85rem 1rem;
        }

        .switch-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
        }

        .switch-checkbox {
          margin-top: 0.25rem;
          accent-color: var(--adm-lime, #C8FF00);
          width: 18px;
          height: 18px;
        }

        .switch-text strong {
          display: block;
          font-size: 0.9rem;
          color: var(--adm-ink);
        }

        .switch-text small {
          display: block;
          font-size: 0.78rem;
          color: var(--adm-mute);
        }

        .uploader-actions {
          display: flex;
          justify-content: flex-end;
        }

        .btn-upload {
          background: var(--adm-lime, #C8FF00);
          color: #141E18;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-upload:hover:not(:disabled) {
          background: #b5e600;
          transform: translateY(-1px);
        }

        .btn-upload:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .uploader-alert {
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .alert-success {
          background: rgba(200, 255, 0, 0.15);
          border: 1px solid var(--adm-lime);
          color: var(--adm-lime);
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid var(--adm-danger);
          color: var(--adm-danger);
        }
      `}</style>
    </form>
  );
}
