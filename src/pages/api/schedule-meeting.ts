// filepath: src/pages/api/schedule-meeting.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabase";
import { createNotification } from "../../lib/notifications";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { slug, date, timeRange, meetingType, name, contact, notes, plan } = body;

    if (!slug || !date || !timeRange || !name?.trim() || !contact?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, reason: "missing_fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1. Obtener propuesta
    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .select("*, clients(*)")
      .eq("slug", slug)
      .single();

    if (error || !proposal) {
      return new Response(
        JSON.stringify({ ok: false, reason: "not_found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const meetingData = {
      date,
      time_range: timeRange,
      meeting_type: meetingType || "videocall",
      name: name.trim(),
      contact: contact.trim(),
      notes: notes?.trim() || null,
      plan: plan || proposal.accepted_plan || null,
      scheduled_at: new Date().toISOString(),
    };

    // 2. Guardar reunión en la propuesta (en el campo metadata / notes / meetings)
    const existingMeetings = Array.isArray(proposal.meetings) ? proposal.meetings : [];
    const updatedMeetings = [...existingMeetings, meetingData];

    await supabaseAdmin
      .from("proposals")
      .update({
        meetings: updatedMeetings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposal.id);

    // 3. Crear notificación para el equipo de Amargo
    const clientName = proposal.clients?.name || name.trim();
    const formattedType =
      meetingType === "videocall"
        ? "Videollamada Google Meet"
        : meetingType === "call"
        ? "Llamada WhatsApp"
        : "Reunión Presencial";

    const notifyMsg = `📅 REUNIÓN AGENDADA: ${clientName} coordinó una ${formattedType} para el ${date} en el horario ${timeRange}. Contacto: ${contact.trim()}${plan ? ` · Plan de interés: ${plan}` : ""}.`;

    await createNotification({
      type: "proposal_accepted", // Notificación de alta prioridad
      proposalId: proposal.id,
      clientId: proposal.client_id || null,
      message: notifyMsg,
      channel: "whatsapp",
    });

    // 4. Generar mensaje de WhatsApp para confirmación inmediata
    const waText = `Hola Amargo Creativo, soy ${name.trim()} de ${clientName}. Acabo de coordinar una reunión para el ${date} en el horario ${timeRange} (${formattedType}) para avanzar con el proyecto "${proposal.project_title}".`;
    const waUrl = `https://wa.me/59898300491?text=${encodeURIComponent(waText)}`;

    return new Response(
      JSON.stringify({
        ok: true,
        meeting: meetingData,
        whatsappUrl: waUrl,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Error scheduling meeting:", err);
    return new Response(
      JSON.stringify({ ok: false, reason: "server_error", error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
