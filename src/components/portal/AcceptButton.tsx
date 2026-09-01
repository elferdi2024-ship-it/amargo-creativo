// filepath: src/components/portal/AcceptButton.tsx
import { useState } from "react";

interface Plan {
  name: string;
  price?: number;
  featured?: boolean;
  recommended?: boolean;
}

interface Props {
  slug: string;
  status: string;
  planName?: string;
  plans?: Plan[];
  clientName: string;
}

export default function AcceptButton({ slug, status, planName, plans = [], clientName }: Props) {
  const [open, setOpen] = useState(false);
  const defaultSelectedPlan =
    planName ||
    plans.find((p) => p.featured || p.recommended)?.name ||
    plans[0]?.name ||
    "";
  const [selectedPlan, setSelectedPlan] = useState<string>(defaultSelectedPlan);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (status === "accepted") {
    return (
      <button className="btn-primary" disabled>
        ✓ Propuesta aceptada
      </button>
    );
  }

  if (status === "disabled") {
    return (
      <button className="btn-primary" disabled>
        Ya no está disponible
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

      // Redirigir a página de confirmación
      window.location.href = `/p/${slug}/aceptada`;
    } catch {
      setError("Error de conexión. Por favor intentá otra vez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <span>Aceptar propuesta</span>
        {selectedPlan && <span className="plan-tag">· {selectedPlan}</span>}
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar aceptación</h3>
            <p>
              Vas a confirmar el inicio del servicio para <strong>{clientName}</strong>.
            </p>

            {plans.length > 0 && (
              <div className="field-group">
                <label className="field-label">Plan seleccionado</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="modal-select"
                >
                  {plans.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} {p.featured || p.recommended ? "(Recomendado)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="field-group">
              <label className="field-label">Nombre y apellido</label>
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
              <label className="field-label">WhatsApp o Email</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Ej: 099 123 456 o correo@empresa.com"
                required
                className="modal-input"
              />
            </div>

            {error && <p className="modal-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={confirm} disabled={pending}>
                {pending ? "Confirmando…" : "Confirmar y aceptar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1rem;
        }
        .field-label {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #4A554E;
        }
        .modal-input, .modal-select {
          width: 100%;
          padding: 0.75rem 0.85rem;
          border: 1.5px solid #E2E4DC;
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: inherit;
          box-sizing: border-box;
        }
        .modal-input:focus, .modal-select:focus {
          outline: none;
          border-color: #141E18;
        }
        .modal-error {
          color: #DC2626;
          font-size: 0.85rem;
          margin: 0.5rem 0 1rem;
          font-weight: 600;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </>
  );
}
