// filepath: src/pages/api/admin/projects.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { isAuthenticated } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";
import {
  createNotification,
  messageStageChanged,
  messageProjectFinished,
} from "../../../lib/notifications";

export const GET: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*, clients(name, company), proposals(project_title, slug)")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, status, current_stage, stages, start_date, estimated_end_date } = body;

    if (!id) {
      return new Response(JSON.stringify({ ok: false, message: "ID de proyecto requerido" }), {
        status: 400,
      });
    }

    // Obtener proyecto anterior para detectar cambios
    const { data: prevProject } = await supabaseAdmin
      .from("projects")
      .select("*, clients(name)")
      .eq("id", id)
      .single();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title;
    if (status !== undefined) updates.status = status;
    if (current_stage !== undefined) updates.current_stage = current_stage;
    if (stages !== undefined) updates.stages = stages;
    if (start_date !== undefined) updates.start_date = start_date;
    if (estimated_end_date !== undefined) updates.estimated_end_date = estimated_end_date;

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select("*, clients(name)")
      .single();

    if (error) {
      return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 500 });
    }

    // Disparar notificaciones automáticas si hubo cambio de etapa o finalización
    const clientName = data.clients?.name || "Cliente";

    if (
      current_stage !== undefined &&
      prevProject &&
      prevProject.current_stage !== current_stage &&
      data.stages &&
      data.stages[current_stage - 1]
    ) {
      const stageName = data.stages[current_stage - 1].name;
      await createNotification({
        type: "stage_changed",
        projectId: data.id,
        clientId: data.client_id,
        proposalId: data.proposal_id,
        message: messageStageChanged(clientName, stageName, data.title),
        channel: "whatsapp",
      });
    }

    if (
      status === "finished" &&
      prevProject &&
      prevProject.status !== "finished"
    ) {
      await createNotification({
        type: "project_finished",
        projectId: data.id,
        clientId: data.client_id,
        proposalId: data.proposal_id,
        message: messageProjectFinished(clientName, data.title),
        channel: "whatsapp",
      });
    }

    return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ ok: false, message: "ID requerido" }), { status: 400 });
    }

    const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err.message }), { status: 500 });
  }
};
