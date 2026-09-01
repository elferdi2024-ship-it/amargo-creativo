// filepath: src/pages/api/admin/templates.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { isAuthenticated } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";
import { DEFAULT_TEMPLATES } from "../../../lib/contracts";

export const GET: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("contract_templates")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error }), { status: 500 });
  }

  // Si no hay plantillas en BD, devolver las por defecto
  const templates = data && data.length > 0 ? data : DEFAULT_TEMPLATES;
  return new Response(JSON.stringify({ ok: true, data: templates }), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, content, variables = [] } = body;

    if (!name?.trim() || !content?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, message: "Nombre y contenido son obligatorios" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("contract_templates")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        content,
        variables,
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, template: data }), { status: 200 });
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
    const { id, name, description, content, variables } = body;

    if (!id || !name?.trim() || !content?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, message: "ID, nombre y contenido requeridos" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("contract_templates")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        content,
        variables: variables || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, template: data }), { status: 200 });
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

    const { error } = await supabaseAdmin.from("contract_templates").delete().eq("id", id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err.message }), { status: 500 });
  }
};
