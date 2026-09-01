// filepath: src/pages/api/accept-proposal.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabase";
import { DEFAULT_STAGES } from "../../lib/stages";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { slug, name, contact, plan } = body;

    if (!slug || !name?.trim() || !contact?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, reason: "missing_fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1. Buscar propuesta
    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .select("*, clients(name)")
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

    if (proposal.status === "disabled") {
      return new Response(
        JSON.stringify({ ok: false, reason: "disabled" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (proposal.status === "accepted") {
      return new Response(
        JSON.stringify({ ok: true, already: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Actualizar propuesta
    const { error: updateError } = await supabaseAdmin
      .from("proposals")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_name: name.trim(),
        accepted_contact: contact.trim(),
        accepted_plan: plan || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposal.id);

    if (updateError) {
      console.error("Error updating proposal:", updateError);
      throw updateError;
    }

    // 3. Crear proyecto asociado si no existe
    const { data: existingProject } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("proposal_id", proposal.id)
      .maybeSingle();

    let projectId = existingProject?.id;

    if (!projectId) {
      const { data: project, error: projectError } = await supabaseAdmin
        .from("projects")
        .insert({
          client_id: proposal.client_id,
          proposal_id: proposal.id,
          title: proposal.project_title,
          status: "active",
          current_stage: 1,
          stages: DEFAULT_STAGES,
          start_date: new Date().toISOString().slice(0, 10),
        })
        .select()
        .single();

      if (projectError) {
        console.error("Error creating project:", projectError);
        throw projectError;
      }
      projectId = project.id;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        projectId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in accept-proposal API:", err);
    return new Response(
      JSON.stringify({ ok: false, reason: "server_error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
