// filepath: src/components/portal/AcceptButton.tsx
import { useState, useEffect } from "react";
import { formatMoney } from "../../lib/format";

interface Plan {
  name: string;
  price?: number;
  original_price?: number;
  period?: string;
  featured?: boolean;
  recommended?: boolean;
  badge?: string;
  description?: string;
  daily_equivalent?: string;
}

interface Props {
  slug: string;
  status: string;
  planName?: string;
  plans?: Plan[];
  clientName: string;
  currency?: string;
}

export default function AcceptButton({
  slug,
  status,
  planName,
  plans = [],
  clientName,
  currency = "UYU",
}: Props) {
  const [open, setOpen] = useState(false);
  const defaultSelectedPlan =
    planName ||
    plans.find((p) => p.featured || p.recommended || p.badge === "RECOMENDADO")?.name ||
    plans[0]?.name ||
    "";
  const [selectedPlan, setSelectedPlan] = useState<string>(defaultSelectedPlan);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  // Sincronizar selección cuando el usuario hace clic en una tarjeta de precio en la página
  useEffect(() => {
    function handlePlanChange(e: any) {
      if (e.detail?.planName) {
        setSelectedPlan(e.detail.planName);
      }
    }
    window.addEventListener("amargo:plan-selected", handlePlanChange as EventListener);
    return () =>
      window.removeEventListener("amargo:plan-selected", handlePlanChange as EventListener);
  }, []);

  const currentPlanObj = plans.find((p) => p.name === selectedPlan) || plans[0];

  function handleSelectInModal(planNameSelected: string) {
    setSelectedPlan(planNameSelected);
    // Notificar a la página para actualizar visualmente las tarjetas
    window.dispatchEvent(
      new CustomEvent("amargo:plan-selected", {
        detail: { planName: planNameSelected },
      })
    );
  }

  if (status === "accepted") {
    return (
      <button className="btn-primary btn-accepted-state" disabled>
        <span>✓ Propuesta Aceptada e Iniciada</span>
      </button>
    );
  }

  if (status === "disabled") {
    return (
      <button className="btn-primary" disabled>
        <span>Ya no está disponible</span>
      </button>
    );
  }

  async function confirm() {
    if (!name.trim() || !contact.trim()) {
      setError("Por favor completá tu nombre y una vía de contacto (WhatsApp o Email).");
      return;
    }
    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/accept-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: name.trim(),
          contact: contact.trim(),
          plan: selectedPlan || undefined,
        }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(
          data.reason === "disabled"
            ? "Esta propuesta ya no está disponible."
            : "No se pudo procesar la aceptación. Intentá nuevamente."
        );
        return;
      }

      // Redirigir a página de confirmación o recargar propuesta con estado aceptado
      window.location.href = `/p/${slug}/aceptada`;
    } catch {
      setError("Error de conexión. Por favor intentá otra vez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="accept-cta-container">
        <button
          className="btn-primary btn-accept-main"
          onClick={() => setOpen(true)}
          type="button"
        >
          <div className="btn-accept-body">
            <div className="btn-main-title">
              <span>Aceptar propuesta</span>
              {selectedPlan && (
                <span className="btn-plan-badge">· {selectedPlan}</span>
              )}
            </div>

            {currentPlanObj?.price ? (
              <div className="btn-sub-pricing font-mono">
                <span>
                  {formatMoney(currentPlanObj.price, currency)}
                  {currentPlanObj.period ? ` ${currentPlanObj.period}` : ""}
                </span>
                {currentPlanObj.daily_equivalent && (
                  <span className="btn-daily-badge">
                    ({currentPlanObj.daily_equivalent})
                  </span>
                )}
              </div>
            ) : null}
          </div>

          <div className="btn-accept-arrow">
            <span>→</span>
          </div>
        </button>

        <div className="accept-sub-hint">
          <span>
            💡 Podés cambiar de plan haciendo clic en cualquiera de las tarjetas de arriba o en el formulario.
          </span>
        </div>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-box-pro" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-badge font-mono">CONFIRMACIÓN OFICIAL</div>
              <h3 className="modal-title">Aceptar Propuesta Comercial</h3>
              <p className="modal-desc">
                Confirmá el inicio del proyecto para <strong>{clientName}</strong>. Al aceptar, generamos el contrato oficial y coordinamos el kick-off inmediato.
              </p>
            </div>

            {plans.length > 0 && (
              <div className="plan-selection-group">
                <label className="modal-label">Plan seleccionado por el cliente</label>
                <div className="modal-plans-list">
                  {plans.map((p) => {
                    const isPicked = p.name === selectedPlan;
                    return (
                      <div
                        key={p.name}
                        onClick={() => handleSelectInModal(p.name)}
                        className={`modal-plan-row ${isPicked ? "picked" : ""}`}
                      >
                        <div className="plan-row-left">
                          <span className={`plan-radio-circle ${isPicked ? "radio-active" : ""}`}>
                            {isPicked && <span className="radio-inner"></span>}
                          </span>
                          <div>
                            <strong className="plan-row-name">{p.name}</strong>
                            {p.badge && (
                              <span className="plan-row-badge">{p.badge}</span>
                            )}
                          </div>
                        </div>
                        <div className="plan-row-right">
                          <span className="plan-row-price">
                            {formatMoney(p.price || 0, currency)}
                          </span>
                          {p.period && <span className="plan-row-period">{p.period}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentPlanObj && (
              <div className="selected-plan-summary-box">
                <div className="summary-col">
                  <span className="sum-label">INVERSIÓN MENSUAL ACORDADA</span>
                  <span className="sum-val font-mono">
                    {formatMoney(currentPlanObj.price || 0, currency)} {currentPlanObj.period || "UYU/mes"}
                  </span>
                </div>
                {currentPlanObj.daily_equivalent && (
                  <div className="summary-col-right">
                    <span className="sum-daily-chip">{currentPlanObj.daily_equivalent}</span>
                  </div>
                )}
              </div>
            )}

            <div className="modal-inputs-block">
              <div className="field-group">
                <label className="modal-label">Tu Nombre y Apellido (Titular / Responsable)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Marcelo García"
                  autoComplete="name"
                  required
                  className="modal-input"
                />
              </div>

              <div className="field-group">
                <label className="modal-label">WhatsApp o Email de Contacto</label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Ej: 099 123 456 o contacto@empresa.uy"
                  required
                  className="modal-input"
                />
              </div>
            </div>

            {error && <p className="modal-error-msg">⚠️ {error}</p>}

            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal-confirm"
                onClick={confirm}
                disabled={pending}
              >
                {pending ? "Generando contrato e iniciando…" : `Confirmar y Aceptar (${selectedPlan})`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .accept-cta-container {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          width: 100%;
        }

        .btn-accept-main {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          background: #2E5339 !important;
          color: #FFFFFF !important;
          padding: 0.85rem 1.45rem !important;
          border: none !important;
          border-radius: 14px !important;
          cursor: pointer !important;
          width: 100% !important;
          height: auto !important;
          min-height: 64px !important;
          box-shadow: 0 6px 20px rgba(46, 83, 57, 0.28) !important;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
          box-sizing: border-box !important;
          text-align: left !important;
        }

        .btn-accept-main:hover {
          background: #23422D !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 28px rgba(46, 83, 57, 0.38) !important;
        }

        .btn-accept-body {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .btn-main-title {
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: clamp(1rem, 2.5vw, 1.12rem);
          font-weight: 700;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
          line-height: 1.25;
        }

        .btn-plan-badge {
          color: #D4FF00;
          font-weight: 800;
        }

        .btn-sub-pricing {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.82);
          font-weight: 600;
          flex-wrap: wrap;
        }

        .btn-daily-badge {
          color: #D4FF00;
          opacity: 0.9;
        }

        .btn-accept-arrow {
          font-size: 1.35rem;
          color: #D4FF00;
          margin-left: 0.75rem;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }

        .btn-accept-main:hover .btn-accept-arrow {
          transform: translateX(4px);
        }

        .btn-accepted-state {
          background: #141E18 !important;
          color: #D4FF00 !important;
          cursor: default !important;
          box-shadow: none !important;
          font-size: 1rem !important;
          min-height: 52px !important;
          justify-content: center !important;
        }

        .accept-sub-hint {
          font-size: 0.78rem;
          color: #6C776E;
          text-align: center;
          padding: 0 0.5rem;
          line-height: 1.4;
        }

        /* MODAL DIALOG */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(13, 21, 16, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          z-index: 9999;
          animation: modalFade 0.2s ease;
        }

        @keyframes modalFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-box-pro {
          background: #FFFFFF;
          border: 1.5px solid #E2E4DC;
          border-radius: 20px;
          padding: clamp(1.5rem, 4vw, 2.25rem);
          max-width: 34rem;
          width: 100%;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
          animation: modalSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes modalSlide {
          from { transform: translateY(16px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .modal-head {
          margin-bottom: 1.35rem;
        }

        .modal-badge {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #2E5339;
          background: rgba(46, 83, 57, 0.1);
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .modal-title {
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: 1.45rem;
          font-weight: 800;
          color: #141E18;
          margin: 0 0 0.4rem;
          letter-spacing: -0.025em;
        }

        .modal-desc {
          font-size: 0.88rem;
          color: #55665B;
          line-height: 1.45;
          margin: 0;
        }

        .modal-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #384A3E;
          display: block;
          margin-bottom: 0.45rem;
        }

        .plan-selection-group {
          margin-bottom: 1.15rem;
        }

        .modal-plans-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .modal-plan-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.95rem;
          border: 1.5px solid #E2E4DC;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          background: #FAFAF8;
        }

        .modal-plan-row:hover {
          border-color: #97A69C;
          background: #FFFFFF;
        }

        .modal-plan-row.picked {
          border-color: #2E5339;
          background: #EEF4E8;
          box-shadow: 0 2px 8px rgba(46, 83, 57, 0.08);
        }

        .plan-row-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .plan-radio-circle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid #B0BCB4;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .plan-radio-circle.radio-active {
          border-color: #2E5339;
          background: #2E5339;
        }

        .radio-inner {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FFFFFF;
        }

        .plan-row-name {
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: 0.92rem;
          color: #141E18;
        }

        .plan-row-badge {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          background: #2E5339;
          color: #FFFFFF;
          margin-left: 0.4rem;
        }

        .plan-row-right {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .plan-row-price {
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-weight: 700;
          font-size: 0.98rem;
          color: #141E18;
        }

        .plan-row-period {
          font-size: 0.72rem;
          color: #6C776E;
        }

        .selected-plan-summary-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #141E18;
          color: #FFFFFF;
          padding: 0.85rem 1.15rem;
          border-radius: 12px;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .sum-label {
          display: block;
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          color: #A3B8AC;
          font-weight: 700;
        }

        .sum-val {
          font-size: 1.05rem;
          font-weight: 800;
          color: #D4FF00;
        }

        .sum-daily-chip {
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          background: rgba(212, 255, 0, 0.15);
          color: #D4FF00;
          border: 1px solid rgba(212, 255, 0, 0.3);
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
        }

        .modal-inputs-block {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .modal-input {
          width: 100%;
          padding: 0.8rem 0.95rem;
          border: 1.5px solid #D5D6CC;
          border-radius: 10px;
          font-size: 0.94rem;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }

        .modal-input:focus {
          outline: none;
          border-color: #2E5339;
          box-shadow: 0 0 0 3px rgba(46, 83, 57, 0.12);
        }

        .modal-error-msg {
          color: #DC2626;
          font-size: 0.84rem;
          margin: 0.25rem 0 1rem;
          font-weight: 700;
        }

        .modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid #ECEBE4;
          flex-wrap: wrap;
        }

        .btn-modal-cancel {
          background: none;
          border: 1.5px solid #D5D6CC;
          color: #4A544D;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 0.7rem 1.15rem;
          border-radius: 10px;
          cursor: pointer;
        }

        .btn-modal-confirm {
          background: #2E5339;
          color: #FFFFFF;
          border: none;
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-weight: 700;
          font-size: 0.94rem;
          padding: 0.75rem 1.45rem;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(46, 83, 57, 0.25);
          transition: all 0.15s ease;
        }

        .btn-modal-confirm:hover {
          background: #23422D;
          transform: translateY(-1px);
        }

        .btn-modal-confirm:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </>
  );
}
