// filepath: src/components/admin/ProposalForm.tsx
import { useState } from "react";
import { generateSlug } from "../../lib/slug";

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface PlanItem {
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

interface Props {
  clients: Client[];
  templates?: any[];
  initial?: any;
  proposalId?: string;
  isEdit?: boolean;
}

export default function ProposalForm({
  clients,
  templates = [],
  initial,
  proposalId,
  isEdit = false,
}: Props) {
  const [form, setForm] = useState({
    client_id: initial?.client_id || "",
    project_title: initial?.project_title || "",
    value_phrase: initial?.value_phrase || "",
    challenge: initial?.challenge || "",
    solution: initial?.solution || "",
    includes: (initial?.includes || []).join("\n"),
    excludes: (initial?.excludes || []).join("\n"),
    investment_type: initial?.investment?.type || "plans",
    amount: initial?.investment?.amount ?? "",
    currency: initial?.investment?.currency || "USD",
    payment_terms: initial?.investment?.paymentTerms || "50% al inicio · 50% contra entrega",
    timeline: initial?.timeline || "",
    whatsapp_message: initial?.whatsapp_message || "",
    notes: initial?.notes || "",
    status: initial?.status || "draft",
    custom_slug: initial?.slug || "",
    cloned_from: initial?.cloned_from || null,
  });

  const [plans, setPlans] = useState<PlanItem[]>(
    initial?.investment?.plans || [
      {
        name: "Vidriera",
        price: 980,
        description: "Presencia digital de alto impacto para abrir el canal.",
        features: ["Landing + 6 secciones", "WhatsApp Commerce en CTAs", "SEO local base", "Entrega en 10 días hábiles"],
        recommended: false,
      },
      {
        name: "Mercado",
        price: 1680,
        description: "El sitio que trabaja como un puesto más del predio.",
        features: ["Directorio de puestos", "Fichas de producto ilimitadas", "Panel de novedades", "SEO técnico + Schema", "Entrega en 16 días hábiles"],
        recommended: true,
      },
      {
        name: "Motor",
        price: 2480,
        description: "Plataforma viva: catálogo, búsqueda y operación diaria.",
        features: ["Todo lo de Mercado", "Búsqueda instantánea", "Horarios y stock por puesto", "Capacitación al equipo", "30 días de ajuste post-lanzamiento"],
        recommended: false,
      },
    ]
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState(initial?.cloned_from || "");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  function update(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSelectTemplate(tplId: string) {
    setSelectedTemplateId(tplId);
    if (!tplId) return;

    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;

    setForm((prev) => ({
      ...prev,
      project_title: tpl.project_title || prev.project_title,
      value_phrase: tpl.value_phrase || "",
      challenge: tpl.challenge || "",
      solution: tpl.solution || "",
      includes: (tpl.includes || []).join("\n"),
      excludes: (tpl.excludes || []).join("\n"),
      investment_type: tpl.investment?.type || "plans",
      amount: tpl.investment?.amount ?? "",
      currency: tpl.investment?.currency || "USD",
      payment_terms: tpl.investment?.paymentTerms || prev.payment_terms,
      timeline: tpl.timeline || "",
      whatsapp_message: tpl.whatsapp_message || "",
      notes: tpl.notes || "",
      cloned_from: tpl.id,
    }));

    if (tpl.investment?.plans && Array.isArray(tpl.investment.plans)) {
      setPlans(tpl.investment.plans);
    }
  }

  function updatePlan(index: number, key: keyof PlanItem, value: any) {
    setPlans((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  }

  function addPlan() {
    setPlans((prev) => [
      ...prev,
      { name: `Plan ${prev.length + 1}`, price: 1000, description: "", features: ["Característica 1"], recommended: false },
    ]);
  }

  function removePlan(index: number) {
    setPlans((prev) => prev.filter((_, i) => i !== index));
  }

  function setRecommendedPlan(index: number) {
    setPlans((prev) =>
      prev.map((p, i) => ({
        ...p,
        recommended: i === index,
      }))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFeedback(null);

    const client = clients.find((c) => c.id === form.client_id);
    const slug = form.custom_slug.trim() || initial?.slug || generateSlug(client?.name || "cliente", form.project_title);

    const payload = {
      id: proposalId,
      client_id: form.client_id || null,
      slug,
      project_title: form.project_title.trim(),
      value_phrase: form.value_phrase.trim() || null,
      challenge: form.challenge.trim() || null,
      solution: form.solution.trim() || null,
      includes: form.includes.split("\n").map((s) => s.trim()).filter(Boolean),
      excludes: form.excludes.split("\n").map((s) => s.trim()).filter(Boolean),
      investment: {
        type: form.investment_type,
        currency: form.currency,
        amount: form.investment_type === "fixed" ? Number(form.amount) || 0 : undefined,
        paymentTerms: form.payment_terms.trim(),
        plans: form.investment_type === "plans" ? plans : undefined,
      },
      timeline: form.timeline.trim() || null,
      whatsapp_message: form.whatsapp_message.trim() || null,
      notes: form.notes.trim() || null,
      status: form.status,
      cloned_from: form.cloned_from,
    };

    try {
      const res = await fetch("/api/admin/proposals", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.ok) {
        setFeedback({ type: "error", msg: data.message || "Error al guardar la propuesta" });
        return;
      }

      setFeedback({ type: "success", msg: "Propuesta guardada correctamente." });

      if (!isEdit && data.id) {
        setTimeout(() => {
          window.location.href = `/admin/proposals/${data.id}`;
        }, 600);
      }
    } catch {
      setFeedback({ type: "error", msg: "Error de red al comunicarse con el servidor." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="adm-form-wrap">
      {feedback && (
        <div className={`adm-alert ${feedback.type === "success" ? "alert-success" : "alert-error"}`}>
          {feedback.msg}
        </div>
      )}

      {/* Selector de Plantilla (Solo en creación) */}
      {!isEdit && templates.length > 0 && (
        <div className="template-picker-card">
          <div className="tpl-picker-header">
            <span className="tpl-picker-tag">⚡ PLANTILLAS REUTILIZABLES</span>
            <span className="tpl-picker-desc">Completá todos los campos en un clic a partir de una propuesta guardada</span>
          </div>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="adm-input tpl-select"
          >
            <option value="">Crear desde cero (Plantilla en blanco)…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                ★ {t.template_name || t.project_title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 1. Datos Principales */}
      <div className="adm-section">
        <h3 className="section-title">1. Cliente y Encabezado</h3>
        <div className="form-grid-2">
          <label className="form-field">
            <span className="field-label">Cliente (Aparece como Título Principal H1) *</span>
            <select
              required
              value={form.client_id}
              onChange={(e) => update("client_id", e.target.value)}
              className="adm-input"
            >
              <option value="">Seleccionar cliente existente…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="field-label">Objetivo del Proyecto (Subtítulo destacado) *</span>
            <input
              required
              value={form.project_title}
              onChange={(e) => update("project_title", e.target.value)}
              placeholder="Ej: Sitio web + WhatsApp Commerce"
              className="adm-input"
            />
          </label>
        </div>

        <div className="form-grid-2">
          <label className="form-field">
            <span className="field-label">Estado</span>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="adm-input"
            >
              <option value="draft">Borrador (Oculto)</option>
              <option value="active">Activo (Visible en Magic Link)</option>
              <option value="accepted">Aceptada</option>
              <option value="rejected">Rechazada</option>
              <option value="disabled">Deshabilitada</option>
            </select>
          </label>

          <label className="form-field">
            <span className="field-label">Slug personalizado (Opcional)</span>
            <input
              value={form.custom_slug}
              onChange={(e) => update("custom_slug", e.target.value)}
              placeholder="Ej: mercado-atlantida"
              className="adm-input font-mono"
            />
          </label>
        </div>

        <label className="form-field">
          <span className="field-label">Frase de Valor / Resumen</span>
          <textarea
            rows={2}
            value={form.value_phrase}
            onChange={(e) => update("value_phrase", e.target.value)}
            placeholder="Tu local abre a las 8. Tu web, nunca cierra. Una vidriera que vende todos los días..."
            className="adm-textarea"
          />
        </label>
      </div>

      {/* 2. Desafío y Solución */}
      <div className="adm-section">
        <h3 className="section-title">2. Diagnóstico y Propuesta</h3>
        <label className="form-field">
          <span className="field-label">01. El Desafío (Situación actual y dolores del cliente)</span>
          <textarea
            rows={4}
            value={form.challenge}
            onChange={(e) => update("challenge", e.target.value)}
            placeholder="Detalla el problema que el cliente está experimentando..."
            className="adm-textarea"
          />
        </label>

        <label className="form-field">
          <span className="field-label">02. La Solución (Enfoque estratégico de Amargo)</span>
          <textarea
            rows={4}
            value={form.solution}
            onChange={(e) => update("solution", e.target.value)}
            placeholder="Describe cómo lo resolveremos con tecnología y diseño de alta conversión..."
            className="adm-textarea"
          />
        </label>
      </div>

      {/* 3. Alcance */}
      <div className="adm-section">
        <h3 className="section-title">3. Alcance del Trabajo</h3>
        <div className="form-grid-2">
          <label className="form-field">
            <span className="field-label">Incluye (Una línea por ítem)</span>
            <textarea
              rows={6}
              value={form.includes}
              onChange={(e) => update("includes", e.target.value)}
              placeholder="Sitio a medida en Astro 5, mobile-first&#10;Home editorial + directorio de puestos&#10;Botón de compra/consulta a WhatsApp&#10;Lanzamiento y capacitación de 60 minutos"
              className="adm-textarea"
            />
          </label>

          <label className="form-field">
            <span className="field-label">No Incluye (Una línea por ítem)</span>
            <textarea
              rows={6}
              value={form.excludes}
              onChange={(e) => update("excludes", e.target.value)}
              placeholder="Fotografía de producto (podemos coordinar sesión aparte)&#10;Gestión diaria de redes o community management&#10;Pasarela de cobro con tarjeta"
              className="adm-textarea"
            />
          </label>
        </div>
      </div>

      {/* 4. Inversión */}
      <div className="adm-section">
        <h3 className="section-title">4. Inversión y Condiciones</h3>
        <div className="form-grid-3">
          <label className="form-field">
            <span className="field-label">Modalidad de Precio</span>
            <select
              value={form.investment_type}
              onChange={(e) => update("investment_type", e.target.value)}
              className="adm-input"
            >
              <option value="plans">Grilla de Planes (Recomendado)</option>
              <option value="fixed">Precio Fijo Único</option>
            </select>
          </label>

          <label className="form-field">
            <span className="field-label">Moneda</span>
            <select
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              className="adm-input"
            >
              <option value="USD">USD (Dólares)</option>
              <option value="UYU">UYU (Pesos Uruguayos)</option>
              <option value="EUR">EUR (Euros)</option>
            </select>
          </label>

          {form.investment_type === "fixed" && (
            <label className="form-field">
              <span className="field-label">Monto Total</span>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                placeholder="1200"
                className="adm-input"
              />
            </label>
          )}
        </div>

        {form.investment_type === "plans" && (
          <div className="plans-editor">
            <div className="plans-editor-header">
              <span className="field-label">Planes de Inversión</span>
              <button type="button" onClick={addPlan} className="btn-add-plan">
                + Añadir Plan
              </button>
            </div>
            <div className="plans-cards-list">
              {plans.map((p, idx) => (
                <div key={idx} className={`plan-edit-card ${p.recommended ? "is-recommended" : ""}`}>
                  <div className="plan-edit-top">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updatePlan(idx, "name", e.target.value)}
                      placeholder="Nombre del Plan (Ej: Mercado)"
                      className="adm-input-sm"
                    />
                    <div className="plan-price-group">
                      <span className="curr">{form.currency}</span>
                      <input
                        type="number"
                        value={p.price}
                        onChange={(e) => updatePlan(idx, "price", Number(e.target.value))}
                        className="adm-input-sm price-input"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecommendedPlan(idx)}
                      className={`btn-tag-rec ${p.recommended ? "active" : ""}`}
                    >
                      {p.recommended ? "★ Sugerido" : "Marcar sugerido"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removePlan(idx)}
                      className="btn-del-plan"
                      title="Eliminar plan"
                    >
                      ✕
                    </button>
                  </div>

                  <input
                    type="text"
                    value={p.description}
                    onChange={(e) => updatePlan(idx, "description", e.target.value)}
                    placeholder="Descripción de valor (Ej: El sitio que trabaja como un puesto más)..."
                    className="adm-input-sm"
                  />

                  <textarea
                    rows={3}
                    value={p.features.join("\n")}
                    onChange={(e) => updatePlan(idx, "features", e.target.value.split("\n"))}
                    placeholder="Características (una por línea)..."
                    className="adm-textarea-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-grid-2" style={{ marginTop: "1rem" }}>
          <label className="form-field">
            <span className="field-label">Condiciones de Pago</span>
            <input
              value={form.payment_terms}
              onChange={(e) => update("payment_terms", e.target.value)}
              placeholder="Ej: 50% al inicio · 50% contra entrega. Transferencia BROU / Santander o Wise."
              className="adm-input"
            />
          </label>

          <label className="form-field">
            <span className="field-label">Plazo de Ejecución</span>
            <input
              value={form.timeline}
              onChange={(e) => update("timeline", e.target.value)}
              placeholder="Ej: Descubrimiento 3 días · Diseño 5 días · Desarrollo 8 días · Lanzamiento"
              className="adm-input"
            />
          </label>
        </div>
      </div>

      {/* 5. WhatsApp & Notas */}
      <div className="adm-section">
        <h3 className="section-title">5. Comunicación y Notas</h3>
        <label className="form-field">
          <span className="field-label">Mensaje de WhatsApp personalizado al dar clic en contactar</span>
          <textarea
            rows={2}
            value={form.whatsapp_message}
            onChange={(e) => update("whatsapp_message", e.target.value)}
            placeholder="Dejar en blanco para usar mensaje por defecto"
            className="adm-textarea"
          />
        </label>

        <label className="form-field">
          <span className="field-label">Notas Internas (Solo visibles para el admin)</span>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Comentarios sobre el cliente, acuerdos de palabra, contexto..."
            className="adm-textarea"
          />
        </label>
      </div>

      {/* Botones de acción */}
      <div className="form-actions">
        <a href="/admin/proposals" className="btn-cancel">
          Cancelar
        </a>
        <button type="submit" disabled={pending} className="btn-save">
          {pending ? "Guardando..." : isEdit ? "Actualizar Propuesta" : "Crear Propuesta y Generar Link"}
        </button>
      </div>

      <style>{`
        .adm-form-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          max-width: 900px;
        }

        .template-picker-card {
          background: #111E16;
          border: 1px solid rgba(200, 255, 0, 0.3);
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .tpl-picker-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .tpl-picker-tag {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--adm-lime);
          letter-spacing: 0.1em;
        }

        .tpl-picker-desc {
          font-size: 0.8rem;
          color: var(--adm-mute);
        }

        .tpl-select {
          border-color: rgba(200, 255, 0, 0.4);
          font-weight: 600;
        }

        .adm-section {
          background: var(--adm-card);
          border: 1px solid var(--adm-border);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .section-title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--adm-ink);
          border-bottom: 1px solid var(--adm-border);
          padding-bottom: 0.75rem;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
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
          .form-grid-3 { grid-template-columns: 1.5fr 1fr 1.5fr; }
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--adm-mute);
          font-weight: 600;
        }

        .adm-input, .adm-textarea {
          background: #101A13;
          border: 1px solid var(--adm-border);
          color: var(--adm-ink);
          padding: 0.75rem 0.9rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: border-color 0.15s ease;
        }

        .adm-input:focus, .adm-textarea:focus {
          outline: none;
          border-color: var(--adm-lime);
        }

        .font-mono { font-family: "JetBrains Mono", monospace; }

        .adm-alert {
          padding: 0.85rem 1.25rem;
          border-radius: 8px;
          font-size: 0.9rem;
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

        /* Plans Editor */
        .plans-editor {
          border: 1px solid var(--adm-border);
          border-radius: 8px;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .plans-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-add-plan {
          background: transparent;
          border: 1px solid var(--adm-border);
          color: var(--adm-lime);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.7rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .plans-cards-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        @media (min-width: 768px) {
          .plans-cards-list { grid-template-columns: repeat(3, 1fr); }
        }

        .plan-edit-card {
          background: #121E16;
          border: 1px solid var(--adm-border);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .plan-edit-card.is-recommended {
          border-color: var(--adm-lime);
        }

        .plan-edit-top {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .plan-price-group {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .plan-price-group .curr {
          font-size: 0.75rem;
          color: var(--adm-mute);
          font-weight: 700;
        }

        .adm-input-sm, .adm-textarea-sm {
          background: #0E1611;
          border: 1px solid var(--adm-border);
          color: var(--adm-ink);
          padding: 0.45rem 0.6rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-family: inherit;
        }

        .adm-input-sm:focus, .adm-textarea-sm:focus {
          outline: none;
          border-color: var(--adm-lime);
        }

        .btn-tag-rec {
          background: transparent;
          border: 1px dashed var(--adm-border);
          color: var(--adm-mute);
          font-size: 0.7rem;
          padding: 0.25rem 0.4rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-tag-rec.active {
          background: rgba(200, 255, 0, 0.2);
          border-color: var(--adm-lime);
          color: var(--adm-lime);
          font-weight: 700;
        }

        .btn-del-plan {
          background: none;
          border: none;
          color: var(--adm-danger);
          cursor: pointer;
          font-size: 0.8rem;
          align-self: flex-end;
        }

        /* Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
        }

        .btn-cancel {
          padding: 0.85rem 1.35rem;
          background: transparent;
          border: 1px solid var(--adm-border);
          color: var(--adm-mute);
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .btn-cancel:hover {
          color: var(--adm-ink);
        }

        .btn-save {
          padding: 0.85rem 1.85rem;
          background: var(--adm-lime);
          color: #141E18;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
        }

        .btn-save:hover {
          background: #b5e600;
          transform: translateY(-1px);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </form>
  );
}
