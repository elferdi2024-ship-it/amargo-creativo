// filepath: src/components/admin/ClientModal.tsx
import { useState } from "react";

export interface ClientData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

interface Props {
  initial?: ClientData;
  isOpen?: boolean;
  buttonLabel?: string;
  onSaved?: (client: ClientData) => void;
}

export default function ClientModal({
  initial,
  isOpen = false,
  buttonLabel = "+ Nuevo Cliente",
  onSaved,
}: Props) {
  const [open, setOpen] = useState(isOpen);
  const [form, setForm] = useState<ClientData>({
    id: initial?.id,
    name: initial?.name || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    company: initial?.company || "",
    notes: initial?.notes || "",
  });

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof ClientData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }

    setPending(true);
    setError(null);

    const isEdit = !!form.id;

    try {
      const res = await fetch("/api/admin/clients", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Error al guardar el cliente");
        return;
      }

      setOpen(false);
      if (onSaved) onSaved(data.client || form);
      window.location.reload();
    } catch {
      setError("Error de conexión");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-open-client">
        {buttonLabel}
      </button>

      {open && (
        <div className="client-modal-overlay" onClick={() => setOpen(false)}>
          <div className="client-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{form.id ? "Editar Cliente" : "Nuevo Cliente"}</h3>
              <button type="button" onClick={() => setOpen(false)} className="btn-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="modal-error">{error}</div>}

              <label className="field-block">
                <span>Nombre del Cliente / Contacto *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ej: Marcelo Suárez"
                  required
                  autoFocus
                />
              </label>

              <div className="grid-2">
                <label className="field-block">
                  <span>Empresa / Marca</span>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    placeholder="Ej: Bodega Don Pascual"
                  />
                </label>

                <label className="field-block">
                  <span>Teléfono / WhatsApp</span>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+598 99 123 456"
                  />
                </label>
              </div>

              <label className="field-block">
                <span>Correo Electrónico</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="cliente@empresa.com"
                />
              </label>

              <label className="field-block">
                <span>Notas Internas</span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Información adicional, canal por el que llegó, preferencias..."
                />
              </label>

              <div className="modal-footer">
                <button type="button" onClick={() => setOpen(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" disabled={pending} className="btn-submit">
                  {pending ? "Guardando..." : form.id ? "Actualizar Cliente" : "Crear Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .btn-open-client {
          background: var(--adm-lime, #C8FF00);
          color: #141E18;
          border: none;
          padding: 0.5rem 0.95rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-open-client:hover {
          background: #b5e600;
          transform: translateY(-1px);
        }

        .client-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(14, 22, 17, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 1rem;
        }

        .client-modal-box {
          background: #18261E;
          border: 1px solid #2D4034;
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #24352A;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #F4F6F2;
        }

        .btn-close {
          background: none;
          border: none;
          color: #85968B;
          font-size: 1rem;
          cursor: pointer;
        }

        .modal-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .modal-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid #EF4444;
          color: #EF4444;
          padding: 0.6rem 0.85rem;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .field-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .field-block span {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #85968B;
          font-weight: 600;
        }

        .field-block input, .field-block textarea {
          background: #101A13;
          border: 1px solid #24352A;
          color: #F4F6F2;
          padding: 0.65rem 0.8rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-family: inherit;
        }

        .field-block input:focus, .field-block textarea:focus {
          outline: none;
          border-color: #C8FF00;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .btn-cancel {
          background: transparent;
          border: 1px solid #24352A;
          color: #85968B;
          padding: 0.65rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-submit {
          background: #C8FF00;
          color: #141E18;
          border: none;
          padding: 0.65rem 1.25rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
