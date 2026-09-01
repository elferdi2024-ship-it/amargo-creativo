// filepath: src/pages/api/admin/clients.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { isAuthenticated } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*")
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
    const { name, email, phone, company, notes } = body;

    if (!name?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, message: "El nombre es obligatorio" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert({
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, client: data }), { status: 200 });
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
    const { id, name, email, phone, company, notes } = body;

    if (!id || !name?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, message: "ID y nombre son obligatorios" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("clients")
      .update({
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        notes: notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, client: data }), { status: 200 });
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

    const { error } = await supabaseAdmin.from("clients").delete().eq("id", id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err.message }), { status: 500 });
  }
};
