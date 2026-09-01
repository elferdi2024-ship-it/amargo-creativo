// filepath: src/pages/api/admin/proposals.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { isAuthenticated } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("proposals")
    .select("*, clients(name, company, email, phone)")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      client_id,
      slug,
      project_title,
      status = "draft",
      value_phrase,
      challenge,
      solution,
      includes = [],
      excludes = [],
      investment = { type: "fixed", currency: "USD", amount: 0 },
      timeline,
      roi_table,
      whatsapp_message,
      notes,
    } = body;

    if (!slug || !project_title) {
      return new Response(
        JSON.stringify({ ok: false, message: "Título del proyecto y slug son requeridos" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("proposals")
      .insert({
        client_id: client_id || null,
        slug,
        project_title,
        status,
        value_phrase,
        challenge,
        solution,
        includes,
        excludes,
        investment,
        timeline,
        roi_table,
        whatsapp_message,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating proposal:", error);
      return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id, slug: data.slug }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return new Response(JSON.stringify({ ok: false, message: "ID requerido" }), { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("proposals")
      .update({
        ...fields,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 500 });
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

    const { error } = await supabaseAdmin.from("proposals").delete().eq("id", id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err.message }), { status: 500 });
  }
};
