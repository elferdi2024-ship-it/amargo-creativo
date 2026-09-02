// filepath: src/components/portal/ScheduleMeetingButton.tsx
import { useState, useEffect } from "react";

interface Props {
  slug: string;
  clientName: string;
  projectTitle: string;
  selectedPlanName?: string;
}

export default function ScheduleMeetingButton({
  slug,
  clientName,
  projectTitle,
  selectedPlanName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(selectedPlanName || "");

  // Calendario y Horarios
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("15:00 a 18:00");
  const [customTime, setCustomTime] = useState<string>("");
  const [meetingType, setMeetingType] = useState<string>("videocall");

  // Datos de contacto
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  // Sincronizar el plan si el cliente lo cambia en las tarjetas de la propuesta
  useEffect(() => {
    function handlePlanChange(e: any) {
      if (e.detail?.planName) {
        setCurrentPlan(e.detail.planName);
      }
    }
    window.addEventListener("amargo:plan-selected", handlePlanChange as EventListener);
    return () =>
      window.removeEventListener("amargo:plan-selected", handlePlanChange as EventListener);
  }, []);

  // Generar próximos días hábiles recomendados
  const nextDays = [];
  const now = new Date();
  for (let i = 1; i <= 10; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0) { // Excluir solo domingo
      const iso = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString("es-UY", { weekday: "short" });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString("es-UY", { month: "short" });
      nextDays.push({ iso, label: `${dayName.toUpperCase()} ${dayNum} ${monthName}` });
    }
  }

  // Pre-seleccionar el primer día hábil disponible si no hay seleccionado
  useEffect(() => {
    if (!selectedDate && nextDays.length > 0) {
      setSelectedDate(nextDays[0].iso);
    }
  }, []);

  const timeSlots = [
    { id: "09:00 a 12:00", label: "🌅 Mañana", sub: "09:00 a 12:00" },
    { id: "12:00 a 15:00", label: "☀️ Mediodía", sub: "12:00 a 15:00" },
    { id: "15:00 a 18:00", label: "🌇 Tarde", sub: "15:00 a 18:00" },
    { id: "18:00 a 20:00", label: "🌙 Cierre", sub: "18:00 a 20:00" },
    { id: "custom", label: "⚙️ Otro horario", sub: "A convenir" },
  ];

  async function handleSchedule() {
    if (!selectedDate) {
      setError("Por favor seleccioná una fecha para la reunión.");
      return;
    }
    const finalTimeRange = timeRange === "custom" ? customTime.trim() : timeRange;
    if (!finalTimeRange) {
      setError("Por favor indicá tu margen de horario disponible.");
      return;
    }
    if (!name.trim() || !contact.trim()) {
      setError("Por favor completá tu nombre y WhatsApp o Email de contacto.");
      return;
    }

    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/schedule-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          date: selectedDate,
          timeRange: finalTimeRange,
          meetingType,
          name: name.trim(),
          contact: contact.trim(),
          notes: notes.trim(),
          plan: currentPlan,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "No se pudo agendar la reunión. Intentá nuevamente.");
        return;
      }

      setSuccessData(data);
    } catch (err) {
      setError("Error de conexión. Por favor intentá otra vez.");
    } finally {
      setPending(false);
    }
  }

  function resetAndClose() {
    setOpen(false);
    setSuccessData(null);
    setError("");
  }

  return (
    <>
      <button
        type="button"
        className="btn-schedule-meeting"
        onClick={() => setOpen(true)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>Coordinar Reunión / Kick-off</span>
      </button>

      {open && (
        <div className="modal-overlay" onClick={resetAndClose}>
          <div className="schedule-modal-box" onClick={(e) => e.stopPropagation()}>
            {successData ? (
              <div className="success-view">
                <div className="success-icon-wrap">✓</div>
                <h3 className="success-title">¡Reunión Agendada con Éxito!</h3>
                <p className="success-desc">
                  Coordinamos para el <strong>{selectedDate}</strong> en el margen de{" "}
                  <strong>{timeRange === "custom" ? customTime : timeRange}</strong> con{" "}
                  <strong>{clientName}</strong>.
                </p>

                <div className="success-details-card">
                  <div className="detail-row">
                    <span>Modalidad:</span>
                    <strong>
                      {meetingType === "videocall"
                        ? "📹 Google Meet"
                        : meetingType === "call"
                        ? "📞 Llamada WhatsApp"
                        : "📍 Presencial"}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Contacto:</span>
                    <strong>{contact}</strong>
                  </div>
                  {currentPlan && (
                    <div className="detail-row">
                      <span>Plan de interés:</span>
                      <strong className="plan-tag-success">{currentPlan}</strong>
                    </div>
                  )}
                </div>

                <div className="success-actions">
                  {successData.whatsappUrl && (
                    <a
                      href={successData.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-wa-confirm"
                    >
                      <span>Confirmar al instante por WhatsApp ↗</span>
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn-close-success"
                    onClick={resetAndClose}
                  >
                    Cerrar ventana
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <span className="agenda-badge font-mono">📅 AGENDA DIRECTA AMARGO</span>
                  <h3 className="agenda-title">Coordinar Reunión / Kick-off</h3>
                  <p className="agenda-desc">
                    Elegí el día y tu margen de horarios disponibles. Te confirmamos por WhatsApp en minutos.
                  </p>
                </div>

                <div className="modal-body-scroll">
                  {/* 1. SELECCIONAR DÍA */}
                  <div className="agenda-section">
                    <label className="agenda-label">1. Seleccionar Día</label>
                    <div className="days-scroll-row">
                      {nextDays.map((d) => {
                        const isSelected = selectedDate === d.iso;
                        return (
                          <button
                            type="button"
                            key={d.iso}
                            onClick={() => setSelectedDate(d.iso)}
                            className={`day-pill-btn ${isSelected ? "is-selected" : ""}`}
                          >
                            <span>{d.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="manual-date-row">
                      <span className="manual-date-hint">O ingresá otra fecha:</span>
                      <input
                        type="date"
                        min={todayStr}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-native-input"
                      />
                    </div>
                  </div>

                  {/* 2. MARGEN DE HORARIOS DISPONIBLES */}
                  <div className="agenda-section">
                    <label className="agenda-label">2. Margen de Horarios Disponibles</label>
                    <div className="slots-grid">
                      {timeSlots.map((slot) => {
                        const isPicked = timeRange === slot.id;
                        return (
                          <button
                            type="button"
                            key={slot.id}
                            onClick={() => setTimeRange(slot.id)}
                            className={`slot-card-btn ${isPicked ? "is-picked" : ""}`}
                          >
                            <span className="slot-title">{slot.label}</span>
                            <span className="slot-sub font-mono">{slot.sub}</span>
                          </button>
                        );
                      })}
                    </div>

                    {timeRange === "custom" && (
                      <div className="custom-time-wrap">
                        <input
                          type="text"
                          placeholder="Ej: Entre las 11:30 y 13:00 / Después de las 19:00"
                          value={customTime}
                          onChange={(e) => setCustomTime(e.target.value)}
                          className="agenda-input"
                        />
                      </div>
                    )}
                  </div>

                  {/* 3. FORMATO DE LA REUNIÓN */}
                  <div className="agenda-section">
                    <label className="agenda-label">3. Modalidad</label>
                    <div className="format-toggle-row">
                      <button
                        type="button"
                        onClick={() => setMeetingType("videocall")}
                        className={`format-btn ${meetingType === "videocall" ? "active" : ""}`}
                      >
                        📹 Google Meet
                      </button>
                      <button
                        type="button"
                        onClick={() => setMeetingType("call")}
                        className={`format-btn ${meetingType === "call" ? "active" : ""}`}
                      >
                        📞 Llamada / WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setMeetingType("presencial")}
                        className={`format-btn ${meetingType === "presencial" ? "active" : ""}`}
                      >
                        📍 Presencial
                      </button>
                    </div>
                  </div>

                  {/* 4. DATOS DE CONTACTO */}
                  <div className="agenda-section">
                    <label className="agenda-label">4. Tus Datos de Contacto</label>
                    <div className="inputs-grid">
                      <div className="field-block">
                        <label className="input-sub-label">Nombre y Apellido</label>
                        <input
                          type="text"
                          placeholder="Ej: Fernando Rodríguez"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="agenda-input"
                          required
                        />
                      </div>

                      <div className="field-block">
                        <label className="input-sub-label">WhatsApp o Teléfono</label>
                        <input
                          type="text"
                          placeholder="Ej: 099 300 491"
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          className="agenda-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="field-block" style={{ marginTop: "0.65rem" }}>
                      <label className="input-sub-label">Temas a conversar o dudas previas (opcional)</label>
                      <textarea
                        placeholder="Ej: Queremos consultar sobre los tiempos del catálogo y validar los métodos de pago."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="agenda-textarea"
                        rows={2}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {error && <p className="agenda-error-msg">⚠️ {error}</p>}

                <div className="modal-actions-bar">
                  <button
                    type="button"
                    className="btn-cancel-agenda"
                    onClick={resetAndClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-confirm-agenda"
                    onClick={handleSchedule}
                    disabled={pending}
                  >
                    {pending ? "Agendando…" : "Confirmar Reunión"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .btn-schedule-meeting {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          min-height: 48px;
          height: auto;
          padding: 0.75rem 1.25rem;
          border: 1.5px solid #2E5339;
          border-radius: 12px;
          background: #FFFFFF;
          color: #2E5339;
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          box-sizing: border-box;
          text-align: center;
        }

        .btn-schedule-meeting:hover {
          background: #2E5339;
          color: #FFFFFF;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(46, 83, 57, 0.2);
        }

        /* MODAL WRAPPER */
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
          padding: 1rem;
          z-index: 9999;
          box-sizing: border-box;
          animation: modalFade 0.2s ease;
        }

        @keyframes modalFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .schedule-modal-box {
          background: #FFFFFF;
          border: 1.5px solid #E2E4DC;
          border-radius: 20px;
          padding: clamp(1.25rem, 3.5vw, 1.85rem);
          max-width: 36rem;
          width: 100%;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
          animation: modalSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 88vh;
          height: auto;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          overflow: hidden;
        }

        @keyframes modalSlide {
          from { transform: translateY(16px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .modal-header {
          margin-bottom: 1rem;
          flex-shrink: 0;
        }

        .agenda-badge {
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #2E5339;
          background: rgba(46, 83, 57, 0.1);
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 0.4rem;
        }

        .agenda-title {
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: #141E18;
          margin: 0 0 0.25rem;
          letter-spacing: -0.02em;
        }

        .agenda-desc {
          font-size: 0.84rem;
          color: #55665B;
          margin: 0;
          line-height: 1.4;
        }

        .modal-body-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          padding-right: 0.35rem;
          -webkit-overflow-scrolling: touch;
        }

        .agenda-section {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .agenda-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #2E5339;
        }

        /* Days horizontal row */
        .days-scroll-row {
          display: flex;
          gap: 0.45rem;
          overflow-x: auto;
          padding-bottom: 0.35rem;
          -webkit-overflow-scrolling: touch;
        }

        .day-pill-btn {
          flex-shrink: 0;
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          border: 1.5px solid #D5D6CC;
          background: #F4F3EE;
          color: #2D3630;
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .day-pill-btn:hover {
          border-color: #2E5339;
          background: #FFFFFF;
        }

        .day-pill-btn.is-selected {
          background: #2E5339;
          color: #FFFFFF;
          border-color: #2E5339;
          box-shadow: 0 2px 8px rgba(46, 83, 57, 0.2);
        }

        .manual-date-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .manual-date-hint {
          font-size: 0.74rem;
          color: #6C776E;
        }

        .date-native-input {
          padding: 0.35rem 0.6rem;
          border: 1.5px solid #D5D6CC;
          border-radius: 6px;
          font-size: 0.8rem;
          font-family: inherit;
        }

        /* Slots Grid */
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.45rem;
        }

        .slot-card-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.15rem;
          padding: 0.55rem 0.75rem;
          border: 1.5px solid #E2E4DC;
          border-radius: 8px;
          background: #FAFAF8;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .slot-card-btn:hover {
          border-color: #97A69C;
          background: #FFFFFF;
        }

        .slot-card-btn.is-picked {
          border-color: #2E5339;
          background: #EEF4E8;
          box-shadow: 0 2px 8px rgba(46, 83, 57, 0.08);
        }

        .slot-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #141E18;
        }

        .slot-sub {
          font-size: 0.68rem;
          color: #6C776E;
        }

        .custom-time-wrap {
          margin-top: 0.35rem;
        }

        /* Format toggle */
        .format-toggle-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.45rem;
        }

        @media (max-width: 500px) {
          .format-toggle-row {
            grid-template-columns: 1fr;
          }
        }

        .format-btn {
          padding: 0.55rem 0.65rem;
          border-radius: 8px;
          border: 1.5px solid #E2E4DC;
          background: #FAFAF8;
          font-size: 0.78rem;
          font-weight: 700;
          color: #4A544D;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }

        .format-btn.active {
          background: #141E18;
          color: #D4FF00;
          border-color: #141E18;
        }

        /* Contact inputs */
        .inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
        }

        @media (max-width: 500px) {
          .inputs-grid {
            grid-template-columns: 1fr;
          }
        }

        .field-block {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .input-sub-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #4A544D;
        }

        .agenda-input, .agenda-textarea {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border: 1.5px solid #D5D6CC;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: inherit;
          box-sizing: border-box;
        }

        .agenda-input:focus, .agenda-textarea:focus {
          outline: none;
          border-color: #2E5339;
          box-shadow: 0 0 0 3px rgba(46, 83, 57, 0.12);
        }

        .agenda-error-msg {
          color: #DC2626;
          font-size: 0.82rem;
          margin: 0.5rem 0 0;
          font-weight: 700;
        }

        /* Footer actions */
        .modal-actions-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 0.85rem;
          border-top: 1px solid #ECEBE4;
          flex-shrink: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .btn-cancel-agenda {
          flex: 1;
          background: none;
          border: 1.5px solid #D5D6CC;
          color: #4A544D;
          font-weight: 700;
          font-size: 0.86rem;
          padding: 0.75rem 0.95rem;
          border-radius: 10px;
          cursor: pointer;
          text-align: center;
        }

        .btn-confirm-agenda {
          flex: 2;
          background: #2E5339;
          color: #FFFFFF;
          border: none;
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-weight: 700;
          font-size: 0.92rem;
          padding: 0.75rem 1.15rem;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(46, 83, 57, 0.25);
          transition: all 0.15s ease;
          text-align: center;
        }

        .btn-confirm-agenda:hover {
          background: #23422D;
          transform: translateY(-1px);
        }

        .btn-confirm-agenda:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* SUCCESS VIEW */
        .success-view {
          text-align: center;
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .success-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #2E5339;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          font-weight: 900;
          box-shadow: 0 4px 16px rgba(46, 83, 57, 0.3);
        }

        .success-title {
          font-family: "Space Grotesk", system-ui, sans-serif;
          font-size: 1.45rem;
          font-weight: 800;
          color: #141E18;
          margin: 0;
        }

        .success-desc {
          font-size: 0.9rem;
          color: #4A544D;
          max-width: 28rem;
          line-height: 1.5;
          margin: 0;
        }

        .success-details-card {
          background: #F4F6F2;
          border: 1px solid #D5DED6;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          width: 100%;
          max-width: 26rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin: 0.5rem 0;
          text-align: left;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }

        .plan-tag-success {
          color: #2E5339;
          background: #E0EBDC;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          width: 100%;
          max-width: 26rem;
          margin-top: 0.5rem;
        }

        .btn-wa-confirm {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          background: #25D366;
          color: #FFFFFF;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.92rem;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
          transition: transform 0.15s ease;
        }

        .btn-wa-confirm:hover {
          transform: translateY(-1px);
        }

        .btn-close-success {
          background: none;
          border: 1.5px solid #D5D6CC;
          color: #4A544D;
          padding: 0.65rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
