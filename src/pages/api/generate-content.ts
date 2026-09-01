// filepath: src/pages/api/generate-content.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabase";
import { CONTENT_PROMPTS } from "../../lib/content-templates";
import { isAuthenticated } from "../../lib/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return new Response(JSON.stringify({ ok: false, message: "ID de proyecto requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .select(`
        id, title, client_id, proposal_id,
        clients ( name, company ),
        proposals ( challenge, solution, value_phrase, investment )
      `)
      .eq("id", projectId)
      .single();

    if (error || !project) {
      return new Response(JSON.stringify({ ok: false, reason: "not_found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = {
      title: project.title,
      client_name: (project.clients as any)?.name || "Cliente",
      challenge: (project.proposals as any)?.challenge,
      solution: (project.proposals as any)?.solution,
    };

    const types = ["case_study", "linkedin", "instagram", "web", "email"] as const;
    const created = [];

    for (const type of types) {
      const promptGenerator = CONTENT_PROMPTS[type];
      if (!promptGenerator) continue;

      const content = promptGenerator(payload);
      const title = `${type.replace("_", " ").toUpperCase()} – ${project.title}`;

      const { data: piece, error: insertError } = await supabaseAdmin
        .from("content_pieces")
        .insert({
          project_id: projectId,
          proposal_id: project.proposal_id,
          client_id: project.client_id,
          type,
          title,
          content,
          status: "draft",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting content piece:", insertError);
      } else if (piece) {
        created.push(piece);
      }
    }

    return new Response(JSON.stringify({ ok: true, pieces: created }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Generate content error:", err);
    return new Response(JSON.stringify({ ok: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
