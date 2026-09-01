// filepath: src/pages/api/admin/documents.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { isAuthenticated } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";
import { uploadToStorage, deleteFromStorage } from "../../../lib/storage";
import { createNotification, messageDocumentUploaded } from "../../../lib/notifications";

export const GET: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*, clients(name), projects(title), proposals(project_title, slug)")
    .order("uploaded_at", { ascending: false });

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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string) || file?.name || "Documento";
    const type = (formData.get("type") as string) || "other";
    const clientId = (formData.get("client_id") as string) || null;
    const projectId = (formData.get("project_id") as string) || null;
    const proposalId = (formData.get("proposal_id") as string) || null;
    const visibleToClient = formData.get("visible_to_client") === "true";

    if (!file) {
      return new Response(JSON.stringify({ ok: false, message: "Archivo no encontrado" }), {
        status: 400,
      });
    }

    const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${Date.now()}_${cleanFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 1. Subir a Supabase Storage
    await uploadToStorage({
      bucket: "documents",
      path: storagePath,
      fileBody: buffer,
      contentType: file.type || "application/octet-stream",
    });

    // 2. Registrar en la base de datos
    const { data: docRecord, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert({
        project_id: projectId || null,
        client_id: clientId || null,
        proposal_id: proposalId || null,
        name: name.trim(),
        type,
        storage_path: storagePath,
        url: null,
        visible_to_client: visibleToClient,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error inserting document:", dbError);
      return new Response(JSON.stringify({ ok: false, message: dbError.message }), { status: 500 });
    }

    // 3. Notificación automática si es visible para el cliente
    if (visibleToClient && clientId) {
      const { data: client } = await supabaseAdmin
        .from("clients")
        .select("name")
        .eq("id", clientId)
        .single();

      await createNotification({
        type: "document_uploaded",
        clientId,
        projectId,
        proposalId,
        message: messageDocumentUploaded(client?.name || "Cliente", name.trim()),
        channel: "whatsapp",
      });
    }

    return new Response(JSON.stringify({ ok: true, document: docRecord }), { status: 200 });
  } catch (err: any) {
    console.error("Document upload error:", err);
    return new Response(JSON.stringify({ ok: false, message: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies, request))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, type, visible_to_client } = body;

    if (!id) {
      return new Response(JSON.stringify({ ok: false, message: "ID requerido" }), { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (visible_to_client !== undefined) updates.visible_to_client = visible_to_client;

    const { data, error } = await supabaseAdmin
      .from("documents")
      .update(updates)
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

    const { data: doc } = await supabaseAdmin
      .from("documents")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (doc?.storage_path) {
      try {
        await deleteFromStorage("documents", [doc.storage_path]);
      } catch (storageErr) {
        console.warn("Storage deletion warning:", storageErr);
      }
    }

    const { error } = await supabaseAdmin.from("documents").delete().eq("id", id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err.message }), { status: 500 });
  }
};
