// filepath: src/pages/api/project-checkin.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabase";
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

    const now = new Date().toISOString();

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .update({
        last_checkin_at: now,
        health_status: "green",
        updated_at: now,
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ ok: false, message: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, project }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
