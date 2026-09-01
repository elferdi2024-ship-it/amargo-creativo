// filepath: src/components/portal/AcceptButton.tsx
import { useState } from "react";

interface Props {
  slug: string;
  status: string;
  planName?: string;
  clientName: string;
}

export default function AcceptButton({ slug, status, planName, clientName }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (status === "accepted") {
    return (
      <button className="btn-primary" disabled>
        Propuesta aceptada
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
      setError("Completá nombre y un contacto.");
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
          plan: planName,
        }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(
          data.reason === "disabled"
            ? "Esta propuesta ya no está disponible."
            : "No se pudo aceptar. Intentá de nuevo."
        );
        return;
      }

      // Redirigir a página de confirmación
      window.location.href = `/p/${slug}/aceptada`;
    } catch {
      setError("Error de conexión. Intentá otra vez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        Aceptar propuesta
        {planName && <span className="plan-tag">· {planName}</span>}
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar aceptación</h3>
            <p>
              Vas a aceptar la propuesta para <strong>{clientName}</strong>
              {planName && ` · plan ${planName}`}.
            </p>

            <label>
              Nombre y apellido
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
            </label>

            <label>
              Email o WhatsApp
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="tu@email.com o 099..."
                required
              />
            </label>

            {error && <p className="error">{error}</p>}

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
    </>
  );
}
